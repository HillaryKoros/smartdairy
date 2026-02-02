"""
Koimeret Dairies - Alerts Admin
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Alert, Notification, AlertRule


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ["title", "alert_type", "severity_badge", "status", "entity_type", "created_at"]
    list_filter = ["alert_type", "severity", "status", "farm"]
    search_fields = ["title", "message"]
    raw_id_fields = ["farm", "resolved_by", "acknowledged_by"]
    readonly_fields = ["created_at", "resolved_at", "acknowledged_at"]

    def severity_badge(self, obj):
        colors = {
            "info": "blue",
            "low": "green",
            "medium": "orange",
            "high": "red",
            "critical": "darkred",
        }
        color = colors.get(obj.severity, "gray")
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_severity_display()
        )
    severity_badge.short_description = "Severity"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "channel", "status", "sent_at", "read_at"]
    list_filter = ["channel", "status", "farm"]
    search_fields = ["title", "message", "user__phone"]
    raw_id_fields = ["farm", "user", "alert"]


@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ["name", "alert_type", "is_enabled", "notify_owner", "notify_workers"]
    list_filter = ["alert_type", "is_enabled", "farm"]
    search_fields = ["name"]
    raw_id_fields = ["farm"]
