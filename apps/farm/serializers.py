"""
Koimeret Dairies - Farm Serializers
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Farm, FarmMembership, Role, Device

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "phone", "full_name", "email", "is_active", "active_farm", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "phone", "full_name", "email", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class FarmSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.full_name", read_only=True)

    class Meta:
        model = Farm
        fields = [
            "id", "name", "location", "timezone", "currency",
            "phone", "email", "settings", "owner", "owner_name",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FarmMembershipSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    farm_name = serializers.CharField(source="farm.name", read_only=True)
    role_name = serializers.CharField(source="role.get_name_display", read_only=True)

    class Meta:
        model = FarmMembership
        fields = [
            "id", "user", "user_name", "user_phone",
            "farm", "farm_name", "role", "role_name",
            "is_active", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = [
            "id", "device_id", "device_type", "device_name",
            "push_token", "last_seen_at", "is_active",
            "farm", "user", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class RegisterSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    full_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    farm_name = serializers.CharField(max_length=200, required=False)

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already registered")
        return value

    def create(self, validated_data):
        farm_name = validated_data.pop("farm_name", None)
        password = validated_data.pop("password")

        # Create user
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        # Create farm if name provided
        if farm_name:
            farm = Farm.objects.create(name=farm_name, owner=user)
            user.active_farm = farm
            user.save()

            # Create owner membership
            owner_role, _ = Role.objects.get_or_create(name="owner")
            FarmMembership.objects.create(user=user, farm=farm, role=owner_role)

        return user
