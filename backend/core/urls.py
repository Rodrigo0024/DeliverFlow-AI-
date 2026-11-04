from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.restaurants.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/accounts/', include('apps.accounts.urls')),
]