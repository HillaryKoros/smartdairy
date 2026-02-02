"""
Koimeret Dairies - Tasks API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import TaskTemplateViewSet, TaskInstanceViewSet

router = DefaultRouter()
router.register(r"tasks/templates", TaskTemplateViewSet, basename="task-template")
router.register(r"tasks", TaskInstanceViewSet, basename="task")

urlpatterns = [
    path("", include(router.urls)),
]
