"""
Koimeret Dairies - Alerts API Serializers
"""
from rest_framework import serializers

from apps.alerts.models import Alert, Notification, AlertRule


class AlertSerializer(serializers.ModelSerializer):
    alert_type_display = serializers.CharField(source="get_alert_type_display", read_only=True)
    severity_display = serializers.CharField(source="get_severity_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    resolved_by_name = serializers.CharField(source="resolved_by.full_name", read_only=True, allow_null=True)

    class Meta:
        model = Alert
        fields = [
            "id", "alert_type", "alert_type_display",
            "severity", "severity_display", "title", "message",
            "status", "status_display", "entity_type", "entity_id",
            "resolved_at", "resolved_by", "resolved_by_name", "resolution_note",
            "acknowledged_at", "acknowledged_by",
            "farm", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    channel_display = serializers.CharField(source="get_channel_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "user", "alert", "channel", "channel_display",
            "title", "message", "status", "status_display",
            "sent_at", "read_at", "farm", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class AlertRuleSerializer(serializers.ModelSerializer):
    alert_type_display = serializers.CharField(source="get_alert_type_display", read_only=True)

    class Meta:
        model = AlertRule
        fields = [
            "id", "name", "alert_type", "alert_type_display",
            "is_enabled", "parameters", "notify_owner", "notify_workers",
            "notification_channels", "farm", "created_at"
        ]
        read_only_fields = ["id", "created_at"]
