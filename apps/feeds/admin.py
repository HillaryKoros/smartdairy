"""
Koimeret Dairies - Feeds Admin
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import FeedItem, FeedPurchase, FeedUsageLog, InventoryBalance, InventoryMovement


@admin.register(FeedItem)
class FeedItemAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "unit", "reorder_level", "cost_per_unit", "is_active", "farm"]
    list_filter = ["category", "is_active", "farm"]
    search_fields = ["name", "qr_code"]
    raw_id_fields = ["farm"]


@admin.register(FeedPurchase)
class FeedPurchaseAdmin(admin.ModelAdmin):
    list_display = ["feed_item", "date", "quantity", "unit", "total_cost", "supplier", "recorded_by"]
    list_filter = ["date", "farm", "feed_item"]
    search_fields = ["feed_item__name", "supplier"]
    raw_id_fields = ["farm", "feed_item", "recorded_by"]
    date_hierarchy = "date"


@admin.register(FeedUsageLog)
class FeedUsageLogAdmin(admin.ModelAdmin):
    list_display = ["feed_item", "date", "quantity", "unit", "cow", "scan_method", "logged_by"]
    list_filter = ["date", "farm", "scan_method", "feed_item"]
    search_fields = ["feed_item__name", "cow__tag_number"]
    raw_id_fields = ["farm", "feed_item", "cow", "logged_by"]
    date_hierarchy = "date"


@admin.register(InventoryBalance)
class InventoryBalanceAdmin(admin.ModelAdmin):
    list_display = ["feed_item", "quantity_on_hand", "unit", "stock_status", "days_remaining", "farm"]
    list_filter = ["farm"]
    search_fields = ["feed_item__name"]
    raw_id_fields = ["farm", "feed_item"]
    readonly_fields = ["last_restocked_at", "last_usage_at"]

    def stock_status(self, obj):
        if obj.is_low_stock:
            return format_html('<span style="color: red; font-weight: bold;">LOW STOCK</span>')
        return format_html('<span style="color: green;">OK</span>')
    stock_status.short_description = "Status"


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ["feed_item", "date", "movement_type", "quantity", "balance_before", "balance_after", "recorded_by"]
    list_filter = ["movement_type", "date", "farm"]
    search_fields = ["feed_item__name"]
    raw_id_fields = ["farm", "feed_item", "recorded_by"]
    date_hierarchy = "date"
    readonly_fields = ["farm", "feed_item", "date", "movement_type", "quantity", "unit", "balance_before", "balance_after", "source_type", "source_id", "recorded_by"]
