"""
Koimeret Dairies - Alerts and Notifications Models
"""
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel, FarmScopedModel


class Alert(TimeStampedModel, FarmScopedModel):
    """
    System-generated alert for important events.
    """
    ALERT_TYPE_CHOICES = [
        ("low_stock", _("Low Stock")),
        ("yield_drop", _("Yield Drop")),
        ("vaccine_due", _("Vaccine Due")),
        ("withdrawal_active", _("Withdrawal Active")),
        ("task_missed", _("Task Missed")),
        ("health_event", _("Health Event")),
        ("payment_overdue", _("Payment Overdue")),
        ("system", _("System")),
    ]

    SEVERITY_CHOICES = [
        ("info", _("Information")),
        ("low", _("Low")),
        ("medium", _("Medium")),
        ("high", _("High")),
        ("critical", _("Critical")),
    ]

    STATUS_CHOICES = [
        ("open", _("Open")),
        ("acknowledged", _("Acknowledged")),
        ("resolved", _("Resolved")),
        ("muted", _("Muted")),
    ]

    alert_type = models.CharField(
        _("type"),
        max_length=30,
        choices=ALERT_TYPE_CHOICES,
    )
    severity = models.CharField(
        _("severity"),
        max_length=20,
        choices=SEVERITY_CHOICES,
        default="medium",
    )
    title = models.CharField(_("title"), max_length=200)
    message = models.TextField(_("message"))
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default="open",
    )

    # Related entity (optional)
    entity_type = models.CharField(
        _("entity type"),
        max_length=50,
        blank=True,
        help_text=_("e.g., 'Cow', 'FeedItem', 'Task'"),
    )
    entity_id = models.PositiveIntegerField(
        _("entity ID"),
        null=True,
        blank=True,
    )

    # Resolution tracking
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alerts_resolved",
    )
    resolution_note = models.TextField(_("resolution note"), blank=True)

    # Acknowledgement
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alerts_acknowledged",
    )

    class Meta:
        verbose_name = _("alert")
        verbose_name_plural = _("alerts")
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_severity_display()}] {self.title}"


class Notification(TimeStampedModel, FarmScopedModel):
    """
    User notification for alerts or other events.
    """
    CHANNEL_CHOICES = [
        ("in_app", _("In-App")),
        ("sms", _("SMS")),
        ("whatsapp", _("WhatsApp")),
        ("email", _("Email")),
        ("push", _("Push Notification")),
    ]

    STATUS_CHOICES = [
        ("queued", _("Queued")),
        ("sent", _("Sent")),
        ("failed", _("Failed")),
        ("read", _("Read")),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    alert = models.ForeignKey(
        Alert,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    channel = models.CharField(
        _("channel"),
        max_length=20,
        choices=CHANNEL_CHOICES,
        default="in_app",
    )
    title = models.CharField(_("title"), max_length=200)
    message = models.TextField(_("message"))
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default="queued",
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(_("error"), blank=True)

    class Meta:
        verbose_name = _("notification")
        verbose_name_plural = _("notifications")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} -> {self.user}"


class AlertRule(TimeStampedModel, FarmScopedModel):
    """
    Configurable alert rules.
    """
    name = models.CharField(_("name"), max_length=200)
    alert_type = models.CharField(
        _("alert type"),
        max_length=30,
        choices=Alert.ALERT_TYPE_CHOICES,
    )
    is_enabled = models.BooleanField(default=True)

    # Rule parameters (JSON)
    parameters = models.JSONField(
        default=dict,
        help_text=_("Rule-specific parameters"),
    )

    # Notification settings
    notify_owner = models.BooleanField(default=True)
    notify_workers = models.BooleanField(default=False)
    notification_channels = models.JSONField(
        default=list,
        help_text=_("List of channels: in_app, sms, email, etc."),
    )

    class Meta:
        verbose_name = _("alert rule")
        verbose_name_plural = _("alert rules")

    def __str__(self):
        return f"{self.name} ({self.get_alert_type_display()})"
