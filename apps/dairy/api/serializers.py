"""
Koimeret Dairies - Dairy API Serializers
"""
from rest_framework import serializers

from apps.dairy.models import Cow, CowStatusHistory, MilkLog, MilkProductionSummary


class CowSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    mother_tag = serializers.CharField(source="mother.tag_number", read_only=True, allow_null=True)

    class Meta:
        model = Cow
        fields = [
            "id", "tag_number", "name", "breed", "status", "status_display",
            "date_of_birth", "purchase_date", "purchase_price", "photo",
            "notes", "is_active", "mother", "mother_tag", "farm",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CowListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Cow
        fields = ["id", "tag_number", "name", "status", "status_display", "breed"]


class CowStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source="changed_by.full_name", read_only=True, allow_null=True)

    class Meta:
        model = CowStatusHistory
        fields = ["id", "cow", "from_status", "to_status", "changed_by", "changed_by_name", "notes", "created_at"]
        read_only_fields = ["id", "from_status", "created_at"]


class CowStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating cow status."""
    to_status = serializers.ChoiceField(choices=Cow.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)


class MilkLogSerializer(serializers.ModelSerializer):
    cow_tag = serializers.CharField(source="cow.tag_number", read_only=True)
    cow_name = serializers.CharField(source="cow.name", read_only=True)
    milked_by_name = serializers.CharField(source="milked_by.full_name", read_only=True, allow_null=True)
    session_display = serializers.CharField(source="get_session_display", read_only=True)

    class Meta:
        model = MilkLog
        fields = [
            "id", "cow", "cow_tag", "cow_name", "farm",
            "date", "session", "session_display", "liters",
            "milked_by", "milked_by_name", "notes",
            "sync_status", "device_id", "local_id",
            "revision", "is_latest", "created_at"
        ]
        read_only_fields = ["id", "revision", "is_latest", "created_at"]


class MilkLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating milk logs (simplified)."""

    class Meta:
        model = MilkLog
        fields = ["cow", "date", "session", "liters", "notes", "device_id", "local_id"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["milked_by"] = request.user
            validated_data["farm"] = request.user.active_farm
        return super().create(validated_data)


class MilkLogBulkSerializer(serializers.Serializer):
    """Serializer for bulk milk log creation."""
    logs = MilkLogCreateSerializer(many=True)

    def create(self, validated_data):
        logs_data = validated_data.get("logs", [])
        request = self.context.get("request")
        created_logs = []

        for log_data in logs_data:
            if request and request.user:
                log_data["milked_by"] = request.user
                log_data["farm"] = request.user.active_farm
            created_logs.append(MilkLog.objects.create(**log_data))

        return created_logs


class MilkProductionSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MilkProductionSummary
        fields = [
            "id", "farm", "date", "total_liters", "cow_count",
            "avg_liters_per_cow", "morning_liters", "evening_liters"
        ]
        read_only_fields = fields
