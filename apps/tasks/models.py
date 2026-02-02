"""
Koimeret Dairies - Tasks and Workplans Models
"""
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel, FarmScopedModel, SyncableModel


class TaskTemplate(TimeStampedModel, FarmScopedModel):
    """
    Reusable task template for generating daily/recurring tasks.
    """
    CATEGORY_CHOICES = [
        ("daily", _("Daily")),
        ("weekly", _("Weekly")),
        ("monthly", _("Monthly")),
        ("custom", _("Custom")),
    ]

    name = models.CharField(_("name"), max_length=200)
    description = models.TextField(_("description"), blank=True)
    category = models.CharField(
        _("category"),
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="daily",
    )
    default_assignee_role = models.ForeignKey(
        "farm.Role",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="task_templates",
    )
    default_time = models.TimeField(
        _("default time"),
        null=True,
        blank=True,
        help_text=_("Default time this task should be done"),
    )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0, help_text=_("Display order"))

    class Meta:
        verbose_name = _("task template")
        verbose_name_plural = _("task templates")
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class TaskInstance(TimeStampedModel, FarmScopedModel, SyncableModel):
    """
    Actual task instance for a specific date.
    """
    STATUS_CHOICES = [
        ("pending", _("Pending")),
        ("in_progress", _("In Progress")),
        ("done", _("Done")),
        ("skipped", _("Skipped")),
    ]

    template = models.ForeignKey(
        TaskTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="instances",
    )
    name = models.CharField(_("name"), max_length=200)
    description = models.TextField(_("description"), blank=True)
    task_date = models.DateField(_("date"))
    due_time = models.TimeField(_("due time"), null=True, blank=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )
    assignee_role = models.ForeignKey(
        "farm.Role",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    priority = models.CharField(
        _("priority"),
        max_length=20,
        choices=[
            ("low", _("Low")),
            ("normal", _("Normal")),
            ("high", _("High")),
        ],
        default="normal",
    )
    # Related entities (optional)
    related_cow = models.ForeignKey(
        "dairy.Cow",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )

    class Meta:
        verbose_name = _("task")
        verbose_name_plural = _("tasks")
        ordering = ["-task_date", "due_time", "priority"]

    def __str__(self):
        return f"{self.name} - {self.task_date}"


class TaskCompletion(TimeStampedModel):
    """
    Record of task completion with optional proof.
    """
    task = models.OneToOneField(
        TaskInstance,
        on_delete=models.CASCADE,
        related_name="completion",
    )
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="completed_tasks",
    )
    completed_at = models.DateTimeField(_("completed at"))
    comment = models.TextField(_("comment"), blank=True)
    photo = models.ImageField(
        _("photo proof"),
        upload_to="task_completions/",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _("task completion")
        verbose_name_plural = _("task completions")

    def __str__(self):
        return f"{self.task} completed by {self.completed_by}"
