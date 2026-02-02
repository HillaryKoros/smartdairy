"""
Koimeret Dairies - Sales and Payments Models
"""
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

from apps.core.models import TimeStampedModel, FarmScopedModel, SyncableModel


class Buyer(TimeStampedModel, FarmScopedModel):
    """
    Customer/buyer information.
    """
    TYPE_CHOICES = [
        ("walk_in", _("Walk-in")),
        ("regular", _("Regular Customer")),
        ("dairy_collection_center", _("Dairy Collection Center")),
    ]

    name = models.CharField(_("name"), max_length=200)
    phone = models.CharField(_("phone"), max_length=20, blank=True)
    email = models.EmailField(_("email"), blank=True)
    address = models.TextField(_("address"), blank=True)
    buyer_type = models.CharField(
        _("type"),
        max_length=30,
        choices=TYPE_CHOICES,
        default="regular",
    )
    is_active = models.BooleanField(default=True)
    notes = models.TextField(_("notes"), blank=True)

    # Credit settings
    credit_limit = models.DecimalField(
        _("credit limit"),
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    class Meta:
        verbose_name = _("buyer")
        verbose_name_plural = _("buyers")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_buyer_type_display()})"

    @property
    def outstanding_balance(self):
        """Calculate outstanding balance from unpaid sales."""
        from django.db.models import Sum
        unpaid = self.sales.filter(
            paid_status__in=["unpaid", "partial"]
        ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        payments = Payment.objects.filter(
            sale__buyer=self
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0")
        return unpaid - payments


class Sale(TimeStampedModel, FarmScopedModel, SyncableModel):
    """
    Milk sale record.
    """
    CHANNEL_CHOICES = [
        ("walk_in", _("Walk-in")),
        ("regular_customer", _("Regular Customer")),
        ("dairy_collection_center", _("Dairy Collection Center")),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("cash", _("Cash")),
        ("mpesa", _("M-Pesa")),
        ("bank_transfer", _("Bank Transfer")),
        ("credit", _("Credit")),
    ]

    PAID_STATUS_CHOICES = [
        ("paid", _("Paid")),
        ("unpaid", _("Unpaid")),
        ("partial", _("Partial")),
    ]

    date = models.DateField(_("date"))
    buyer = models.ForeignKey(
        Buyer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )
    channel = models.CharField(
        _("channel"),
        max_length=30,
        choices=CHANNEL_CHOICES,
        default="walk_in",
    )
    liters_sold = models.DecimalField(
        _("liters sold"),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    price_per_liter = models.DecimalField(
        _("price per liter"),
        max_digits=8,
        decimal_places=2,
    )
    total_amount = models.DecimalField(
        _("total amount"),
        max_digits=12,
        decimal_places=2,
    )
    payment_method = models.CharField(
        _("payment method"),
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="cash",
    )
    paid_status = models.CharField(
        _("payment status"),
        max_length=20,
        choices=PAID_STATUS_CHOICES,
        default="paid",
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sales_recorded",
    )
    notes = models.TextField(_("notes"), blank=True)

    # Withdrawal check
    withdrawal_override = models.BooleanField(
        _("withdrawal override"),
        default=False,
        help_text=_("Sale approved despite active withdrawal"),
    )
    withdrawal_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="withdrawal_overrides_approved",
    )

    class Meta:
        verbose_name = _("sale")
        verbose_name_plural = _("sales")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.date}: {self.liters_sold}L @ {self.price_per_liter}/L"

    def save(self, *args, **kwargs):
        # Auto-calculate total if not set
        if not self.total_amount:
            self.total_amount = self.liters_sold * self.price_per_liter
        super().save(*args, **kwargs)

    @property
    def amount_paid(self):
        """Total amount paid for this sale."""
        return self.payments.aggregate(
            total=models.Sum("amount")
        )["total"] or Decimal("0")

    @property
    def balance_due(self):
        """Remaining balance to be paid."""
        return self.total_amount - self.amount_paid


class Payment(TimeStampedModel, FarmScopedModel, SyncableModel):
    """
    Payment record.
    """
    METHOD_CHOICES = [
        ("cash", _("Cash")),
        ("mpesa", _("M-Pesa")),
        ("bank_transfer", _("Bank Transfer")),
    ]

    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="payments",
    )
    date = models.DateField(_("date"))
    method = models.CharField(
        _("method"),
        max_length=20,
        choices=METHOD_CHOICES,
    )
    amount = models.DecimalField(
        _("amount"),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    reference = models.CharField(
        _("reference"),
        max_length=100,
        blank=True,
        help_text=_("Transaction ID or reference number"),
    )
    payer_phone = models.CharField(
        _("payer phone"),
        max_length=20,
        blank=True,
    )
    notes = models.TextField(_("notes"), blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="payments_recorded",
    )

    class Meta:
        verbose_name = _("payment")
        verbose_name_plural = _("payments")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.date}: {self.amount} via {self.get_method_display()}"
