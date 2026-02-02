"""
Koimeret Dairies - Tasks API Views
"""
from datetime import date, timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.tasks.models import TaskTemplate, TaskInstance, TaskCompletion
from .serializers import (
    TaskTemplateSerializer,
    TaskInstanceSerializer,
    TaskCompletionSerializer,
    TaskCompleteSerializer,
    TaskSkipSerializer,
)


class TaskTemplateViewSet(viewsets.ModelViewSet):
    """Task template management."""
    serializer_class = TaskTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name", "description"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            return TaskTemplate.objects.filter(farm=user.active_farm)
        return TaskTemplate.objects.none()

    def perform_create(self, serializer):
        serializer.save(farm=self.request.user.active_farm)


class TaskInstanceViewSet(viewsets.ModelViewSet):
    """Task instance management."""
    serializer_class = TaskInstanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "priority", "task_date", "assignee"]
    search_fields = ["name", "description"]
    ordering = ["task_date", "due_time", "-priority"]

    def get_queryset(self):
        user = self.request.user
        if user.active_farm:
            queryset = TaskInstance.objects.filter(farm=user.active_farm)
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(task_date__gte=date_from)
            if date_to:
                queryset = queryset.filter(task_date__lte=date_to)
            return queryset.select_related("completion")
        return TaskInstance.objects.none()

    def perform_create(self, serializer):
        serializer.save(farm=self.request.user.active_farm)

    @action(detail=False, methods=["get"])
    def today(self, request):
        """Get today's tasks."""
        today = date.today()
        tasks = self.get_queryset().filter(task_date=today)
        serializer = TaskInstanceSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my_tasks(self, request):
        """Get tasks assigned to current user."""
        user = request.user
        tasks = self.get_queryset().filter(
            assignee=user,
            task_date__gte=date.today(),
        )
        serializer = TaskInstanceSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        """Get all pending tasks."""
        tasks = self.get_queryset().filter(status="pending")
        serializer = TaskInstanceSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def overdue(self, request):
        """Get overdue tasks."""
        now = timezone.now()
        today = now.date()
        current_time = now.time()

        tasks = self.get_queryset().filter(
            status="pending"
        ).filter(
            # Past dates
            task_date__lt=today
        ) | self.get_queryset().filter(
            status="pending",
            task_date=today,
            due_time__lt=current_time,
        )

        serializer = TaskInstanceSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Mark task as completed."""
        task = self.get_object()
        serializer = TaskCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create completion record
        completion = TaskCompletion.objects.create(
            task=task,
            completed_by=request.user,
            completed_at=timezone.now(),
            comment=serializer.validated_data.get("comment", ""),
            photo=serializer.validated_data.get("photo"),
        )

        # Update task status
        task.status = "done"
        task.save()

        return Response(TaskInstanceSerializer(task).data)

    @action(detail=True, methods=["post"])
    def skip(self, request, pk=None):
        """Skip a task."""
        task = self.get_object()
        serializer = TaskSkipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task.status = "skipped"
        task.save()

        # Optionally store skip reason
        reason = serializer.validated_data.get("reason", "")
        if reason:
            task.description = f"{task.description}\n\n[Skipped: {reason}]"
            task.save()

        return Response(TaskInstanceSerializer(task).data)

    @action(detail=False, methods=["post"])
    def generate_daily(self, request):
        """Generate daily tasks from templates."""
        user = request.user
        if not user.active_farm:
            return Response({"error": "No active farm"}, status=status.HTTP_400_BAD_REQUEST)

        target_date = request.data.get("date", date.today())
        if isinstance(target_date, str):
            target_date = date.fromisoformat(target_date)

        templates = TaskTemplate.objects.filter(
            farm=user.active_farm,
            is_active=True,
            category="daily",
        )

        created_tasks = []
        for template in templates:
            # Check if task already exists for this date
            exists = TaskInstance.objects.filter(
                farm=user.active_farm,
                template=template,
                task_date=target_date,
            ).exists()

            if not exists:
                task = TaskInstance.objects.create(
                    farm=user.active_farm,
                    template=template,
                    name=template.name,
                    description=template.description,
                    task_date=target_date,
                    due_time=template.default_time,
                    assignee_role=template.default_assignee_role,
                )
                created_tasks.append(task)

        return Response({
            "created_count": len(created_tasks),
            "tasks": TaskInstanceSerializer(created_tasks, many=True).data,
        })
