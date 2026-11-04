from rest_framework import serializers
from .models import Order, OrderItem
from apps.restaurants.models import Restaurant, MenuItem

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source='menu_item', write_only=True, required=False
    )
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item_id', 'menu_item_name', 'quantity', 'unit_price']
        read_only_fields = ['unit_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    restaurant_id = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(), source='restaurant', write_only=True, required=False
    )
    customer_username = serializers.ReadOnlyField(source='customer.username', read_only=True)
    restaurant_name = serializers.ReadOnlyField(source='restaurant.name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_username', 'restaurant', 'restaurant_id',
            'restaurant_name', 'status', 'total_amount', 
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['total_amount', 'customer', 'restaurant']

    def update(self, instance, validated_data):
        # Permite atualizar o status ou qualquer outro campo enviado de forma isolada
        if 'status' in validated_data:
            instance.status = validated_data['status']
        
        instance.save()
        return instance

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['customer'] = request.user

        if not validated_data.get('restaurant') and self.initial_data.get('restaurant_id'):
            validated_data['restaurant'] = Restaurant.objects.get(id=self.initial_data.get('restaurant_id'))

        total_amount = 0
        for item_data in items_data:
            menu_item = item_data['menu_item']
            quantity = item_data.get('quantity', 1)
            total_amount += menu_item.price * quantity

        validated_data['total_amount'] = total_amount
        
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            menu_item = item_data['menu_item']
            quantity = item_data.get('quantity', 1)
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity,
                unit_price=menu_item.price
            )
            
        return order