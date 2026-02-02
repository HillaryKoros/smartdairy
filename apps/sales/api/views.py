"""
Koimeret Dairies - Sales API Views
"""
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum, Count, Avg
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.sales.models import Buyer, Sale, Payment
from apps.health.models import Withdrawal
from .serializers import (
    BuyerSerializer,
    SaleSerializer,
    SaleCreateSerializer,
    PaymentSerializer,
)


class BuyerViewSet(viewsets.ModelViewSet):
    """Buyer management."""
    serializer_class = BuyerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["buyer_type", "is_active"]
    search_fields = ["name", "phone", "email"]
    ordering = ["name"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return Buyer.objects.filter(farm=user.active_farm)
        return Buyer.objects.none()

    def perform_create(self, serializer):
        serializer.save(farm=self.request.user.active_farm)


class SaleViewSet(viewsets.ModelViewSet):
    """Sales management."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["buyer", "channel", "paid_status", "date"]
    search_fields = ["buyer__name", "notes"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = Sale.objects.filter(farm=user.active_farm)
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            return queryset.select_related("buyer", "recorded_by")
        return Sale.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return SaleCreateSerializer
        return SaleSerializer

    def perform_create(self, serializer):
        serializer.save(
            farm=self.request.user.active_farm,
            recorded_by=self.request.user,
        )

    @action(detail=False, methods=["get"])
    def today(self, request):
        """Get today's sales."""
        today = date.today()
        sales = self.get_queryset().filter(date=today)
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get sales summary."""
        queryset = self.get_queryset()
        date_from = request.query_params.get("date_from", date.today() - timedelta(days=30))
        date_to = request.query_params.get("date_to", date.today())

        queryset = queryset.filter(date__gte=date_from, date__lte=date_to)

        summary = queryset.aggregate(
            total_liters=Sum("liters_sold"),
            total_revenue=Sum("total_amount"),
            total_sales=Count("id"),
            avg_price_per_liter=Avg("price_per_liter"),
        )

        # By payment status
        by_status = queryset.values("paid_status").annotate(
            count=Count("id"),
            amount=Sum("total_amount"),
        )

        # Daily breakdown
        daily = queryset.values("date").annotate(
            liters=Sum("liters_sold"),
            revenue=Sum("total_amount"),
        ).order_by("-date")[:30]

        return Response({
            "date_range": {"from": str(date_from), "to": str(date_to)},
            "summary": summary,
            "by_status": list(by_status),
            "daily": list(daily),
        })

    @action(detail=False, methods=["get"])
    def check_withdrawal(self, request):
        """Check if any cows have active withdrawal before sale."""
        today = date.today()
        active_withdrawals = Withdrawal.objects.filter(
            farm=request.user.active_farm,
            is_active=True,
            end_date__gte=today,
            withdrawal_type="milk",
        ).select_related("cow", "treatment")

        if active_withdrawals.exists():
            return Response({
                "has_active_withdrawal": True,
                "message": "There are cows with active milk withdrawal periods",
                "withdrawals": [
                    {
                        "cow_tag": w.cow.tag_number,
                        "cow_name": w.cow.name,
                        "treatment": w.treatment.treatment_name,
                        "end_date": w.end_date,
                        "days_remaining": (w.end_date - today).days,
                    }
                    for w in active_withdrawals
                ],
            })
        return Response({
            "has_active_withdrawal": False,
            "message": "No active withdrawal periods",
        })

    @action(detail=False, methods=["get"])
    def unpaid(self, request):
        """Get unpaid/partial sales."""
        sales = self.get_queryset().filter(paid_status__in=["unpaid", "partial"])
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)


class PaymentViewSet(viewsets.ModelViewSet):
    """Payment management."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["sale", "method", "date"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = Payment.objects.filter(farm=user.active_farm)
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            return queryset
        return Payment.objects.none()

    def perform_create(self, serializer):
        payment = serializer.save(
            farm=self.request.user.active_farm,
            recorded_by=self.request.user,
        )

        # Update sale paid status if linked
        if payment.sale:
            sale = payment.sale
            if sale.amount_paid >= sale.total_amount:
                sale.paid_status = "paid"
            elif sale.amount_paid > 0:
                sale.paid_status = "partial"
            sale.save()
