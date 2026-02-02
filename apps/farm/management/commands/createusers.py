"""
Create sample users for Koimeret Dairies
Run: python manage.py createusers
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create sample users for testing"

    def handle(self, *args, **options):
        from apps.farm.models import Farm, Role, FarmMembership

        # Get or create roles
        roles_data = [
            ("auditor", "Financial auditor with read-only access"),
            ("procurement", "Procurement officer for supplies and purchases"),
        ]
        for name, desc in roles_data:
            Role.objects.get_or_create(name=name, defaults={"description": desc})

        # Get farm
        farm = Farm.objects.filter(name="Koimeret Dairies").first()
        if not farm:
            self.stdout.write(self.style.ERROR("Farm 'Koimeret Dairies' not found. Run initdb first."))
            return

        # Sample users
        users = [
            {"phone": "0711111111", "name": "John Kipchoge", "password": "worker123", "role": "worker"},
            {"phone": "0722222222", "name": "Mary Wanjiku", "password": "worker123", "role": "worker"},
            {"phone": "0733333333", "name": "Dr. Peter Ochieng", "password": "vet12345", "role": "vet"},
            {"phone": "0744444444", "name": "Sarah Kimani", "password": "auditor123", "role": "auditor"},
            {"phone": "0755555555", "name": "James Mwangi", "password": "procure123", "role": "procurement"},
        ]

        self.stdout.write("\nCreating sample users...\n")
        self.stdout.write("-" * 60)

        for u in users:
            role = Role.objects.get(name=u["role"])
            user, created = User.objects.get_or_create(
                phone=u["phone"],
                defaults={"full_name": u["name"], "is_active": True}
            )
            user.set_password(u["password"])
            user.active_farm = farm
            user.save()

            FarmMembership.objects.get_or_create(
                user=user, farm=farm, defaults={"role": role}
            )

            status = "Created" if created else "Updated"
            self.stdout.write(f"  {status}: {u['name']}")
            self.stdout.write(f"    Phone: {u['phone']}")
            self.stdout.write(f"    Password: {u['password']}")
            self.stdout.write(f"    Role: {u['role']}")
            self.stdout.write("")

        self.stdout.write("-" * 60)
        self.stdout.write(self.style.SUCCESS("\nSample users ready!"))
        self.stdout.write("\nLogin credentials:")
        self.stdout.write("  Admin:       0700000000 / admin123")
        self.stdout.write("  Worker 1:    0711111111 / worker123")
        self.stdout.write("  Worker 2:    0722222222 / worker123")
        self.stdout.write("  Vet:         0733333333 / vet12345")
        self.stdout.write("  Auditor:     0744444444 / auditor123")
        self.stdout.write("  Procurement: 0755555555 / procure123")
