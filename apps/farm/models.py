"""
Koimeret Dairies - Farm Models (Users, Farms, Roles, Devices)
"""
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel, AuditableModel


class UserManager(BaseUserManager):
    """Custom user manager for phone-based authentication."""

    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError(_("Phone number is required"))
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(phone, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user model with phone as the primary identifier.
    """
    username = None  # Remove username field
    phone = models.CharField(_("phone number"), max_length=20, unique=True)
    email = models.EmailField(_("email address"), blank=True)
    full_name = models.CharField(_("full name"), max_length=150)
    is_active = models.BooleanField(_("active"), default=True)

    # Farm association
    active_farm = models.ForeignKey(
        "Farm",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="active_users",
    )

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def __str__(self):
        return f"{self.full_name} ({self.phone})"


class Role(models.Model):
    """
    User roles within a farm.
    """
    ROLE_CHOICES = [
        ("owner", _("Owner")),
        ("worker", _("Worker")),
        ("vet", _("Veterinarian")),
        ("admin", _("Administrator")),
    ]

    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = _("role")
        verbose_name_plural = _("roles")

    def __str__(self):
        return self.get_name_display()


class Farm(TimeStampedModel):
    """
    Farm entity - the main organizational unit.
    """
    name = models.CharField(_("farm name"), max_length=200)
    location = models.CharField(_("location"), max_length=500, blank=True)
    timezone = models.CharField(_("timezone"), max_length=50, default="Africa/Nairobi")
    currency = models.CharField(_("currency"), max_length=10, default="KES")

    # Contact info
    phone = models.CharField(_("phone"), max_length=20, blank=True)
    email = models.EmailField(_("email"), blank=True)

    # Settings
    settings = models.JSONField(default=dict, blank=True)

    # Owner
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="owned_farms",
    )

    class Meta:
        verbose_name = _("farm")
        verbose_name_plural = _("farms")

    def __str__(self):
        return self.name


class FarmMembership(TimeStampedModel):
    """
    Association between users and farms with roles.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="farm_memberships",
    )
    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="memberships",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("farm membership")
        verbose_name_plural = _("farm memberships")
        unique_together = ["user", "farm"]

    def __str__(self):
        return f"{self.user} - {self.farm} ({self.role})"


class Device(TimeStampedModel):
    """
    Registered devices for offline sync tracking.
    """
    DEVICE_TYPE_CHOICES = [
        ("android", _("Android")),
        ("ios", _("iOS")),
        ("web", _("Web Browser")),
    ]

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="devices",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="devices",
    )
    device_id = models.CharField(_("device ID"), max_length=100, unique=True)
    device_type = models.CharField(
        _("device type"),
        max_length=20,
        choices=DEVICE_TYPE_CHOICES,
    )
    device_name = models.CharField(_("device name"), max_length=200, blank=True)
    push_token = models.CharField(_("push token"), max_length=500, blank=True)
    last_seen_at = models.DateTimeField(_("last seen"), null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("device")
        verbose_name_plural = _("devices")

    def __str__(self):
        return f"{self.device_name or self.device_id} ({self.user})"


class AuditLog(TimeStampedModel):
    """
    Audit log for tracking all changes.
    """
    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="audit_logs",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="audit_logs",
    )
    action = models.CharField(_("action"), max_length=50)
    entity_type = models.CharField(_("entity type"), max_length=100)
    entity_id = models.CharField(_("entity ID"), max_length=100)
    payload = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        verbose_name = _("audit log")
        verbose_name_plural = _("audit logs")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} on {self.entity_type}:{self.entity_id} by {self.user}"
