"""
Koimeret Dairies - Context Processors
"""
from django.core.cache import cache


def farm_context(request):
    """
    Add farm context to templates.
    """
    context = {
        "site_name": "Koimeret Dairies",
    }

    if hasattr(request, "user") and request.user.is_authenticated:
        # Get user's active farm
        farm = getattr(request.user, "active_farm", None)
        if farm:
            context["active_farm"] = farm

    return context
