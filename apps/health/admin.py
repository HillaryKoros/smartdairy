"""
Koimeret Dairies - Health Admin
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import HealthEvent, Treatment, Withdrawal, Vaccination, VaccinationSchedule


@admin.register(HealthEvent)
class HealthEventAdmin(admin.ModelAdmin):
    list_display = ["cow", "date", "symptoms_short", "severity", "is_resolved", "reported_by"]
    list_filter = ["severity", "is_resolved", "date", "farm"]
    search_fields = ["cow__tag_number", "symptoms", "diagnosis"]
    raw_id_fields = ["cow", "farm", "reported_by"]
    date_hierarchy = "date"

    def symptoms_short(self, obj):
        return obj.symptoms[:50] + "..." if len(obj.symptoms) > 50 else obj.symptoms
    symptoms_short.short_description = "Symptoms"


@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ["cow", "date", "treatment_name", "dose", "milk_withdrawal_days", "administered_by"]
    list_filter = ["date", "farm"]
    search_fields = ["cow__tag_number", "treatment_name"]
    raw_id_fields = ["cow", "farm", "health_event", "administered_by"]
    date_hierarchy = "date"


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ["cow", "withdrawal_type", "start_date", "end_date", "is_active", "treatment"]
    list_filter = ["withdrawal_type", "is_active", "farm"]
    search_fields = ["cow__tag_number"]
    raw_id_fields = ["cow", "farm", "treatment"]

    def is_active_display(self, obj):
        if obj.is_active:
            return format_html('<span style="color: red; font-weight: bold;">ACTIVE</span>')
        return format_html('<span style="color: green;">Ended</span>')
    is_active_display.short_description = "Status"


@admin.register(Vaccination)
class VaccinationAdmin(admin.ModelAdmin):
    list_display = ["cow_or_herd", "vaccine_name", "date", "next_due_date", "administered_by"]
    list_filter = ["vaccine_name", "date", "farm"]
    search_fields = ["cow__tag_number", "vaccine_name"]
    raw_id_fields = ["cow", "farm", "administered_by"]
    date_hierarchy = "date"

    def cow_or_herd(self, obj):
        return obj.cow if obj.cow else "Herd-wide"
    cow_or_herd.short_description = "Cow/Herd"


@admin.register(VaccinationSchedule)
class VaccinationScheduleAdmin(admin.ModelAdmin):
    list_display = ["vaccine_name", "interval_months", "is_active", "farm"]
    list_filter = ["is_active", "farm"]
    search_fields = ["vaccine_name"]
