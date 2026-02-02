"""
Koimeret Dairies - Farm Views
"""
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

from .models import Farm, FarmMembership, Device
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    FarmSerializer,
    FarmMembershipSerializer,
    DeviceSerializer,
    RegisterSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """User management endpoints."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            # Return users in the same farm
            return User.objects.filter(
                farm_memberships__farm=user.active_farm
            ).distinct()
        return User.objects.filter(id=user.id)

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer


class FarmViewSet(viewsets.ModelViewSet):
    """Farm management endpoints."""
    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Farm.objects.filter(
            memberships__user=self.request.user,
            memberships__is_active=True,
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class FarmMembershipViewSet(viewsets.ModelViewSet):
    """Farm membership management."""
    serializer_class = FarmMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return FarmMembership.objects.filter(farm=user.active_farm)
        return FarmMembership.objects.filter(user=user)


class DeviceViewSet(viewsets.ModelViewSet):
    """Device registration for offline sync."""
    serializer_class = DeviceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Device.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            farm=self.request.user.active_farm,
        )


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Create auth token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "user": UserSerializer(user).data,
            "token": token.key,
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """Logout endpoint - invalidates token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete the user's token
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({"detail": "Successfully logged out"})


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Get/update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
