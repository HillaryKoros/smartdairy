"""
Koimeret Dairies - Sales API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BuyerViewSet, SaleViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r"buyers", BuyerViewSet, basename="buyer")
router.register(r"sales", SaleViewSet, basename="sale")
router.register(r"payments", PaymentViewSet, basename="payment")

urlpatterns = [
    path("", include(router.urls)),
]
