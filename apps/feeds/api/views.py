"""
Koimeret Dairies - Feeds API Views
"""
from datetime import date
from decimal import Decimal

from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.feeds.models import FeedItem, FeedPurchase, FeedUsageLog, InventoryBalance, InventoryMovement
from apps.dairy.models import Cow
from .serializers import (
    FeedItemSerializer,
    FeedPurchaseSerializer,
    FeedUsageLogSerializer,
    FeedUsageCreateSerializer,
    InventoryBalanceSerializer,
    InventoryMovementSerializer,
    QRScanSerializer,
)


class FeedItemViewSet(viewsets.ModelViewSet):
    """Feed item management endpoints."""
    serializer_class = FeedItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name", "qr_code"]
    ordering_fields = ["name", "category", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return FeedItem.objects.filter(farm=user.active_farm).select_related("inventory")
        return FeedItem.objects.none()

    def perform_create(self, serializer):
        serializer.save(farm=self.request.user.active_farm)

    @action(detail=False, methods=["get"])
    def by_qr(self, request):
        """Look up feed item by QR code."""
        qr_code = request.query_params.get("code")
        if not qr_code:
            return Response({"error": "QR code required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            feed_item = self.get_queryset().get(qr_code=qr_code)
            return Response(FeedItemSerializer(feed_item).data)
        except FeedItem.DoesNotExist:
            return Response({"error": "Feed item not found"}, status=status.HTTP_404_NOT_FOUND)


class FeedPurchaseViewSet(viewsets.ModelViewSet):
    """Feed purchase recording."""
    serializer_class = FeedPurchaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["feed_item", "date"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = FeedPurchase.objects.filter(farm=user.active_farm)
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            return queryset
        return FeedPurchase.objects.none()

    def perform_create(self, serializer):
        serializer.save(
            farm=self.request.user.active_farm,
            recorded_by=self.request.user,
        )


class FeedUsageLogViewSet(viewsets.ModelViewSet):
    """Feed usage logging."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["feed_item", "date", "scan_method", "cow"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = FeedUsageLog.objects.filter(farm=user.active_farm)
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            return queryset
        return FeedUsageLog.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return FeedUsageCreateSerializer
        return FeedUsageLogSerializer

    def perform_create(self, serializer):
        serializer.save(
            farm=self.request.user.active_farm,
            logged_by=self.request.user,
        )

    @action(detail=False, methods=["get"])
    def today(self, request):
        """Get today's feed usage."""
        today = date.today()
        logs = self.get_queryset().filter(date=today)
        serializer = FeedUsageLogSerializer(logs, many=True)
        return Response(serializer.data)


class InventoryBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """Inventory balance endpoints (read-only)."""
    serializer_class = InventoryBalanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["feed_item"]
    ordering = ["feed_item__name"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return InventoryBalance.objects.filter(farm=user.active_farm).select_related("feed_item")
        return InventoryBalance.objects.none()

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        """Get items with low stock."""
        queryset = self.get_queryset()
        low_stock_items = [
            inv for inv in queryset if inv.is_low_stock
        ]
        serializer = InventoryBalanceSerializer(low_stock_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get inventory summary."""
        queryset = self.get_queryset()
        summary = {
            "total_items": queryset.count(),
            "low_stock_count": sum(1 for inv in queryset if inv.is_low_stock),
            "total_value": Decimal("0"),
            "by_category": {},
        }

        for inv in queryset.select_related("feed_item"):
            category = inv.feed_item.category
            if category not in summary["by_category"]:
                summary["by_category"][category] = {
                    "count": 0,
                    "items": [],
                }
            summary["by_category"][category]["count"] += 1
            summary["by_category"][category]["items"].append({
                "name": inv.feed_item.name,
                "quantity": inv.quantity_on_hand,
                "unit": inv.unit,
            })

            # Calculate value if cost available
            if inv.feed_item.cost_per_unit:
                summary["total_value"] += inv.quantity_on_hand * inv.feed_item.cost_per_unit

        return Response(summary)


class InventoryMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """Inventory movement history (read-only audit trail)."""
    serializer_class = InventoryMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["feed_item", "movement_type", "date"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return InventoryMovement.objects.filter(farm=user.active_farm)
        return InventoryMovement.objects.none()


class QRScanView(APIView):
    """Handle QR code scanning for quick feed usage logging."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QRScanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        if not user.active_farm:
            return Response(
                {"error": "No active farm"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find feed item by QR code
        try:
            feed_item = FeedItem.objects.get(
                farm=user.active_farm,
                qr_code=data["qr_code"],
            )
        except FeedItem.DoesNotExist:
            return Response(
                {"error": "Feed item not found for QR code"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get optional cow
        cow = None
        if data.get("cow_id"):
            try:
                cow = Cow.objects.get(
                    farm=user.active_farm,
                    id=data["cow_id"],
                )
            except Cow.DoesNotExist:
                pass

        # Create usage log
        usage_log = FeedUsageLog.objects.create(
            farm=user.active_farm,
            feed_item=feed_item,
            date=data.get("date", date.today()),
            quantity=data["quantity"],
            unit=feed_item.unit,
            cow=cow,
            scan_method="qr_scan",
            logged_by=user,
            notes=data.get("notes", ""),
        )

        return Response(
            FeedUsageLogSerializer(usage_log).data,
            status=status.HTTP_201_CREATED
        )
