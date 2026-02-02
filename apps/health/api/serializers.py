"""
Koimeret Dairies - Health API Serializers
"""
from rest_framework import serializers

from apps.health.models import HealthEvent, Treatment, Withdrawal, Vaccination, VaccinationSchedule


class HealthEventSerializer(serializers.ModelSerializer):
    cow_tag = serializers.CharField(source="cow.tag_number", read_only=True)
    cow_name = serializers.CharField(source="cow.name", read_only=True)
    reported_by_name = serializers.CharField(source="reported_by.full_name", read_only=True, allow_null=True)
    severity_display = serializers.CharField(source="get_severity_display", read_only=True)

    class Meta:
        model = HealthEvent
        fields = [
            "id", "cow", "cow_tag", "cow_name", "date", "symptoms",
            "temperature", "diagnosis", "severity", "severity_display",
            "notes", "photo", "reported_by", "reported_by_name",
            "is_resolved", "resolved_at", "farm", "sync_status", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class TreatmentSerializer(serializers.ModelSerializer):
    cow_tag = serializers.CharField(source="cow.tag_number", read_only=True)
    cow_name = serializers.CharField(source="cow.name", read_only=True)
    administered_by_name = serializers.CharField(source="administered_by.full_name", read_only=True, allow_null=True)
    route_display = serializers.CharField(source="get_route_display", read_only=True)

    class Meta:
        model = Treatment
        fields = [
            "id", "cow", "cow_tag", "cow_name", "health_event",
            "date", "treatment_name", "dose", "route", "route_display",
            "administered_by", "administered_by_name", "cost",
            "milk_withdrawal_days", "meat_withdrawal_days", "notes",
            "farm", "sync_status", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class TreatmentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating treatments."""

    class Meta:
        model = Treatment
        fields = [
            "cow", "health_event", "date", "treatment_name", "dose",
            "route", "cost", "milk_withdrawal_days", "meat_withdrawal_days", "notes"
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["administered_by"] = request.user
            validated_data["farm"] = request.user.active_farm
        return super().create(validated_data)


class WithdrawalSerializer(serializers.ModelSerializer):
    cow_tag = serializers.CharField(source="cow.tag_number", read_only=True)
    cow_name = serializers.CharField(source="cow.name", read_only=True)
    treatment_name = serializers.CharField(source="treatment.treatment_name", read_only=True)
    withdrawal_type_display = serializers.CharField(source="get_withdrawal_type_display", read_only=True)
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Withdrawal
        fields = [
            "id", "cow", "cow_tag", "cow_name", "treatment", "treatment_name",
            "withdrawal_type", "withdrawal_type_display",
            "start_date", "end_date", "is_active", "days_remaining",
            "farm", "created_at"
        ]
        read_only_fields = fields

    def get_days_remaining(self, obj):
        if obj.is_active:
            from django.utils import timezone
            delta = obj.end_date - timezone.now().date()
            return max(0, delta.days)
        return 0


class VaccinationSerializer(serializers.ModelSerializer):
    cow_tag = serializers.CharField(source="cow.tag_number", read_only=True, allow_null=True)
    cow_name = serializers.CharField(source="cow.name", read_only=True, allow_null=True)
    administered_by_name = serializers.CharField(source="administered_by.full_name", read_only=True, allow_null=True)
    is_herd_wide = serializers.SerializerMethodField()

    class Meta:
        model = Vaccination
        fields = [
            "id", "cow", "cow_tag", "cow_name", "is_herd_wide",
            "date", "vaccine_name", "batch_number", "dose",
            "administered_by", "administered_by_name",
            "next_due_date", "cost", "notes", "farm", "sync_status", "created_at"
        ]
        read_only_fields = ["id", "created_at"]

    def get_is_herd_wide(self, obj):
        return obj.cow is None


class VaccinationScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccinationSchedule
        fields = [
            "id", "vaccine_name", "description", "interval_months",
            "is_active", "farm", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class VaccinationDueSerializer(serializers.Serializer):
    """Serializer for upcoming vaccinations."""
    cow_id = serializers.IntegerField()
    cow_tag = serializers.CharField()
    cow_name = serializers.CharField(allow_null=True)
    vaccine_name = serializers.CharField()
    last_vaccination_date = serializers.DateField()
    due_date = serializers.DateField()
    days_until_due = serializers.IntegerField()
