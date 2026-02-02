"""
Koimeret Dairies - Tasks Admin
"""
from django.contrib import admin

from .models import TaskTemplate, TaskInstance, TaskCompletion


@admin.register(TaskTemplate)
class TaskTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "default_assignee_role", "default_time", "is_active", "order"]
    list_filter = ["category", "is_active", "farm"]
    search_fields = ["name", "description"]
    raw_id_fields = ["farm", "default_assignee_role"]
    ordering = ["order", "name"]


@admin.register(TaskInstance)
class TaskInstanceAdmin(admin.ModelAdmin):
    list_display = ["name", "task_date", "due_time", "status", "assignee", "priority"]
    list_filter = ["status", "priority", "task_date", "farm"]
    search_fields = ["name", "description"]
    raw_id_fields = ["farm", "template", "assignee", "assignee_role", "related_cow"]
    date_hierarchy = "task_date"


@admin.register(TaskCompletion)
class TaskCompletionAdmin(admin.ModelAdmin):
    list_display = ["task", "completed_by", "completed_at"]
    list_filter = ["completed_at"]
    search_fields = ["task__name", "comment"]
    raw_id_fields = ["task", "completed_by"]
