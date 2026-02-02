"""
Koimeret Dairies - Dairy Admin
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Cow, CowStatusHistory, MilkLog, MilkProductionSummary


@admin.register(Cow)
class CowAdmin(admin.ModelAdmin):
    list_display = ["tag_number", "name", "breed", "status", "farm", "is_active", "created_at"]
    list_filter = ["status", "breed", "farm", "is_active"]
    search_fields = ["tag_number", "name"]
    raw_id_fields = ["farm", "mother"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        (None, {"fields": ("farm", "tag_number", "name", "status")}),
        ("Details", {"fields": ("breed", "date_of_birth", "mother", "photo")}),
        ("Purchase Info", {"fields": ("purchase_date", "purchase_price")}),
        ("Notes", {"fields": ("notes", "is_active")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(CowStatusHistory)
class CowStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ["cow", "from_status", "to_status", "changed_by", "created_at"]
    list_filter = ["to_status", "created_at"]
    search_fields = ["cow__tag_number", "cow__name"]
    raw_id_fields = ["cow", "changed_by"]


@admin.register(MilkLog)
class MilkLogAdmin(admin.ModelAdmin):
    list_display = ["cow", "date", "session", "liters", "milked_by", "sync_status", "created_at"]
    list_filter = ["session", "date", "farm", "sync_status"]
    search_fields = ["cow__tag_number", "cow__name"]
    raw_id_fields = ["cow", "milked_by", "farm"]
    date_hierarchy = "date"


@admin.register(MilkProductionSummary)
class MilkProductionSummaryAdmin(admin.ModelAdmin):
    list_display = ["farm", "date", "total_liters", "cow_count", "avg_liters_per_cow"]
    list_filter = ["farm", "date"]
    date_hierarchy = "date"
    readonly_fields = ["farm", "date", "total_liters", "cow_count", "avg_liters_per_cow", "morning_liters", "evening_liters"]
