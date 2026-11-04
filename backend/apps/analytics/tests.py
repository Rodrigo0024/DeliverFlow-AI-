from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.restaurants.models import Restaurant, MenuItem, Order, OrderItem

User = get_user_model()

class SmartInsightsAPITestCase(APITestCase):
    
    def setUp(self):
        # 1. Criar utilizadores de teste
        self.owner = User.objects.create_user(username='donorestaurante', password='password123', user_type='owner')
        self.user = User.objects.create_user(username='clienteteste', password='password123', user_type='customer')
        self.client.force_authenticate(user=self.user)
        
        # 2. Criar restaurante
        self.restaurant = Restaurant.objects.create(
            name="Restaurante Teste",
            category="Lanches",
            delivery_fee=5.00,
            owner=self.owner,
            is_active=True
        )
        self.menu_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            name="X-Burguer Especial",
            description="Delicioso hambúrguer",
            price=25.00,
            is_available=True
        )
        
        # 3. Simular o histórico de pedido
        self.order = Order.objects.create(
            customer=self.user,
            restaurant=self.restaurant,
            status='delivered'
        )
        # Removido o argumento 'price' inesperado
        OrderItem.objects.create(
            order=self.order,
            menu_item=self.menu_item,
            quantity=1
        )

    def test_smart_insights_endpoint(self):
        url = f"/api/analytics/recommendations/?item_count=2&restaurant_id={self.restaurant.id}"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("recommendations", response.data)
        self.assertIn("estimated_delivery_time_minutes", response.data)
        self.assertIn("delivery_window", response.data)
        self.assertIn("prediction_basis", response.data)