"""
Koimeret Dairies - Health API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    HealthEventViewSet,
    TreatmentViewSet,
    WithdrawalViewSet,
    VaccinationViewSet,
    VaccinationScheduleViewSet,
)

router = DefaultRouter()
router.register(r"health/events", HealthEventViewSet, basename="health-event")
router.register(r"health/treatments", TreatmentViewSet, basename="treatment")
router.register(r"health/withdrawals", WithdrawalViewSet, basename="withdrawal")
router.register(r"vaccinations", VaccinationViewSet, basename="vaccination")
router.register(r"vaccinations/schedules", VaccinationScheduleViewSet, basename="vaccination-schedule")

urlpatterns = [
    path("", include(router.urls)),
]
