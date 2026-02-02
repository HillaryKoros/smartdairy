"""
Koimeret Dairies - Feeds API Serializers
"""
from rest_framework import serializers

from apps.feeds.models import FeedItem, FeedPurchase, FeedUsageLog, InventoryBalance, InventoryMovement


class FeedItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    unit_display = serializers.CharField(source="get_unit_display", read_only=True)
    current_stock = serializers.SerializerMethodField()

    class Meta:
        model = FeedItem
        fields = [
            "id", "name", "category", "category_display", "unit", "unit_display",
            "qr_code", "description", "is_active", "reorder_level", "cost_per_unit",
            "current_stock", "farm", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_current_stock(self, obj):
        if hasattr(obj, "inventory"):
            return {
                "quantity": obj.inventory.quantity_on_hand,
                "unit": obj.inventory.unit,
                "is_low": obj.inventory.is_low_stock,
                "days_remaining": obj.inventory.days_remaining,
            }
        return None


class FeedPurchaseSerializer(serializers.ModelSerializer):
    feed_item_name = serializers.CharField(source="feed_item.name", read_only=True)
    recorded_by_name = serializers.CharField(source="recorded_by.full_name", read_only=True, allow_null=True)

    class Meta:
        model = FeedPurchase
        fields = [
            "id", "feed_item", "feed_item_name", "date", "quantity", "unit",
            "unit_price", "total_cost", "supplier", "receipt_image", "notes",
            "recorded_by", "recorded_by_name", "farm", "sync_status",
            "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class FeedUsageLogSerializer(serializers.ModelSerializer):
    feed_item_name = serializers.CharField(source="feed_item.name", read_only=True)
    cow_tag = serializers.CharField(source="cow.tag_number", read_only=True, allow_null=True)
    logged_by_name = serializers.CharField(source="logged_by.full_name", read_only=True, allow_null=True)
    scan_method_display = serializers.CharField(source="get_scan_method_display", read_only=True)

    class Meta:
        model = FeedUsageLog
        fields = [
            "id", "feed_item", "feed_item_name", "date", "quantity", "unit",
            "cow", "cow_tag", "scan_method", "scan_method_display",
            "logged_by", "logged_by_name", "notes", "farm", "sync_status",
            "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class FeedUsageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating usage logs."""

    class Meta:
        model = FeedUsageLog
        fields = ["feed_item", "date", "quantity", "unit", "cow", "scan_method", "notes", "device_id", "local_id"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["logged_by"] = request.user
            validated_data["farm"] = request.user.active_farm
        return super().create(validated_data)


class InventoryBalanceSerializer(serializers.ModelSerializer):
    feed_item_name = serializers.CharField(source="feed_item.name", read_only=True)
    feed_item_category = serializers.CharField(source="feed_item.get_category_display", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = InventoryBalance
        fields = [
            "id", "feed_item", "feed_item_name", "feed_item_category",
            "quantity_on_hand", "unit", "is_low_stock", "days_remaining",
            "last_restocked_at", "last_usage_at", "farm"
        ]
        read_only_fields = fields


class InventoryMovementSerializer(serializers.ModelSerializer):
    feed_item_name = serializers.CharField(source="feed_item.name", read_only=True)
    movement_type_display = serializers.CharField(source="get_movement_type_display", read_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            "id", "feed_item", "feed_item_name", "date", "movement_type",
            "movement_type_display", "quantity", "unit", "balance_before",
            "balance_after", "source_type", "source_id", "recorded_by",
            "notes", "created_at"
        ]
        read_only_fields = fields


class QRScanSerializer(serializers.Serializer):
    """Serializer for QR code scanning."""
    qr_code = serializers.CharField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    date = serializers.DateField(required=False)
    cow_id = serializers.IntegerField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
