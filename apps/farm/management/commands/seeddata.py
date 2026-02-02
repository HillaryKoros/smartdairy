"""
Koimeret Dairies - Comprehensive Sample Data Seeder
Generates realistic farm data for testing including:
- 25 cows with various statuses
- 1 year of milk production logs
- Feed inventory and usage
- Health events and treatments
- Sales and payments
- Task completions
"""
import random
from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed comprehensive sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=365,
            help='Number of days of historical data to generate'
        )

    def handle(self, *args, **options):
        days = options['days']
        self.stdout.write(f'Seeding {days} days of sample data...')

        # Import models
        from apps.farm.models import Farm, User, Role, FarmMembership
        from apps.dairy.models import Cow, MilkLog
        from apps.feeds.models import FeedItem, FeedPurchase, FeedUsageLog, InventoryBalance
        from apps.health.models import HealthEvent, Treatment, Vaccination
        from apps.sales.models import Buyer, Sale, Payment
        from apps.tasks.models import TaskTemplate, TaskInstance

        # Get or create farm
        farm = Farm.objects.first()
        if not farm:
            self.stdout.write(self.style.ERROR('No farm found. Run initdb first.'))
            return

        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            self.stdout.write(self.style.ERROR('No admin user found. Run initdb first.'))
            return

        today = date.today()
        start_date = today - timedelta(days=days)

        # 1. Create Cows
        self.stdout.write('Creating cows...')
        cows = self._create_cows(farm)

        # 2. Create Feed Items
        self.stdout.write('Creating feed items...')
        feed_items = self._create_feed_items(farm)

        # 3. Create Buyers
        self.stdout.write('Creating buyers...')
        buyers = self._create_buyers(farm)

        # 4. Generate daily data
        self.stdout.write(f'Generating daily data from {start_date} to {today}...')

        current_date = start_date
        while current_date <= today:
            # Milk logs
            self._create_milk_logs(farm, cows, current_date, admin)

            # Feed usage (every day)
            self._create_feed_usage(farm, feed_items, current_date, admin)

            # Feed purchases (weekly)
            if current_date.weekday() == 0:  # Monday
                self._create_feed_purchase(farm, feed_items, current_date)

            # Sales (daily)
            self._create_sales(farm, buyers, current_date, admin)

            # Health events (occasional)
            if random.random() < 0.05:  # 5% chance per day
                self._create_health_event(farm, cows, current_date, admin)

            # Tasks
            self._create_task_completions(farm, current_date, admin)

            current_date += timedelta(days=1)

            # Progress indicator
            if (current_date - start_date).days % 30 == 0:
                self.stdout.write(f'  Processed {(current_date - start_date).days} days...')

        # 5. Update inventory balances
        self.stdout.write('Updating inventory balances...')
        self._update_inventory_balances(farm, feed_items)

        # 6. Create some active health events
        self.stdout.write('Creating active health events...')
        self._create_active_health_events(farm, cows, admin)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {days} days of data!'))
        self._print_summary(farm)

    def _create_cows(self, farm):
        from apps.dairy.models import Cow

        # Clear existing cows
        Cow.objects.filter(farm=farm).delete()

        # Real cow images from Unsplash (free to use)
        cow_images = [
            'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400',  # Friesian
            'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400',  # Brown cow
            'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=400',  # Holstein
            'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400',  # Cow face
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',  # Jersey
            'https://images.unsplash.com/photo-1572806903587-4a8a82e7d095?w=400',  # Brown cow field
            'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=400',  # White cow
            'https://images.unsplash.com/photo-1595365691689-6b7b4e1970cf?w=400',  # Cow portrait
            'https://images.unsplash.com/photo-1605152276897-4f618f831968?w=400',  # Dairy cow
            'https://images.unsplash.com/photo-1563281746-48bb478e9b2a?w=400',  # Highland cow
            'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=400',  # Calf
            'https://images.unsplash.com/photo-1598207079590-a85cc7c30899?w=400',  # Brown dairy
            'https://images.unsplash.com/photo-1594731804898-fccc542c7ea9?w=400',  # Grazing cow
            'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',  # Farm cow
            'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400',  # Spotted cow
        ]

        # Only 5 cows for easy demo
        cow_data = [
            {'tag': 'KD001', 'name': 'Malkia', 'breed': 'Friesian', 'status': 'milking', 'dob': date(2019, 3, 15)},
            {'tag': 'KD002', 'name': 'Zawadi', 'breed': 'Friesian', 'status': 'milking', 'dob': date(2018, 7, 22)},
            {'tag': 'KD003', 'name': 'Baraka', 'breed': 'Ayrshire', 'status': 'milking', 'dob': date(2020, 1, 10)},
            {'tag': 'KD004', 'name': 'Neema', 'breed': 'Jersey', 'status': 'pregnant', 'dob': date(2019, 11, 5)},
            {'tag': 'KD005', 'name': 'Tumaini', 'breed': 'Friesian', 'status': 'heifer', 'dob': date(2023, 2, 14)},
        ]

        cows = []
        for i, data in enumerate(cow_data):
            cow = Cow.objects.create(
                farm=farm,
                tag_number=data['tag'],
                name=data['name'],
                breed=data['breed'],
                status=data['status'],
                date_of_birth=data['dob'],
                image_url=cow_images[i % len(cow_images)],
                is_active=True
            )
            cows.append(cow)

        return cows

    def _create_feed_items(self, farm):
        from apps.feeds.models import FeedItem

        FeedItem.objects.filter(farm=farm).delete()

        items_data = [
            {'name': 'Dairy Meal', 'category': 'concentrate', 'unit': 'kg', 'reorder': 500},
            {'name': 'Hay Bales', 'category': 'roughage', 'unit': 'bales', 'reorder': 50},
            {'name': 'Silage', 'category': 'roughage', 'unit': 'kg', 'reorder': 1000},
            {'name': 'Napier Grass', 'category': 'roughage', 'unit': 'kg', 'reorder': 500},
            {'name': 'Mineral Lick', 'category': 'mineral', 'unit': 'kg', 'reorder': 20},
            {'name': 'Molasses', 'category': 'supplement', 'unit': 'liters', 'reorder': 50},
            {'name': 'Cotton Seed Cake', 'category': 'concentrate', 'unit': 'kg', 'reorder': 200},
            {'name': 'Maize Germ', 'category': 'concentrate', 'unit': 'kg', 'reorder': 300},
        ]

        items = []
        for data in items_data:
            item = FeedItem.objects.create(
                farm=farm,
                name=data['name'],
                category=data['category'],
                unit=data['unit'],
                reorder_level=Decimal(str(data['reorder']))
            )
            items.append(item)

        return items

    def _create_buyers(self, farm):
        from apps.sales.models import Buyer

        Buyer.objects.filter(farm=farm).delete()

        buyers_data = [
            {'name': 'Brookside Dairy', 'type': 'processor', 'phone': '0722111222', 'credit': 100000},
            {'name': 'New KCC', 'type': 'processor', 'phone': '0733222333', 'credit': 150000},
            {'name': 'Tuzo Hotel', 'type': 'hotel', 'phone': '0744333444', 'credit': 30000},
            {'name': 'Mama Njeri', 'type': 'individual', 'phone': '0755444555', 'credit': 5000},
            {'name': 'John Kamau', 'type': 'individual', 'phone': '0766555666', 'credit': 3000},
            {'name': 'Eldoret Milk Bar', 'type': 'retailer', 'phone': '0777666777', 'credit': 20000},
            {'name': 'Kapsabet Creameries', 'type': 'cooperative', 'phone': '0788777888', 'credit': 80000},
        ]

        buyers = []
        for data in buyers_data:
            buyer = Buyer.objects.create(
                farm=farm,
                name=data['name'],
                buyer_type=data['type'],
                phone=data['phone'],
                credit_limit=Decimal(str(data['credit']))
            )
            buyers.append(buyer)

        return buyers

    def _create_milk_logs(self, farm, cows, log_date, user):
        from apps.dairy.models import MilkLog

        milking_cows = [c for c in cows if c.status == 'milking']

        for cow in milking_cows:
            # Base production varies by cow (some are better producers)
            base_production = random.uniform(8, 18)

            # Seasonal variation (less in dry season)
            month = log_date.month
            if month in [1, 2, 3]:  # Dry season
                seasonal_factor = 0.85
            elif month in [4, 5, 10, 11]:  # Rainy season
                seasonal_factor = 1.1
            else:
                seasonal_factor = 1.0

            # Morning session
            morning_liters = Decimal(str(round(base_production * seasonal_factor * random.uniform(0.5, 0.6), 1)))
            MilkLog.objects.create(
                farm=farm,
                cow=cow,
                date=log_date,
                session='morning',
                liters=morning_liters,
                milked_by=user
            )

            # Evening session
            evening_liters = Decimal(str(round(base_production * seasonal_factor * random.uniform(0.4, 0.5), 1)))
            MilkLog.objects.create(
                farm=farm,
                cow=cow,
                date=log_date,
                session='evening',
                liters=evening_liters,
                milked_by=user
            )

    def _create_feed_usage(self, farm, feed_items, log_date, user):
        from apps.feeds.models import FeedUsageLog

        # Daily feed usage
        usage_data = {
            'Dairy Meal': (40, 60),  # kg per day range
            'Hay Bales': (2, 4),  # bales
            'Silage': (80, 120),  # kg
            'Napier Grass': (100, 150),  # kg
            'Mineral Lick': (0.5, 1.5),  # kg
            'Molasses': (2, 5),  # liters
        }

        for item in feed_items:
            if item.name in usage_data:
                min_qty, max_qty = usage_data[item.name]
                quantity = Decimal(str(round(random.uniform(min_qty, max_qty), 1)))

                FeedUsageLog.objects.create(
                    farm=farm,
                    feed_item=item,
                    date=log_date,
                    quantity=quantity,
                    unit=item.unit,
                    logged_by=user
                )

    def _create_feed_purchase(self, farm, feed_items, purchase_date):
        from apps.feeds.models import FeedPurchase

        # Weekly purchases
        purchase_data = {
            'Dairy Meal': (500, 70),  # quantity, price per unit
            'Hay Bales': (30, 350),
            'Silage': (1000, 8),
            'Mineral Lick': (25, 120),
            'Cotton Seed Cake': (200, 45),
            'Maize Germ': (300, 35),
        }

        suppliers = ['Unga Feeds Ltd', 'Pembe Flour Mills', 'Farmers Choice', 'Local Supplier']

        for item in feed_items:
            if item.name in purchase_data and random.random() < 0.7:  # 70% chance
                qty, price = purchase_data[item.name]
                quantity = Decimal(str(int(qty * random.uniform(0.8, 1.2))))
                unit_price = Decimal(str(round(price * random.uniform(0.95, 1.05), 2)))
                total_cost = quantity * unit_price

                FeedPurchase.objects.create(
                    farm=farm,
                    feed_item=item,
                    date=purchase_date,
                    quantity=quantity,
                    unit=item.unit,
                    unit_price=unit_price,
                    total_cost=total_cost,
                    supplier=random.choice(suppliers)
                )

    def _create_sales(self, farm, buyers, sale_date, user):
        from apps.sales.models import Sale, Payment
        from apps.dairy.models import MilkLog

        # Calculate total milk for the day
        total_milk = MilkLog.objects.filter(
            farm=farm, date=sale_date
        ).aggregate(total=models.Sum('liters'))['total'] or Decimal('0')

        if total_milk <= 0:
            return

        # Sell to 1-3 buyers
        num_buyers = random.randint(1, min(3, len(buyers)))
        selected_buyers = random.sample(buyers, num_buyers)

        remaining_milk = float(total_milk)
        price_per_liter = Decimal(str(random.uniform(55, 65)))

        for i, buyer in enumerate(selected_buyers):
            if i == len(selected_buyers) - 1:
                liters = Decimal(str(round(remaining_milk, 1)))
            else:
                liters = Decimal(str(round(remaining_milk * random.uniform(0.3, 0.5), 1)))
                remaining_milk -= float(liters)

            if liters <= 0:
                continue

            total = liters * price_per_liter
            sale = Sale.objects.create(
                farm=farm,
                buyer=buyer,
                date=sale_date,
                liters_sold=liters,
                price_per_liter=price_per_liter,
                total_amount=total,
                recorded_by=user
            )

            # Payment (80% paid immediately, 20% on credit)
            if random.random() < 0.8:
                Payment.objects.create(
                    farm=farm,
                    sale=sale,
                    amount=sale.total_amount,
                    method=random.choice(['cash', 'mpesa', 'bank']),
                    date=sale_date,
                    recorded_by=user
                )

    def _create_health_event(self, farm, cows, event_date, user):
        from apps.health.models import HealthEvent, Treatment

        conditions = [
            ('Mastitis', 'Swollen udder, reduced milk', 'high', 'Penicillin injection'),
            ('Foot rot', 'Limping, swollen hoof', 'medium', 'Hoof trimming and antibiotic spray'),
            ('Bloat', 'Distended abdomen', 'high', 'Trocar insertion, anti-bloat medication'),
            ('Milk fever', 'Weakness, inability to stand', 'critical', 'Calcium borogluconate IV'),
            ('Pink eye', 'Watery, red eyes', 'low', 'Eye ointment application'),
            ('Pneumonia', 'Coughing, nasal discharge', 'high', 'Antibiotic injection'),
        ]

        condition = random.choice(conditions)
        cow = random.choice(cows)

        event = HealthEvent.objects.create(
            farm=farm,
            cow=cow,
            date=event_date,
            symptoms=condition[1],
            diagnosis=condition[0],
            severity=condition[2],
            reported_by=user,
            is_resolved=True,
            resolved_at=timezone.now(),
            notes='Cow recovered fully'
        )

        # Add treatment
        Treatment.objects.create(
            farm=farm,
            cow=cow,
            health_event=event,
            date=event_date,
            treatment_name=condition[3],
            dose='As prescribed',
            administered_by=user,
            notes='Treatment administered successfully'
        )

    def _create_active_health_events(self, farm, cows, user):
        from apps.health.models import HealthEvent

        # Create 1-2 active health events using available cows
        active_conditions = [
            ('KD003', 'Minor injury', 'Small cut on leg, cleaned and bandaged', 'low'),
        ]

        for tag, diagnosis, symptoms, severity in active_conditions:
            cow = next((c for c in cows if c.tag_number == tag), None)
            if cow:
                HealthEvent.objects.create(
                    farm=farm,
                    cow=cow,
                    date=date.today() - timedelta(days=random.randint(1, 5)),
                    symptoms=symptoms,
                    diagnosis=diagnosis,
                    severity=severity,
                    reported_by=user,
                    is_resolved=False
                )

    def _create_task_completions(self, farm, task_date, user):
        from apps.tasks.models import TaskTemplate, TaskInstance, TaskCompletion

        templates = TaskTemplate.objects.filter(farm=farm, is_active=True)

        for template in templates:
            # Check if daily task
            if template.category == 'daily':
                status = 'done' if random.random() < 0.9 else 'skipped'
                task, created = TaskInstance.objects.get_or_create(
                    farm=farm,
                    template=template,
                    task_date=task_date,
                    defaults={
                        'name': template.name,
                        'description': template.description,
                        'status': status,
                        'priority': 'normal',
                        'due_time': template.default_time,
                    }
                )
                # Create completion record if task was done
                if created and status == 'done':
                    TaskCompletion.objects.create(
                        task=task,
                        completed_by=user,
                        completed_at=timezone.now()
                    )

    def _update_inventory_balances(self, farm, feed_items):
        from apps.feeds.models import InventoryBalance, FeedPurchase, FeedUsageLog
        from django.db.models import Sum

        for item in feed_items:
            purchases = FeedPurchase.objects.filter(
                farm=farm, feed_item=item
            ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')

            usage = FeedUsageLog.objects.filter(
                farm=farm, feed_item=item
            ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')

            balance = max(Decimal('0'), purchases - usage)

            InventoryBalance.objects.update_or_create(
                farm=farm,
                feed_item=item,
                defaults={'quantity_on_hand': balance, 'unit': item.unit}
            )

    def _print_summary(self, farm):
        from apps.dairy.models import Cow, MilkLog
        from apps.feeds.models import FeedItem, FeedPurchase, FeedUsageLog
        from apps.health.models import HealthEvent
        from apps.sales.models import Sale, Buyer
        from apps.tasks.models import TaskInstance

        self.stdout.write('\n--- DATA SUMMARY ---')
        self.stdout.write(f'Cows: {Cow.objects.filter(farm=farm).count()}')
        self.stdout.write(f'Milk Logs: {MilkLog.objects.filter(farm=farm).count()}')
        self.stdout.write(f'Feed Items: {FeedItem.objects.filter(farm=farm).count()}')
        self.stdout.write(f'Feed Purchases: {FeedPurchase.objects.filter(farm=farm).count()}')
        self.stdout.write(f'Feed Usage Logs: {FeedUsageLog.objects.filter(farm=farm).count()}')
        self.stdout.write(f'Health Events: {HealthEvent.objects.filter(farm=farm).count()}')
        self.stdout.write(f'Buyers: {Buyer.objects.filter(farm=farm).count()}')
        self.stdout.write(f'Sales: {Sale.objects.filter(farm=farm).count()}')
        self.stdout.write(f'Task Instances: {TaskInstance.objects.filter(farm=farm).count()}')


# Need to import models for aggregate
from django.db import models
