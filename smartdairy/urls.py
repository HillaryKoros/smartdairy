"""
Koimeret Dairies - URL Configuration
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.documents import urls as wagtaildocs_urls

# Wagtail API Router
api_router = WagtailAPIRouter("wagtailapi")
api_router.register_endpoint("pages", PagesAPIViewSet)

urlpatterns = [
    # Django admin
    path("django-admin/", admin.site.urls),

    # Wagtail admin
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),

    # Wagtail API
    path("api/wagtail/", api_router.urls),

    # Dashboard APIs
    path("api/v1/dashboard/owner/", __import__("apps.core.api", fromlist=["OwnerDashboardView"]).OwnerDashboardView.as_view(), name="owner-dashboard"),
    path("api/v1/dashboard/worker/", __import__("apps.core.api", fromlist=["WorkerDashboardView"]).WorkerDashboardView.as_view(), name="worker-dashboard"),

    # App APIs
    path("api/v1/", include("apps.farm.urls")),
    path("api/v1/", include("apps.dairy.api.urls")),
    path("api/v1/", include("apps.feeds.api.urls")),
    path("api/v1/", include("apps.health.api.urls")),
    path("api/v1/", include("apps.tasks.api.urls")),
    path("api/v1/", include("apps.sales.api.urls")),
    path("api/v1/", include("apps.alerts.api.urls")),

    # Wagtail catch-all (must be last)
    path("", include(wagtail_urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Debug toolbar (only if installed)
    try:
        import debug_toolbar
        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass
