"""
Koimeret Dairies - Core Models and Mixins
"""
from django.conf import settings
from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    """
    Abstract base model with created_at and updated_at timestamps.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AuditableModel(TimeStampedModel):
    """
    Abstract base model with audit fields for tracking who created/modified records.
    """
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_created",
    )
    modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_modified",
    )

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """
    Abstract base model for soft deletion.
    """
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_deleted",
    )

    class Meta:
        abstract = True

    def soft_delete(self, user=None):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])


class FarmScopedModel(models.Model):
    """
    Abstract base model for farm-scoped records.
    """
    farm = models.ForeignKey(
        "farm.Farm",
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
    )

    class Meta:
        abstract = True


class SyncableModel(models.Model):
    """
    Abstract base model for records that sync between devices.
    """
    SYNC_STATUS_CHOICES = [
        ("pending", "Pending Sync"),
        ("synced", "Synced"),
        ("conflict", "Conflict"),
    ]

    sync_status = models.CharField(
        max_length=20,
        choices=SYNC_STATUS_CHOICES,
        default="pending",
    )
    device_id = models.CharField(max_length=100, blank=True)
    local_id = models.CharField(max_length=100, blank=True)
    synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class RevisionMixin(models.Model):
    """
    Abstract mixin for revision tracking (immutable audit trail).
    """
    revision = models.PositiveIntegerField(default=1)
    is_latest = models.BooleanField(default=True)
    previous_revision = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="next_revisions",
    )

    class Meta:
        abstract = True

    def create_revision(self, **updates):
        """Create a new revision with the given updates."""
        # Mark current as not latest
        self.is_latest = False
        self.save(update_fields=["is_latest"])

        # Create new revision
        new_data = {
            field.name: getattr(self, field.name)
            for field in self._meta.fields
            if field.name not in ["id", "revision", "is_latest", "previous_revision", "created_at"]
        }
        new_data.update(updates)
        new_data["revision"] = self.revision + 1
        new_data["is_latest"] = True
        new_data["previous_revision"] = self

        return self.__class__.objects.create(**new_data)
