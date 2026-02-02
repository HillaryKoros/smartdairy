"""
Koimeret Dairies - Dairy API Views
"""
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum, Avg, Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.dairy.models import Cow, CowStatusHistory, MilkLog, MilkProductionSummary
from .serializers import (
    CowSerializer,
    CowListSerializer,
    CowStatusHistorySerializer,
    CowStatusUpdateSerializer,
    MilkLogSerializer,
    MilkLogCreateSerializer,
    MilkLogBulkSerializer,
    MilkProductionSummarySerializer,
)


class CowViewSet(viewsets.ModelViewSet):
    """Cow management endpoints."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "breed", "is_active"]
    search_fields = ["tag_number", "name"]
    ordering_fields = ["tag_number", "name", "created_at", "status"]
    ordering = ["tag_number"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return Cow.objects.filter(farm=user.active_farm)
        return Cow.objects.none()

    def get_serializer_class(self):
        if self.action == "list":
            return CowListSerializer
        return CowSerializer

    def perform_create(self, serializer):
        serializer.save(farm=self.request.user.active_farm)

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        """Update cow status with history tracking."""
        cow = self.get_object()
        serializer = CowStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_status = cow.status
        new_status = serializer.validated_data["to_status"]
        notes = serializer.validated_data.get("notes", "")

        # Create status history record
        CowStatusHistory.objects.create(
            cow=cow,
            from_status=old_status,
            to_status=new_status,
            changed_by=request.user,
            notes=notes,
        )

        # Update cow status
        cow.status = new_status
        cow.save(update_fields=["status", "updated_at"])

        return Response(CowSerializer(cow).data)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        """Get cow status history."""
        cow = self.get_object()
        history = cow.status_history.all()
        serializer = CowStatusHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def milk_logs(self, request, pk=None):
        """Get milk logs for a specific cow."""
        cow = self.get_object()
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        logs = cow.milk_logs.filter(is_latest=True)
        if date_from:
            logs = logs.filter(date__gte=date_from)
        if date_to:
            logs = logs.filter(date__lte=date_to)

        serializer = MilkLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get cow statistics for the farm."""
        queryset = self.get_queryset()
        stats = {
            "total": queryset.count(),
            "by_status": {},
        }
        for status_code, status_label in Cow.STATUS_CHOICES:
            stats["by_status"][status_code] = queryset.filter(status=status_code).count()
        return Response(stats)


class MilkLogViewSet(viewsets.ModelViewSet):
    """Milk logging endpoints."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["cow", "date", "session"]
    ordering_fields = ["date", "created_at"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = MilkLog.objects.filter(farm=user.active_farm, is_latest=True)
            # Date range filtering
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            return queryset
        return MilkLog.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return MilkLogCreateSerializer
        return MilkLogSerializer

    def perform_create(self, serializer):
        serializer.save(
            milked_by=self.request.user,
            farm=self.request.user.active_farm,
        )

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Create multiple milk logs at once (for batch entry)."""
        serializer = MilkLogBulkSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        logs = serializer.save()
        return Response(
            MilkLogSerializer(logs, many=True).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["get"])
    def today(self, request):
        """Get today's milk logs."""
        today = date.today()
        logs = self.get_queryset().filter(date=today)
        serializer = MilkLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get milk production summary."""
        queryset = self.get_queryset()
        date_from = request.query_params.get("date_from", date.today() - timedelta(days=30))
        date_to = request.query_params.get("date_to", date.today())

        queryset = queryset.filter(date__gte=date_from, date__lte=date_to)

        daily_summary = queryset.values("date").annotate(
            total_liters=Sum("liters"),
            cow_count=Count("cow", distinct=True),
        ).order_by("-date")

        totals = queryset.aggregate(
            total_liters=Sum("liters"),
            avg_per_day=Avg("liters"),
            total_logs=Count("id"),
        )

        return Response({
            "date_range": {"from": str(date_from), "to": str(date_to)},
            "totals": totals,
            "daily": list(daily_summary[:30]),
        })


class MilkProductionSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to aggregated production data."""
    serializer_class = MilkProductionSummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["date"]
    ordering = ["-date"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return MilkProductionSummary.objects.filter(farm=user.active_farm)
        return MilkProductionSummary.objects.none()
