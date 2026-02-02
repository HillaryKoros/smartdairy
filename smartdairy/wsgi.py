"""
WSGI config for Koimeret Dairies project.
"""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartdairy.settings.production")

application = get_wsgi_application()
