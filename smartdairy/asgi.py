"""
ASGI config for Koimeret Dairies project.
"""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartdairy.settings.production")

application = get_asgi_application()
