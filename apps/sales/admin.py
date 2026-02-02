"""
Koimeret Dairies - Sales Admin
"""
from django.contrib import admin

from .models import Buyer, Sale, Payment


@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ["name", "buyer_type", "phone", "credit_limit", "is_active", "farm"]
    list_filter = ["buyer_type", "is_active", "farm"]
    search_fields = ["name", "phone", "email"]
    raw_id_fields = ["farm"]


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ["date", "buyer", "liters_sold", "price_per_liter", "total_amount", "paid_status", "recorded_by"]
    list_filter = ["paid_status", "payment_method", "channel", "date", "farm"]
    search_fields = ["buyer__name", "notes"]
    raw_id_fields = ["farm", "buyer", "recorded_by", "withdrawal_approved_by"]
    date_hierarchy = "date"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["date", "sale", "method", "amount", "reference", "recorded_by"]
    list_filter = ["method", "date", "farm"]
    search_fields = ["reference", "payer_phone"]
    raw_id_fields = ["farm", "sale", "recorded_by"]
    date_hierarchy = "date"
