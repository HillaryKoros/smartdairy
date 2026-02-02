"""
Koimeret Dairies - Alerts API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AlertViewSet, NotificationViewSet, AlertRuleViewSet

router = DefaultRouter()
router.register(r"alerts", AlertViewSet, basename="alert")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"alerts/rules", AlertRuleViewSet, basename="alert-rule")

urlpatterns = [
    path("", include(router.urls)),
]
