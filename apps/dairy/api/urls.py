"""
Koimeret Dairies - Dairy API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CowViewSet, MilkLogViewSet, MilkProductionSummaryViewSet

router = DefaultRouter()
router.register(r"cows", CowViewSet, basename="cow")
router.register(r"milk/logs", MilkLogViewSet, basename="milk-log")
router.register(r"milk/summaries", MilkProductionSummaryViewSet, basename="milk-summary")

urlpatterns = [
    path("", include(router.urls)),
]
