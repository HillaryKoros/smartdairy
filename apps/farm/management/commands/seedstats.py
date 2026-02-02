"""
Generate sample yearly statistics for Koimeret Dairies
Run: python manage.py seedstats
"""
import random
from datetime import date, timedelta, time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = "Generate sample yearly statistics (milk logs, sales, tasks)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=365,
            help="Number of days of data to generate (default: 365)",
        )

    def handle(self, *args, **options):
        from apps.farm.models import Farm
        from apps.dairy.models import Cow, MilkLog
        from apps.sales.models import Sale, Buyer
        from apps.tasks.models import TaskTemplate, TaskInstance
        from apps.feeds.models import FeedItem, FeedPurchase

        days = options["days"]
        farm = Farm.objects.filter(name="Koimeret Dairies").first()

        if not farm:
            self.stdout.write(self.style.ERROR("Farm 'Koimeret Dairies' not found. Run initdb first."))
            return

        self.stdout.write(f"Generating {days} days of sample statistics...")

        # Get cows and workers
        cows = list(Cow.objects.filter(farm=farm, status="milking"))
        workers = list(User.objects.filter(phone__in=["0711111111", "0722222222"]))
        admin = User.objects.filter(phone="0700000000").first()
        buyer = Buyer.objects.filter(farm=farm, buyer_type="dairy_collection_center").first()
        regular_buyer = Buyer.objects.filter(farm=farm, buyer_type="regular").first()

        if not cows:
            self.stdout.write(self.style.WARNING("No milking cows found"))
        if not workers:
            self.stdout.write(self.style.WARNING("No workers found"))

        # Generate milk logs
        milk_count = 0
        for day_offset in range(days):
            log_date = date.today() - timedelta(days=day_offset)

            for cow in cows:
                worker = random.choice(workers) if workers else admin

                # Morning milking
                morning_liters = Decimal(str(round(random.uniform(14, 20), 1)))
                MilkLog.objects.get_or_create(
                    farm=farm,
                    cow=cow,
                    date=log_date,
                    session="morning",
                    defaults={
                        "liters": morning_liters,
                        "milked_by": worker,
                    }
                )
                milk_count += 1

                # Evening milking
                evening_liters = Decimal(str(round(random.uniform(12, 16), 1)))
                MilkLog.objects.get_or_create(
                    farm=farm,
                    cow=cow,
                    date=log_date,
                    session="evening",
                    defaults={
                        "liters": evening_liters,
                        "milked_by": worker,
                    }
                )
                milk_count += 1

        self.stdout.write(f"  Created {milk_count} milk log entries")

        # Generate daily milk sales
        sales_count = 0
        if buyer:
            for day_offset in range(days):
                sale_date = date.today() - timedelta(days=day_offset)
                liters = Decimal(str(round(random.uniform(25, 45), 1)))
                price = Decimal("60.00")

                Sale.objects.get_or_create(
                    farm=farm,
                    sale_date=sale_date,
                    buyer=buyer,
                    sale_type="milk",
                    defaults={
                        "liters_sold": liters,
                        "price_per_liter": price,
                        "total_amount": liters * price,
                        "payment_status": random.choice(["paid", "paid", "paid", "pending"]),
                        "recorded_by": admin,
                    }
                )
                sales_count += 1

        self.stdout.write(f"  Created {sales_count} milk sales")

        # Generate monthly livestock sales
        livestock_count = 0
        if regular_buyer:
            for month_offset in range(12):
                sale_date = date.today() - timedelta(days=month_offset * 30)
                quantity = random.randint(1, 3)
                unit_price = Decimal(str(random.randint(8000, 18000)))
                notes = random.choice([
                    "Sold mature ewe",
                    "Sold lamb for meat",
                    "Sold breeding ram",
                    "Mutton sale - 15kg"
                ])

                Sale.objects.get_or_create(
                    farm=farm,
                    sale_date=sale_date,
                    buyer=regular_buyer,
                    sale_type="livestock",
                    defaults={
                        "quantity": quantity,
                        "unit_price": unit_price,
                        "total_amount": quantity * unit_price,
                        "payment_status": "paid",
                        "notes": notes,
                        "recorded_by": admin,
                    }
                )
                livestock_count += 1

        self.stdout.write(f"  Created {livestock_count} livestock sales")

        # Generate feed purchases
        feed_count = 0
        feed_items = list(FeedItem.objects.filter(farm=farm))
        suppliers = ["Bomet Agrovet", "Kericho Feeds Ltd", "Narok Suppliers"]

        for month_offset in range(12):
            purchase_date = date.today() - timedelta(days=month_offset * 30)

            for feed_item in feed_items:
                quantity = Decimal(str(random.randint(50, 200)))

                FeedPurchase.objects.get_or_create(
                    farm=farm,
                    feed_item=feed_item,
                    purchase_date=purchase_date,
                    defaults={
                        "quantity": quantity,
                        "unit_price": feed_item.cost_per_unit,
                        "total_cost": quantity * feed_item.cost_per_unit,
                        "supplier": random.choice(suppliers),
                        "recorded_by": admin,
                    }
                )
                feed_count += 1

        self.stdout.write(f"  Created {feed_count} feed purchases")

        # Generate task instances
        task_count = 0
        templates = list(TaskTemplate.objects.filter(farm=farm, category="daily"))

        for day_offset in range(min(days, 60)):  # Last 60 days of tasks
            task_date = date.today() - timedelta(days=day_offset)

            for template in templates:
                worker = random.choice(workers) if workers else admin
                completed = random.random() > 0.1  # 90% completion rate

                TaskInstance.objects.get_or_create(
                    farm=farm,
                    template=template,
                    scheduled_date=task_date,
                    defaults={
                        "assigned_to": worker,
                        "scheduled_time": template.default_time,
                        "status": "completed" if completed else "skipped",
                        "completed_at": timezone.now() - timedelta(days=day_offset) if completed else None,
                        "completed_by": worker if completed else None,
                    }
                )
                task_count += 1

        self.stdout.write(f"  Created {task_count} task instances")

        # Generate health events
        from apps.health.models import HealthEvent, Treatment, Vaccination

        vet = User.objects.filter(phone="0733333333").first()
        health_count = 0

        health_issues = [
            {"symptoms": "Reduced appetite, lethargy", "diagnosis": "Mild fever", "severity": "low"},
            {"symptoms": "Limping on front left leg", "diagnosis": "Hoof infection", "severity": "medium"},
            {"symptoms": "Swollen udder, mastitis signs", "diagnosis": "Mastitis", "severity": "high"},
            {"symptoms": "Coughing, nasal discharge", "diagnosis": "Respiratory infection", "severity": "medium"},
            {"symptoms": "Bloating, discomfort", "diagnosis": "Bloat", "severity": "medium"},
            {"symptoms": "Eye discharge, redness", "diagnosis": "Pinkeye", "severity": "low"},
            {"symptoms": "Diarrhea, dehydration", "diagnosis": "Digestive upset", "severity": "medium"},
        ]

        for month_offset in range(12):
            event_date = date.today() - timedelta(days=month_offset * 30 + random.randint(0, 15))
            cow = random.choice(cows) if cows else None

            if cow:
                issue = random.choice(health_issues)
                is_resolved = month_offset > 0  # Recent ones not resolved

                event, created = HealthEvent.objects.get_or_create(
                    farm=farm,
                    cow=cow,
                    date=event_date,
                    symptoms=issue["symptoms"],
                    defaults={
                        "diagnosis": issue["diagnosis"],
                        "severity": issue["severity"],
                        "temperature": Decimal(str(round(random.uniform(38.0, 40.5), 1))),
                        "reported_by": random.choice(workers) if workers else admin,
                        "is_resolved": is_resolved,
                        "resolved_at": timezone.now() - timedelta(days=month_offset * 30 - 3) if is_resolved else None,
                    }
                )
                health_count += 1

                # Add treatment for resolved events
                if is_resolved and created:
                    treatments = [
                        {"name": "Penstrep", "dose": "10ml", "route": "injection_im", "withdrawal": 5},
                        {"name": "Oxytetracycline", "dose": "15ml", "route": "injection_im", "withdrawal": 7},
                        {"name": "Mastitis tube", "dose": "1 tube", "route": "intramammary", "withdrawal": 4},
                        {"name": "Anti-inflammatory", "dose": "5ml", "route": "injection_iv", "withdrawal": 2},
                    ]
                    treatment_data = random.choice(treatments)

                    Treatment.objects.get_or_create(
                        farm=farm,
                        cow=cow,
                        health_event=event,
                        date=event_date + timedelta(days=1),
                        defaults={
                            "treatment_name": treatment_data["name"],
                            "dose": treatment_data["dose"],
                            "route": treatment_data["route"],
                            "administered_by": vet or admin,
                            "cost": Decimal(str(random.randint(500, 2000))),
                            "milk_withdrawal_days": treatment_data["withdrawal"],
                        }
                    )

        self.stdout.write(f"  Created {health_count} health events")

        # Generate vaccinations
        vacc_count = 0
        vaccines = [
            {"name": "FMD Vaccine", "interval": 6},
            {"name": "Blackquarter", "interval": 12},
            {"name": "Anthrax", "interval": 12},
            {"name": "Lumpy Skin Disease", "interval": 12},
            {"name": "Brucellosis", "interval": 12},
        ]

        for cow in cows:
            for vaccine in vaccines:
                vacc_date = date.today() - timedelta(days=random.randint(30, 300))
                next_due = vacc_date + timedelta(days=vaccine["interval"] * 30)

                Vaccination.objects.get_or_create(
                    farm=farm,
                    cow=cow,
                    vaccine_name=vaccine["name"],
                    date=vacc_date,
                    defaults={
                        "dose": "2ml",
                        "administered_by": vet or admin,
                        "next_due_date": next_due,
                        "cost": Decimal(str(random.randint(100, 500))),
                    }
                )
                vacc_count += 1

        self.stdout.write(f"  Created {vacc_count} vaccination records")

        self.stdout.write(self.style.SUCCESS("\nYearly statistics generated successfully!"))

        # Print summary
        self.stdout.write("\n=== SUMMARY ===")
        total_milk = MilkLog.objects.filter(farm=farm).aggregate(
            total=sum([m.liters for m in MilkLog.objects.filter(farm=farm)]) if MilkLog.objects.filter(farm=farm).exists() else 0
        )
        total_sales = Sale.objects.filter(farm=farm).count()

        self.stdout.write(f"  Total milk logs: {MilkLog.objects.filter(farm=farm).count()}")
        self.stdout.write(f"  Total sales: {total_sales}")
        self.stdout.write(f"  Total tasks: {TaskInstance.objects.filter(farm=farm).count()}")
