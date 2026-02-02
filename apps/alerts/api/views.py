"""
Koimeret Dairies - Alerts API Views
"""
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.alerts.models import Alert, Notification, AlertRule
from .serializers import AlertSerializer, NotificationSerializer, AlertRuleSerializer


class AlertViewSet(viewsets.ModelViewSet):
    """Alert management."""
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["alert_type", "severity", "status"]
    search_fields = ["title", "message"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return Alert.objects.filter(farm=user.active_farm)
        return Alert.objects.none()

    @action(detail=False, methods=["get"])
    def open(self, request):
        """Get open alerts."""
        alerts = self.get_queryset().filter(status="open")
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get alerts summary."""
        queryset = self.get_queryset().filter(status="open")
        summary = {
            "total_open": queryset.count(),
            "by_severity": {},
            "by_type": {},
        }
        for sev, label in Alert.SEVERITY_CHOICES:
            summary["by_severity"][sev] = queryset.filter(severity=sev).count()
        for atype, label in Alert.ALERT_TYPE_CHOICES:
            count = queryset.filter(alert_type=atype).count()
            if count > 0:
                summary["by_type"][atype] = count
        return Response(summary)

    @action(detail=True, methods=["post"])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert."""
        alert = self.get_object()
        alert.status = "acknowledged"
        alert.acknowledged_at = timezone.now()
        alert.acknowledged_by = request.user
        alert.save()
        return Response(AlertSerializer(alert).data)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        """Resolve an alert."""
        alert = self.get_object()
        resolution_note = request.data.get("note", "")
        alert.status = "resolved"
        alert.resolved_at = timezone.now()
        alert.resolved_by = request.user
        alert.resolution_note = resolution_note
        alert.save()
        return Response(AlertSerializer(alert).data)

    @action(detail=True, methods=["post"])
    def mute(self, request, pk=None):
        """Mute an alert."""
        alert = self.get_object()
        alert.status = "muted"
        alert.save()
        return Response(AlertSerializer(alert).data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """User notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "channel"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=["get"])
    def unread(self, request):
        """Get unread notifications."""
        notifications = self.get_queryset().exclude(status="read")
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        """Mark notification as read."""
        notification = self.get_object()
        notification.status = "read"
        notification.read_at = timezone.now()
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        self.get_queryset().exclude(status="read").update(
            status="read",
            read_at=timezone.now(),
        )
        return Response({"status": "ok"})


class AlertRuleViewSet(viewsets.ModelViewSet):
    """Alert rule configuration."""
    serializer_class = AlertRuleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["alert_type", "is_enabled"]
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return AlertRule.objects.filter(farm=user.active_farm)
        return AlertRule.objects.none()

    def perform_create(self, serializer):
        serializer.save(farm=self.request.user.active_farm)
