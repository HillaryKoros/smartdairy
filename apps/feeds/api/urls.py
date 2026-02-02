"""
Koimeret Dairies - Feeds API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FeedItemViewSet,
    FeedPurchaseViewSet,
    FeedUsageLogViewSet,
    InventoryBalanceViewSet,
    InventoryMovementViewSet,
    QRScanView,
)

router = DefaultRouter()
router.register(r"feeds/items", FeedItemViewSet, basename="feed-item")
router.register(r"feeds/purchases", FeedPurchaseViewSet, basename="feed-purchase")
router.register(r"feeds/usage", FeedUsageLogViewSet, basename="feed-usage")
router.register(r"inventory/balances", InventoryBalanceViewSet, basename="inventory-balance")
router.register(r"inventory/movements", InventoryMovementViewSet, basename="inventory-movement")

urlpatterns = [
    path("feeds/scan/", QRScanView.as_view(), name="qr-scan"),
    path("", include(router.urls)),
]
