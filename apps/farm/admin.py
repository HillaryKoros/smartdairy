"""
Koimeret Dairies - Farm Admin
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User, Role, Farm, FarmMembership, Device, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["phone", "full_name", "email", "is_active", "is_staff"]
    list_filter = ["is_active", "is_staff", "is_superuser"]
    search_fields = ["phone", "full_name", "email"]
    ordering = ["phone"]

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        (_("Personal info"), {"fields": ("full_name", "email")}),
        (_("Farm"), {"fields": ("active_farm",)}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("phone", "full_name", "password1", "password2"),
            },
        ),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ["name", "description"]


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ["name", "location", "owner", "created_at"]
    list_filter = ["timezone", "currency"]
    search_fields = ["name", "location"]
    raw_id_fields = ["owner"]


@admin.register(FarmMembership)
class FarmMembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "farm", "role", "is_active", "created_at"]
    list_filter = ["role", "is_active", "farm"]
    search_fields = ["user__phone", "user__full_name", "farm__name"]
    raw_id_fields = ["user", "farm"]


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ["device_id", "user", "farm", "device_type", "last_seen_at", "is_active"]
    list_filter = ["device_type", "is_active", "farm"]
    search_fields = ["device_id", "device_name", "user__phone"]
    raw_id_fields = ["user", "farm"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "entity_type", "entity_id", "user", "created_at"]
    list_filter = ["action", "entity_type", "farm"]
    search_fields = ["entity_id", "user__phone"]
    readonly_fields = ["farm", "user", "action", "entity_type", "entity_id", "payload", "ip_address", "user_agent", "created_at"]
    date_hierarchy = "created_at"
