"""
Koimeret Dairies - Database Initialization Command
"""
import os
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Initialize database with default data for Koimeret Dairies"

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-if-exists",
            action="store_true",
            help="Skip initialization if admin user already exists",
        )

    def handle(self, *args, **options):
        skip_if_exists = options.get("skip_if_exists", False)

        # Check if already initialized
        if skip_if_exists and User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.WARNING("Database already initialized. Skipping."))
            return

        self.stdout.write("Initializing Koimeret Dairies database...")

        # Create roles
        self.create_roles()

        # Create admin user and farm
        admin_user, farm = self.create_admin_and_farm()

        # Create sample users with different roles
        self.create_sample_users(farm)

        # Create sample data
        self.create_sample_cows(farm)
        self.create_sample_feed_items(farm)
        self.create_sample_task_templates(farm)
        self.create_sample_buyers(farm)
        self.create_alert_rules(farm)

        self.stdout.write(self.style.SUCCESS("Database initialization complete!"))
        self.stdout.write(f"Admin Phone: {admin_user.phone}")
        self.stdout.write(f"Farm: {farm.name}")

    def create_roles(self):
        from apps.farm.models import Role

        roles = [
            ("owner", "Farm owner with full access"),
            ("worker", "Farm worker with limited access"),
            ("vet", "Veterinarian with health-related access"),
            ("admin", "System administrator"),
            ("auditor", "Financial auditor with read-only access"),
            ("procurement", "Procurement officer for supplies and purchases"),
        ]

        for name, description in roles:
            Role.objects.get_or_create(name=name, defaults={"description": description})

        self.stdout.write("  Created roles")

    def create_admin_and_farm(self):
        from apps.farm.models import Farm, Role, FarmMembership

        # Get admin credentials from environment
        phone = os.environ.get("DJANGO_SUPERUSER_PHONE", "0700000000")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")

        # Create admin user
        admin_user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                "full_name": "Farm Administrator",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if created:
            admin_user.set_password(password)
            admin_user.save()
            self.stdout.write(f"  Created admin user: {phone}")
        else:
            self.stdout.write(f"  Admin user already exists: {phone}")

        # Create farm
        farm, created = Farm.objects.get_or_create(
            name="Koimeret Dairies",
            defaults={
                "owner": admin_user,
                "location": "Kericho, Kenya",
                "timezone": "Africa/Nairobi",
                "currency": "KES",
                "phone": phone,
            }
        )

        # Set admin's active farm
        admin_user.active_farm = farm
        admin_user.save()

        # Create owner membership
        owner_role = Role.objects.get(name="owner")
        FarmMembership.objects.get_or_create(
            user=admin_user,
            farm=farm,
            defaults={"role": owner_role}
        )

        if created:
            self.stdout.write(f"  Created farm: {farm.name}")
        else:
            self.stdout.write(f"  Farm already exists: {farm.name}")

        return admin_user, farm

    def create_sample_users(self, farm):
        """Create sample users with different roles for testing"""
        from apps.farm.models import Role, FarmMembership

        sample_users = [
            {
                "phone": "0711111111",
                "full_name": "John Kipchoge",
                "password": "worker123",
                "role": "worker",
            },
            {
                "phone": "0722222222",
                "full_name": "Mary Wanjiku",
                "password": "worker123",
                "role": "worker",
            },
            {
                "phone": "0733333333",
                "full_name": "Dr. Peter Ochieng",
                "password": "vet12345",
                "role": "vet",
            },
            {
                "phone": "0744444444",
                "full_name": "Sarah Kimani",
                "password": "auditor123",
                "role": "auditor",
            },
            {
                "phone": "0755555555",
                "full_name": "James Mwangi",
                "password": "procure123",
                "role": "procurement",
            },
        ]

        for user_data in sample_users:
            role = Role.objects.get(name=user_data["role"])

            user, created = User.objects.get_or_create(
                phone=user_data["phone"],
                defaults={
                    "full_name": user_data["full_name"],
                    "is_staff": False,
                    "is_superuser": False,
                }
            )

            if created:
                user.set_password(user_data["password"])
                user.active_farm = farm
                user.save()

                # Create farm membership
                FarmMembership.objects.get_or_create(
                    user=user,
                    farm=farm,
                    defaults={"role": role}
                )

        self.stdout.write(f"  Created {len(sample_users)} sample users")
        self.stdout.write("  Sample users:")
        self.stdout.write("    Worker 1: 0711111111 / worker123")
        self.stdout.write("    Worker 2: 0722222222 / worker123")
        self.stdout.write("    Vet: 0733333333 / vet12345")
        self.stdout.write("    Auditor: 0744444444 / auditor123")
        self.stdout.write("    Procurement: 0755555555 / procure123")

    def create_sample_cows(self, farm):
        from apps.dairy.models import Cow

        cows_data = [
            {"tag_number": "KD001", "name": "Malkia", "breed": "Friesian", "status": "milking"},
            {"tag_number": "KD002", "name": "Neema", "breed": "Ayrshire", "status": "milking"},
            {"tag_number": "KD003", "name": "Baraka", "breed": "Friesian", "status": "milking"},
            {"tag_number": "KD004", "name": "Amani", "breed": "Jersey", "status": "milking"},
            {"tag_number": "KD005", "name": "Zawadi", "breed": "Friesian", "status": "dry"},
            {"tag_number": "KD006", "name": "Faraja", "breed": "Guernsey", "status": "pregnant"},
            {"tag_number": "KD007", "name": "Upendo", "breed": "Friesian", "status": "heifer"},
            {"tag_number": "KD008", "name": "Rehema", "breed": "Ayrshire", "status": "milking"},
        ]

        for cow_data in cows_data:
            Cow.objects.get_or_create(
                farm=farm,
                tag_number=cow_data["tag_number"],
                defaults=cow_data
            )

        self.stdout.write(f"  Created {len(cows_data)} sample cows")

    def create_sample_feed_items(self, farm):
        from apps.feeds.models import FeedItem, InventoryBalance

        feeds_data = [
            {"name": "Dairy Meal", "category": "concentrate", "unit": "kg", "reorder_level": 100, "cost_per_unit": 45},
            {"name": "Hay", "category": "roughage", "unit": "bales", "reorder_level": 20, "cost_per_unit": 300},
            {"name": "Silage", "category": "roughage", "unit": "kg", "reorder_level": 500, "cost_per_unit": 8},
            {"name": "Mineral Lick", "category": "mineral", "unit": "kg", "reorder_level": 10, "cost_per_unit": 150},
            {"name": "Molasses", "category": "supplement", "unit": "liters", "reorder_level": 50, "cost_per_unit": 35},
            {"name": "Maize Germ", "category": "concentrate", "unit": "kg", "reorder_level": 50, "cost_per_unit": 30},
        ]

        for feed_data in feeds_data:
            feed_item, created = FeedItem.objects.get_or_create(
                farm=farm,
                name=feed_data["name"],
                defaults=feed_data
            )

            # Create initial inventory balance
            if created:
                InventoryBalance.objects.get_or_create(
                    farm=farm,
                    feed_item=feed_item,
                    defaults={
                        "quantity_on_hand": Decimal("200"),
                        "unit": feed_data["unit"],
                    }
                )

        self.stdout.write(f"  Created {len(feeds_data)} feed items with inventory")

    def create_sample_task_templates(self, farm):
        from apps.tasks.models import TaskTemplate
        from apps.farm.models import Role
        from datetime import time

        worker_role = Role.objects.get(name="worker")

        templates_data = [
            {"name": "Morning Milking", "category": "daily", "default_time": time(6, 0)},
            {"name": "Evening Milking", "category": "daily", "default_time": time(16, 0)},
            {"name": "Feed Distribution - Morning", "category": "daily", "default_time": time(7, 0)},
            {"name": "Feed Distribution - Evening", "category": "daily", "default_time": time(17, 0)},
            {"name": "Clean Milking Equipment", "category": "daily", "default_time": time(8, 0)},
            {"name": "Check Water Troughs", "category": "daily", "default_time": time(9, 0)},
            {"name": "Health Check Rounds", "category": "daily", "default_time": time(10, 0)},
            {"name": "Clean Cow Shed", "category": "daily", "default_time": time(11, 0)},
            {"name": "Weekly Feed Inventory Check", "category": "weekly", "default_time": time(9, 0)},
            {"name": "Monthly Vaccination Review", "category": "monthly", "default_time": time(10, 0)},
        ]

        for idx, template_data in enumerate(templates_data):
            TaskTemplate.objects.get_or_create(
                farm=farm,
                name=template_data["name"],
                defaults={
                    **template_data,
                    "default_assignee_role": worker_role,
                    "order": idx,
                }
            )

        self.stdout.write(f"  Created {len(templates_data)} task templates")

    def create_sample_buyers(self, farm):
        from apps.sales.models import Buyer

        buyers_data = [
            {"name": "Kericho Dairy Cooperative", "buyer_type": "dairy_collection_center", "phone": "0720123456"},
            {"name": "Joseph Kiprop", "buyer_type": "regular", "phone": "0712345678"},
            {"name": "Mary Chebet", "buyer_type": "regular", "phone": "0723456789"},
            {"name": "Walk-in Customer", "buyer_type": "walk_in"},
        ]

        for buyer_data in buyers_data:
            Buyer.objects.get_or_create(
                farm=farm,
                name=buyer_data["name"],
                defaults=buyer_data
            )

        self.stdout.write(f"  Created {len(buyers_data)} buyers")

    def create_alert_rules(self, farm):
        from apps.alerts.models import AlertRule

        rules_data = [
            {
                "name": "Low Feed Stock Alert",
                "alert_type": "low_stock",
                "parameters": {"days_threshold": 7},
                "notification_channels": ["in_app"],
            },
            {
                "name": "Milk Yield Drop Alert",
                "alert_type": "yield_drop",
                "parameters": {"drop_threshold_percent": 30},
                "notification_channels": ["in_app", "sms"],
            },
            {
                "name": "Vaccine Due Alert",
                "alert_type": "vaccine_due",
                "parameters": {"days_before": 7},
                "notification_channels": ["in_app"],
            },
            {
                "name": "Active Withdrawal Alert",
                "alert_type": "withdrawal_active",
                "parameters": {},
                "notification_channels": ["in_app", "sms"],
            },
            {
                "name": "Missed Task Alert",
                "alert_type": "task_missed",
                "parameters": {"grace_period_minutes": 30},
                "notification_channels": ["in_app"],
            },
        ]

        for rule_data in rules_data:
            AlertRule.objects.get_or_create(
                farm=farm,
                name=rule_data["name"],
                defaults={
                    **rule_data,
                    "notify_owner": True,
                }
            )

        self.stdout.write(f"  Created {len(rules_data)} alert rules")
