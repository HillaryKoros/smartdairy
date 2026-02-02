"""
Koimeret Dairies - Farm API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    UserViewSet,
    FarmViewSet,
    FarmMembershipViewSet,
    DeviceViewSet,
    RegisterView,
    LogoutView,
    CurrentUserView,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"farms", FarmViewSet, basename="farm")
router.register(r"memberships", FarmMembershipViewSet, basename="membership")
router.register(r"devices", DeviceViewSet, basename="device")

urlpatterns = [
    path("auth/login/", obtain_auth_token, name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", CurrentUserView.as_view(), name="current-user"),
    path("", include(router.urls)),
]
