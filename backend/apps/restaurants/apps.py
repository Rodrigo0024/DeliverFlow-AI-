from django.apps import AppConfig

class RestaurantsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.restaurants'  # <- Tem que ser 'apps.restaurants', e não apenas 'restaurants'