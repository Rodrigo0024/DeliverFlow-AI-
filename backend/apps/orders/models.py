from django.conf import settings
from django.db import models
from apps.restaurants.models import Restaurant, MenuItem

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendente / Aguardando Aceite'),
        ('accepted', 'Aceito pelo Restaurante'),
        ('preparing', 'Em Preparo'),
        ('delivering', 'Saiu para Entrega'),
        ('completed', 'Entregue'),
        ('cancelled', 'Cancelado'),
    )

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pedido #{self.id} - {self.customer.username} ({self.get_status_display()})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} (Pedido #{self.order.id})"