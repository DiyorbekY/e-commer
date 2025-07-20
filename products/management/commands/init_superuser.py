# init_superuser.py
import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User




class Command(BaseCommand):
    def handle(self, *args, **options):
        if User.objects.count() == 0:
            User.objects.create_superuser(
                username='root',
                email='root@example.com',
                password='root',
            )
            self.stdout.write(self.style.SUCCESS('Admin user has created'))
        else:
            self.stdout.write(self.style.SUCCESS('Admin user already exists'))
