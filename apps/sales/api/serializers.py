"""
Koimeret Dairies - Sales API Serializers
"""
from rest_framework import serializers

from apps.sales.models import Buyer, Sale, Payment


class BuyerSerializer(serializers.ModelSerializer):
    buyer_type_display = serializers.CharField(source="get_buyer_type_display", read_only=True)
    outstanding_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Buyer
        fields = [
            "id", "name", "phone", "email", "address",
            "buyer_type", "buyer_type_display", "is_active",
            "credit_limit", "outstanding_balance", "notes",
            "farm", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source="get_method_display", read_only=True)
    recorded_by_name = serializers.CharField(source="recorded_by.full_name", read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = [
            "id", "sale", "date", "method", "method_display",
            "amount", "reference", "payer_phone", "notes",
            "recorded_by", "recorded_by_name", "farm", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class SaleSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source="buyer.name", read_only=True, allow_null=True)
    channel_display = serializers.CharField(source="get_channel_display", read_only=True)
    payment_method_display = serializers.CharField(source="get_payment_method_display", read_only=True)
    paid_status_display = serializers.CharField(source="get_paid_status_display", read_only=True)
    recorded_by_name = serializers.CharField(source="recorded_by.full_name", read_only=True, allow_null=True)
    amount_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id", "date", "buyer", "buyer_name", "channel", "channel_display",
            "liters_sold", "price_per_liter", "total_amount",
            "payment_method", "payment_method_display",
            "paid_status", "paid_status_display",
            "amount_paid", "balance_due", "payments",
            "recorded_by", "recorded_by_name", "notes",
            "withdrawal_override", "withdrawal_approved_by",
            "farm", "sync_status", "created_at"
        ]
        read_only_fields = ["id", "created_at", "total_amount"]


class SaleCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating sales."""

    class Meta:
        model = Sale
        fields = [
            "date", "buyer", "channel", "liters_sold", "price_per_liter",
            "payment_method", "paid_status", "notes"
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["recorded_by"] = request.user
            validated_data["farm"] = request.user.active_farm
        # Calculate total
        validated_data["total_amount"] = (
            validated_data["liters_sold"] * validated_data["price_per_liter"]
        )
        return super().create(validated_data)
