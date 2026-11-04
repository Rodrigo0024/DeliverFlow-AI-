from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'  # <--- IMPORTANTE: Tem que ser 'apps.accounts', e não apenas 'accounts'