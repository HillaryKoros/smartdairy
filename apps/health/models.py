"""
Koimeret Dairies - Health Models (Events, Treatments, Vaccinations, Withdrawals)
"""
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.core.models import TimeStampedModel, FarmScopedModel, SyncableModel


class HealthEvent(TimeStampedModel, FarmScopedModel, SyncableModel):
    """
    Health observation/incident for a cow.
    """
    cow = models.ForeignKey(
        "dairy.Cow",
        on_delete=models.CASCADE,
        related_name="health_events",
    )
    date = models.DateField(_("date"))
    symptoms = models.TextField(_("symptoms"))
    temperature = models.DecimalField(
        _("temperature (°C)"),
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
    )
    diagnosis = models.CharField(_("diagnosis"), max_length=500, blank=True)
    severity = models.CharField(
        _("severity"),
        max_length=20,
        choices=[
            ("low", _("Low")),
            ("medium", _("Medium")),
            ("high", _("High")),
            ("critical", _("Critical")),
        ],
        default="medium",
    )
    notes = models.TextField(_("notes"), blank=True)
    photo = models.ImageField(
        _("photo"),
        upload_to="health_events/",
        null=True,
        blank=True,
    )
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="health_events_reported",
    )
    is_resolved = models.BooleanField(_("resolved"), default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("health event")
        verbose_name_plural = _("health events")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.cow} - {self.date}: {self.symptoms[:50]}"


class Treatment(TimeStampedModel, FarmScopedModel, SyncableModel):
    """
    Treatment administered to a cow.
    """
    ROUTE_CHOICES = [
        ("oral", _("Oral")),
        ("injection_im", _("Injection (IM)")),
        ("injection_iv", _("Injection (IV)")),
        ("injection_sc", _("Injection (SC)")),
        ("topical", _("Topical")),
        ("intramammary", _("Intramammary")),
        ("other", _("Other")),
    ]

    cow = models.ForeignKey(
        "dairy.Cow",
        on_delete=models.CASCADE,
        related_name="treatments",
    )
    health_event = models.ForeignKey(
        HealthEvent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="treatments",
    )
    date = models.DateField(_("date"))
    treatment_name = models.CharField(_("treatment/medication"), max_length=200)
    dose = models.CharField(_("dose"), max_length=100, blank=True)
    route = models.CharField(
        _("route"),
        max_length=20,
        choices=ROUTE_CHOICES,
        blank=True,
    )
    administered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="treatments_administered",
    )
    cost = models.DecimalField(
        _("cost"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    milk_withdrawal_days = models.PositiveIntegerField(
        _("milk withdrawal (days)"),
        default=0,
        help_text=_("Number of days milk should not be sold after treatment"),
    )
    meat_withdrawal_days = models.PositiveIntegerField(
        _("meat withdrawal (days)"),
        default=0,
    )
    notes = models.TextField(_("notes"), blank=True)

    class Meta:
        verbose_name = _("treatment")
        verbose_name_plural = _("treatments")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.cow} - {self.treatment_name} on {self.date}"


class Withdrawal(TimeStampedModel, FarmScopedModel):
    """
    Track active milk/meat withdrawal periods.
    """
    WITHDRAWAL_TYPE_CHOICES = [
        ("milk", _("Milk Withdrawal")),
        ("meat", _("Meat Withdrawal")),
    ]

    cow = models.ForeignKey(
        "dairy.Cow",
        on_delete=models.CASCADE,
        related_name="withdrawals",
    )
    treatment = models.ForeignKey(
        Treatment,
        on_delete=models.CASCADE,
        related_name="withdrawals",
    )
    withdrawal_type = models.CharField(
        _("type"),
        max_length=10,
        choices=WITHDRAWAL_TYPE_CHOICES,
        default="milk",
    )
    start_date = models.DateField(_("start date"))
    end_date = models.DateField(_("end date"))
    is_active = models.BooleanField(_("active"), default=True)

    class Meta:
        verbose_name = _("withdrawal")
        verbose_name_plural = _("withdrawals")
        ordering = ["-end_date"]

    def __str__(self):
        return f"{self.cow} - {self.get_withdrawal_type_display()} until {self.end_date}"

    def save(self, *args, **kwargs):
        # Auto-calculate is_active based on date
        from django.utils import timezone
        if self.end_date < timezone.now().date():
            self.is_active = False
        super().save(*args, **kwargs)


class Vaccination(TimeStampedModel, FarmScopedModel, SyncableModel):
    """
    Vaccination record.
    """
    cow = models.ForeignKey(
        "dairy.Cow",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="vaccinations",
        help_text=_("Leave blank for herd-wide vaccination"),
    )
    date = models.DateField(_("date administered"))
    vaccine_name = models.CharField(_("vaccine name"), max_length=200)
    batch_number = models.CharField(_("batch number"), max_length=100, blank=True)
    dose = models.CharField(_("dose"), max_length=100, blank=True)
    administered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="vaccinations_administered",
    )
    next_due_date = models.DateField(
        _("next due date"),
        null=True,
        blank=True,
    )
    cost = models.DecimalField(
        _("cost"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    notes = models.TextField(_("notes"), blank=True)

    class Meta:
        verbose_name = _("vaccination")
        verbose_name_plural = _("vaccinations")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        if self.cow:
            return f"{self.cow} - {self.vaccine_name} on {self.date}"
        return f"Herd - {self.vaccine_name} on {self.date}"


class VaccinationSchedule(TimeStampedModel, FarmScopedModel):
    """
    Vaccination schedule template.
    """
    vaccine_name = models.CharField(_("vaccine name"), max_length=200)
    description = models.TextField(_("description"), blank=True)
    interval_months = models.PositiveIntegerField(
        _("interval (months)"),
        help_text=_("Months between vaccinations"),
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("vaccination schedule")
        verbose_name_plural = _("vaccination schedules")

    def __str__(self):
        return f"{self.vaccine_name} (every {self.interval_months} months)"


# Signal to create withdrawal records when treatment is saved
@receiver(post_save, sender=Treatment)
def create_withdrawal_for_treatment(sender, instance, created, **kwargs):
    """Auto-create withdrawal records when treatment has withdrawal days."""
    if created:
        from datetime import timedelta

        if instance.milk_withdrawal_days > 0:
            Withdrawal.objects.create(
                farm=instance.farm,
                cow=instance.cow,
                treatment=instance,
                withdrawal_type="milk",
                start_date=instance.date,
                end_date=instance.date + timedelta(days=instance.milk_withdrawal_days),
            )

        if instance.meat_withdrawal_days > 0:
            Withdrawal.objects.create(
                farm=instance.farm,
                cow=instance.cow,
                treatment=instance,
                withdrawal_type="meat",
                start_date=instance.date,
                end_date=instance.date + timedelta(days=instance.meat_withdrawal_days),
            )
