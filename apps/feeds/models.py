"""
Koimeret Dairies - Feeds and Inventory Models
"""
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.core.models import TimeStampedModel, FarmScopedModel, AuditableModel, SyncableModel


class FeedItem(TimeStampedModel, FarmScopedModel):
    """
    Feed type/product definition.
    """
    CATEGORY_CHOICES = [
        ("concentrate", _("Concentrate")),
        ("roughage", _("Roughage")),
        ("supplement", _("Supplement")),
        ("mineral", _("Mineral")),
        ("other", _("Other")),
    ]

    UNIT_CHOICES = [
        ("kg", _("Kilograms")),
        ("bags", _("Bags")),
        ("bales", _("Bales")),
        ("liters", _("Liters")),
        ("sacks", _("Sacks")),
    ]

    name = models.CharField(_("name"), max_length=200)
    category = models.CharField(
        _("category"),
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="concentrate",
    )
    unit = models.CharField(
        _("default unit"),
        max_length=20,
        choices=UNIT_CHOICES,
        default="kg",
    )
    qr_code = models.CharField(_("QR code"), max_length=100, blank=True)
    description = models.TextField(_("description"), blank=True)
    is_active = models.BooleanField(default=True)

    # Inventory settings
    reorder_level = models.DecimalField(
        _("reorder level"),
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text=_("Alert when stock falls below this level"),
    )
    cost_per_unit = models.DecimalField(
        _("cost per unit"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Average or last purchase cost"),
    )

    class Meta:
        verbose_name = _("feed item")
        verbose_name_plural = _("feed items")
        unique_together = ["farm", "name"]
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class FeedPurchase(TimeStampedModel, FarmScopedModel, SyncableModel):
    """
    Record of feed purchase/restock.
    """
    feed_item = models.ForeignKey(
        FeedItem,
        on_delete=models.CASCADE,
        related_name="purchases",
    )
    date = models.DateField(_("purchase date"))
    quantity = models.DecimalField(
        _("quantity"),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    unit = models.CharField(_("unit"), max_length=20)
    unit_price = models.DecimalField(
        _("unit price"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    total_cost = models.DecimalField(
        _("total cost"),
        max_digits=12,
        decimal_places=2,
    )
    supplier = models.CharField(_("supplier"), max_length=200, blank=True)
    receipt_image = models.ImageField(
        _("receipt"),
        upload_to="feed_receipts/",
        null=True,
        blank=True,
    )
    notes = models.TextField(_("notes"), blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="feed_purchases_recorded",
    )

    class Meta:
        verbose_name = _("feed purchase")
        verbose_name_plural = _("feed purchases")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.feed_item} - {self.quantity} {self.unit} on {self.date}"


class FeedUsageLog(TimeStampedModel, FarmScopedModel, SyncableModel):
    """
    Record of feed usage/consumption.
    """
    SCAN_METHOD_CHOICES = [
        ("qr_scan", _("QR Scan")),
        ("manual", _("Manual Entry")),
    ]

    feed_item = models.ForeignKey(
        FeedItem,
        on_delete=models.CASCADE,
        related_name="usage_logs",
    )
    date = models.DateField(_("date"))
    quantity = models.DecimalField(
        _("quantity used"),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    unit = models.CharField(_("unit"), max_length=20)
    cow = models.ForeignKey(
        "dairy.Cow",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feed_usage",
        help_text=_("Optional: specific cow if tracking per-cow feeding"),
    )
    scan_method = models.CharField(
        _("entry method"),
        max_length=20,
        choices=SCAN_METHOD_CHOICES,
        default="manual",
    )
    logged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="feed_usage_logged",
    )
    notes = models.TextField(_("notes"), blank=True)

    class Meta:
        verbose_name = _("feed usage log")
        verbose_name_plural = _("feed usage logs")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.feed_item} - {self.quantity} {self.unit} on {self.date}"


class InventoryBalance(TimeStampedModel, FarmScopedModel):
    """
    Current inventory level for each feed item.
    Updated automatically via signals on purchase/usage.
    """
    feed_item = models.OneToOneField(
        FeedItem,
        on_delete=models.CASCADE,
        related_name="inventory",
    )
    quantity_on_hand = models.DecimalField(
        _("quantity on hand"),
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    unit = models.CharField(_("unit"), max_length=20)
    last_restocked_at = models.DateTimeField(_("last restocked"), null=True, blank=True)
    last_usage_at = models.DateTimeField(_("last usage"), null=True, blank=True)

    class Meta:
        verbose_name = _("inventory balance")
        verbose_name_plural = _("inventory balances")

    def __str__(self):
        return f"{self.feed_item}: {self.quantity_on_hand} {self.unit}"

    @property
    def is_low_stock(self):
        return self.quantity_on_hand <= self.feed_item.reorder_level

    @property
    def days_remaining(self):
        """Estimate days of stock remaining based on recent usage."""
        # Calculate average daily usage from last 30 days
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum

        thirty_days_ago = timezone.now() - timedelta(days=30)
        total_usage = FeedUsageLog.objects.filter(
            feed_item=self.feed_item,
            date__gte=thirty_days_ago.date(),
        ).aggregate(total=Sum("quantity"))["total"] or Decimal("0")

        if total_usage > 0:
            daily_avg = total_usage / 30
            if daily_avg > 0:
                return int(self.quantity_on_hand / daily_avg)
        return None


class InventoryMovement(TimeStampedModel, FarmScopedModel):
    """
    Audit trail of all inventory changes.
    """
    MOVEMENT_TYPE_CHOICES = [
        ("purchase_in", _("Purchase In")),
        ("usage_out", _("Usage Out")),
        ("adjustment", _("Manual Adjustment")),
        ("transfer", _("Transfer")),
        ("loss", _("Loss/Wastage")),
    ]

    feed_item = models.ForeignKey(
        FeedItem,
        on_delete=models.CASCADE,
        related_name="movements",
    )
    date = models.DateField(_("date"))
    movement_type = models.CharField(
        _("type"),
        max_length=20,
        choices=MOVEMENT_TYPE_CHOICES,
    )
    quantity = models.DecimalField(
        _("quantity"),
        max_digits=10,
        decimal_places=2,
    )
    unit = models.CharField(_("unit"), max_length=20)
    balance_before = models.DecimalField(
        _("balance before"),
        max_digits=12,
        decimal_places=2,
    )
    balance_after = models.DecimalField(
        _("balance after"),
        max_digits=12,
        decimal_places=2,
    )
    source_type = models.CharField(
        _("source type"),
        max_length=50,
        blank=True,
        help_text=_("e.g., 'FeedPurchase', 'FeedUsageLog'"),
    )
    source_id = models.PositiveIntegerField(
        _("source ID"),
        null=True,
        blank=True,
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = _("inventory movement")
        verbose_name_plural = _("inventory movements")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.feed_item} {self.movement_type}: {self.quantity} {self.unit}"


# Signals to update inventory balances
@receiver(post_save, sender=FeedPurchase)
def update_inventory_on_purchase(sender, instance, created, **kwargs):
    """Update inventory when a purchase is recorded."""
    if created:
        from django.utils import timezone
        inventory, _ = InventoryBalance.objects.get_or_create(
            farm=instance.farm,
            feed_item=instance.feed_item,
            defaults={"unit": instance.unit},
        )
        balance_before = inventory.quantity_on_hand
        inventory.quantity_on_hand += instance.quantity
        inventory.last_restocked_at = timezone.now()
        inventory.save()

        # Create movement record
        InventoryMovement.objects.create(
            farm=instance.farm,
            feed_item=instance.feed_item,
            date=instance.date,
            movement_type="purchase_in",
            quantity=instance.quantity,
            unit=instance.unit,
            balance_before=balance_before,
            balance_after=inventory.quantity_on_hand,
            source_type="FeedPurchase",
            source_id=instance.id,
            recorded_by=instance.recorded_by,
        )


@receiver(post_save, sender=FeedUsageLog)
def update_inventory_on_usage(sender, instance, created, **kwargs):
    """Update inventory when usage is logged."""
    if created:
        from django.utils import timezone
        inventory, _ = InventoryBalance.objects.get_or_create(
            farm=instance.farm,
            feed_item=instance.feed_item,
            defaults={"unit": instance.unit},
        )
        balance_before = inventory.quantity_on_hand
        inventory.quantity_on_hand -= instance.quantity
        inventory.last_usage_at = timezone.now()
        inventory.save()

        # Create movement record
        InventoryMovement.objects.create(
            farm=instance.farm,
            feed_item=instance.feed_item,
            date=instance.date,
            movement_type="usage_out",
            quantity=-instance.quantity,
            unit=instance.unit,
            balance_before=balance_before,
            balance_after=inventory.quantity_on_hand,
            source_type="FeedUsageLog",
            source_id=instance.id,
            recorded_by=instance.logged_by,
        )
