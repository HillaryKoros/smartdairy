"""
Koimeret Dairies - Dashboard API
"""
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum, Count, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class OwnerDashboardView(APIView):
    """Dashboard API for farm owner."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        farm = user.active_farm

        if not farm:
            return Response({"error": "No active farm"}, status=400)

        today = date.today()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Import models
        from apps.dairy.models import Cow, MilkLog
        from apps.feeds.models import InventoryBalance
        from apps.health.models import Withdrawal, Vaccination
        from apps.tasks.models import TaskInstance
        from apps.sales.models import Sale
        from apps.alerts.models import Alert

        # Production KPIs
        today_milk = MilkLog.objects.filter(
            farm=farm, date=today, is_latest=True
        ).aggregate(total=Sum("liters"))["total"] or Decimal("0")

        milking_cows = Cow.objects.filter(farm=farm, status="milking").count()
        liters_per_cow = today_milk / milking_cows if milking_cows > 0 else Decimal("0")

        week_avg = MilkLog.objects.filter(
            farm=farm, date__gte=week_ago, is_latest=True
        ).values("date").annotate(
            daily_total=Sum("liters")
        ).aggregate(avg=Avg("daily_total"))["avg"] or Decimal("0")

        # Financial KPIs
        month_sales = Sale.objects.filter(
            farm=farm, date__gte=month_ago
        ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

        # Inventory
        low_stock_count = sum(
            1 for inv in InventoryBalance.objects.filter(farm=farm)
            if inv.is_low_stock
        )

        # Health
        active_withdrawals = Withdrawal.objects.filter(
            farm=farm, is_active=True, end_date__gte=today
        ).count()

        vaccines_due = Vaccination.objects.filter(
            farm=farm,
            next_due_date__gte=today,
            next_due_date__lte=today + timedelta(days=7)
        ).count()

        # Tasks
        today_tasks = TaskInstance.objects.filter(farm=farm, task_date=today)
        tasks_missed = today_tasks.filter(
            status="pending"
        ).exclude(due_time=None).count()  # Simplified check

        # Alerts
        open_alerts = Alert.objects.filter(farm=farm, status="open").count()

        # Cow stats
        cow_stats = {}
        for status_code, _ in Cow.STATUS_CHOICES:
            cow_stats[status_code] = Cow.objects.filter(farm=farm, status=status_code).count()

        return Response({
            "kpis": {
                "total_liters_today": float(today_milk),
                "liters_per_cow_today": float(round(liters_per_cow, 2)),
                "avg_7day_liters_per_cow": float(round(week_avg / max(milking_cows, 1), 2)),
                "sales_this_month": float(month_sales),
                "low_stock_items": low_stock_count,
                "vaccines_due_7days": vaccines_due,
                "active_withdrawals": active_withdrawals,
                "tasks_missed_today": tasks_missed,
                "open_alerts": open_alerts,
            },
            "cow_stats": cow_stats,
            "farm": {
                "name": farm.name,
                "total_cows": Cow.objects.filter(farm=farm, is_active=True).count(),
                "milking_cows": milking_cows,
            },
        })


class WorkerDashboardView(APIView):
    """Dashboard API for farm worker."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        farm = user.active_farm

        if not farm:
            return Response({"error": "No active farm"}, status=400)

        today = date.today()

        from apps.dairy.models import MilkLog
        from apps.feeds.models import FeedUsageLog
        from apps.tasks.models import TaskInstance

        # Today's tasks
        today_tasks = TaskInstance.objects.filter(farm=farm, task_date=today)
        tasks_done = today_tasks.filter(status="done").count()
        tasks_total = today_tasks.count()

        # Today's milk logs
        milk_sessions = MilkLog.objects.filter(
            farm=farm, date=today, is_latest=True
        ).values("session").annotate(count=Count("id"))

        # Today's feed entries
        feed_entries = FeedUsageLog.objects.filter(
            farm=farm, date=today
        ).count()

        return Response({
            "kpis": {
                "tasks_done": tasks_done,
                "tasks_total": tasks_total,
                "tasks_progress": f"{tasks_done}/{tasks_total}",
                "milk_sessions_logged": len(milk_sessions),
                "feed_entries_today": feed_entries,
            },
            "today_tasks": [
                {
                    "id": t.id,
                    "name": t.name,
                    "status": t.status,
                    "due_time": str(t.due_time) if t.due_time else None,
                }
                for t in today_tasks[:10]
            ],
        })
