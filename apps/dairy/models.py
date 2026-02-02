"""
Koimeret Dairies - Dairy Models (Cows, Milk Logs)
"""
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

from apps.core.models import TimeStampedModel, AuditableModel, FarmScopedModel, RevisionMixin, SyncableModel


class Cow(TimeStampedModel, FarmScopedModel):
    """
    Cow entity with tracking status.
    """
    STATUS_CHOICES = [
        ("heifer", _("Heifer")),
        ("milking", _("Milking")),
        ("dry", _("Dry")),
        ("pregnant", _("Pregnant")),
        ("sick", _("Sick")),
        ("sold", _("Sold")),
        ("dead", _("Dead")),
    ]

    tag_number = models.CharField(_("tag number"), max_length=50)
    name = models.CharField(_("name"), max_length=100, blank=True)
    breed = models.CharField(_("breed"), max_length=100, blank=True)
    date_of_birth = models.DateField(_("date of birth"), null=True, blank=True)
    purchase_date = models.DateField(_("purchase date"), null=True, blank=True)
    purchase_price = models.DecimalField(
        _("purchase price"),
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default="heifer",
    )
    photo = models.ImageField(
        _("photo"),
        upload_to="cows/",
        null=True,
        blank=True,
    )
    image_url = models.URLField(
        _("image URL"),
        max_length=500,
        blank=True,
        help_text=_("External image URL for the cow")
    )
    notes = models.TextField(_("notes"), blank=True)
    is_active = models.BooleanField(default=True)

    # Parent tracking (optional)
    mother = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="offspring",
    )

    class Meta:
        verbose_name = _("cow")
        verbose_name_plural = _("cows")
        unique_together = ["farm", "tag_number"]
        ordering = ["tag_number"]

    def __str__(self):
        return f"{self.tag_number} - {self.name}" if self.name else self.tag_number

    @property
    def display_name(self):
        return f"{self.tag_number} ({self.name})" if self.name else self.tag_number


class CowStatusHistory(TimeStampedModel):
    """
    Track cow status changes over time.
    """
    cow = models.ForeignKey(
        Cow,
        on_delete=models.CASCADE,
        related_name="status_history",
    )
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = _("cow status history")
        verbose_name_plural = _("cow status histories")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.cow} : {self.from_status} -> {self.to_status}"


class MilkLog(TimeStampedModel, FarmScopedModel, SyncableModel, RevisionMixin):
    """
    Daily milk production log per cow.
    """
    SESSION_CHOICES = [
        ("morning", _("Morning")),
        ("evening", _("Evening")),
        ("once_daily", _("Once Daily")),
    ]

    cow = models.ForeignKey(
        Cow,
        on_delete=models.CASCADE,
        related_name="milk_logs",
    )
    date = models.DateField(_("date"))
    session = models.CharField(
        _("session"),
        max_length=20,
        choices=SESSION_CHOICES,
    )
    liters = models.DecimalField(
        _("liters"),
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    milked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="milk_logs_recorded",
    )
    notes = models.TextField(_("notes"), blank=True)

    class Meta:
        verbose_name = _("milk log")
        verbose_name_plural = _("milk logs")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.cow} - {self.date} {self.session}: {self.liters}L"


class MilkProductionSummary(models.Model):
    """
    Aggregated milk production statistics (materialized view concept).
    Updated by background job.
    """
    farm = models.ForeignKey(
        "farm.Farm",
        on_delete=models.CASCADE,
        related_name="milk_summaries",
    )
    date = models.DateField()
    total_liters = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cow_count = models.PositiveIntegerField(default=0)
    avg_liters_per_cow = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    morning_liters = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    evening_liters = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = _("milk production summary")
        verbose_name_plural = _("milk production summaries")
        unique_together = ["farm", "date"]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.farm} - {self.date}: {self.total_liters}L"
