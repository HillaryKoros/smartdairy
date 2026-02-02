"""
Koimeret Dairies - Tasks API Serializers
"""
from rest_framework import serializers

from apps.tasks.models import TaskTemplate, TaskInstance, TaskCompletion


class TaskTemplateSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    default_assignee_role_name = serializers.CharField(
        source="default_assignee_role.get_name_display", read_only=True, allow_null=True
    )

    class Meta:
        model = TaskTemplate
        fields = [
            "id", "name", "description", "category", "category_display",
            "default_assignee_role", "default_assignee_role_name",
            "default_time", "is_active", "order", "farm", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class TaskCompletionSerializer(serializers.ModelSerializer):
    completed_by_name = serializers.CharField(source="completed_by.full_name", read_only=True, allow_null=True)

    class Meta:
        model = TaskCompletion
        fields = [
            "id", "task", "completed_by", "completed_by_name",
            "completed_at", "comment", "photo", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class TaskInstanceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    priority_display = serializers.CharField(source="get_priority_display", read_only=True)
    assignee_name = serializers.CharField(source="assignee.full_name", read_only=True, allow_null=True)
    assignee_role_name = serializers.CharField(source="assignee_role.get_name_display", read_only=True, allow_null=True)
    completion = TaskCompletionSerializer(read_only=True)
    related_cow_tag = serializers.CharField(source="related_cow.tag_number", read_only=True, allow_null=True)

    class Meta:
        model = TaskInstance
        fields = [
            "id", "template", "name", "description", "task_date", "due_time",
            "assignee", "assignee_name", "assignee_role", "assignee_role_name",
            "status", "status_display", "priority", "priority_display",
            "related_cow", "related_cow_tag", "completion",
            "farm", "sync_status", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class TaskCompleteSerializer(serializers.Serializer):
    """Serializer for completing a task."""
    comment = serializers.CharField(required=False, allow_blank=True)
    photo = serializers.ImageField(required=False)


class TaskSkipSerializer(serializers.Serializer):
    """Serializer for skipping a task."""
    reason = serializers.CharField(required=False, allow_blank=True)
