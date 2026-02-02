"""
Koimeret Dairies - Health API Views
"""
from datetime import date, timedelta

from django.db.models import Max
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.health.models import HealthEvent, Treatment, Withdrawal, Vaccination, VaccinationSchedule
from apps.dairy.models import Cow
from .serializers import (
    HealthEventSerializer,
    TreatmentSerializer,
    TreatmentCreateSerializer,
    WithdrawalSerializer,
    VaccinationSerializer,
    VaccinationScheduleSerializer,
    VaccinationDueSerializer,
)


class HealthEventViewSet(viewsets.ModelViewSet):
    """Health event management."""
    serializer_class = HealthEventSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["cow", "date", "severity", "is_resolved"]
    search_fields = ["symptoms", "diagnosis", "cow__tag_number"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = HealthEvent.objects.filter(farm=user.active_farm)
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            return queryset
        return HealthEvent.objects.none()

    def perform_create(self, serializer):
        serializer.save(
            farm=self.request.user.active_farm,
            reported_by=self.request.user,
        )

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        """Mark health event as resolved."""
        event = self.get_object()
        from django.utils import timezone
        event.is_resolved = True
        event.resolved_at = timezone.now()
        event.save()
        return Response(HealthEventSerializer(event).data)

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get unresolved health events."""
        events = self.get_queryset().filter(is_resolved=False)
        serializer = HealthEventSerializer(events, many=True)
        return Response(serializer.data)


class TreatmentViewSet(viewsets.ModelViewSet):
    """Treatment management."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["cow", "date", "health_event"]
    search_fields = ["treatment_name", "cow__tag_number"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = Treatment.objects.filter(farm=user.active_farm)
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            return queryset
        return Treatment.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return TreatmentCreateSerializer
        return TreatmentSerializer

    def perform_create(self, serializer):
        serializer.save(
            farm=self.request.user.active_farm,
            administered_by=self.request.user,
        )


class WithdrawalViewSet(viewsets.ReadOnlyModelViewSet):
    """Withdrawal tracking (read-only, auto-created from treatments)."""
    serializer_class = WithdrawalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["cow", "withdrawal_type", "is_active"]
    ordering = ["-end_date"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return Withdrawal.objects.filter(farm=user.active_farm)
        return Withdrawal.objects.none()

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get all active withdrawals."""
        from django.utils import timezone
        today = timezone.now().date()

        # Update is_active status
        Withdrawal.objects.filter(
            farm=request.user.active_farm,
            end_date__lt=today,
            is_active=True,
        ).update(is_active=False)

        withdrawals = self.get_queryset().filter(is_active=True, end_date__gte=today)
        serializer = WithdrawalSerializer(withdrawals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def check_cow(self, request):
        """Check if a specific cow has active withdrawal."""
        cow_id = request.query_params.get("cow_id")
        if not cow_id:
            return Response({"error": "cow_id required"}, status=status.HTTP_400_BAD_REQUEST)

        from django.utils import timezone
        today = timezone.now().date()

        withdrawals = self.get_queryset().filter(
            cow_id=cow_id,
            is_active=True,
            end_date__gte=today,
        )

        has_withdrawal = withdrawals.exists()
        return Response({
            "cow_id": cow_id,
            "has_active_withdrawal": has_withdrawal,
            "withdrawals": WithdrawalSerializer(withdrawals, many=True).data if has_withdrawal else [],
        })


class VaccinationViewSet(viewsets.ModelViewSet):
    """Vaccination management."""
    serializer_class = VaccinationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["cow", "date", "vaccine_name"]
    search_fields = ["vaccine_name", "cow__tag_number"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = Vaccination.objects.filter(farm=user.active_farm)
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            return queryset
        return Vaccination.objects.none()

    def perform_create(self, serializer):
        serializer.save(
            farm=self.request.user.active_farm,
            administered_by=self.request.user,
        )

    @action(detail=False, methods=["get"])
    def due(self, request):
        """Get vaccinations due within next N days."""
        days = int(request.query_params.get("days", 7))
        today = date.today()
        due_date = today + timedelta(days=days)

        # Find vaccinations with next_due_date within range
        due_vaccinations = self.get_queryset().filter(
            next_due_date__gte=today,
            next_due_date__lte=due_date,
        ).select_related("cow")

        result = []
        for vacc in due_vaccinations:
            result.append({
                "cow_id": vacc.cow_id if vacc.cow else None,
                "cow_tag": vacc.cow.tag_number if vacc.cow else "Herd",
                "cow_name": vacc.cow.name if vacc.cow else None,
                "vaccine_name": vacc.vaccine_name,
                "last_vaccination_date": vacc.date,
                "due_date": vacc.next_due_date,
                "days_until_due": (vacc.next_due_date - today).days,
            })

        serializer = VaccinationDueSerializer(result, many=True)
        return Response(serializer.data)


class VaccinationScheduleViewSet(viewsets.ModelViewSet):
    """Vaccination schedule templates."""
    serializer_class = VaccinationScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["vaccine_name"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return VaccinationSchedule.objects.filter(farm=user.active_farm)
        return VaccinationSchedule.objects.none()

    def perform_create(self, serializer):
        serializer.save(farm=self.request.user.active_farm)
