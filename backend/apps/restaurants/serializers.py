from rest_framework import serializers
from .models import Restaurant, MenuItem, Order, OrderItem

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'restaurant', 'name', 'description', 'price', 'image', 'is_available']

class RestaurantSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Restaurant
        # Adicionados 'address', 'latitude' e 'longitude' para suportar o cálculo de rota por GPS
        fields = ['id', 'owner', 'owner_username', 'name', 'category', 'delivery_fee', 'address', 'latitude', 'longitude', 'is_active', 'created_at', 'menu_items']
        read_only_fields = ['owner']

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), 
        source='menu_item',
        write_only=True
    )
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name', read_only=True)
    price = serializers.DecimalField(source='menu_item.price', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item_id', 'menu_item_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    # Na leitura, 'items' usa o OrderItemSerializer completo. Na escrita de PATCH, tornamos opcional via validated_data.
    items = OrderItemSerializer(many=True, required=False)
    
    restaurant_id = serializers.IntegerField(write_only=True, required=False)
    
    customer_username = serializers.ReadOnlyField(source='customer.username', read_only=True)
    restaurant_name = serializers.ReadOnlyField(source='restaurant.name', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_username', 'restaurant', 'restaurant_id', 'restaurant_name', 'status', 'created_at', 'items']
        # 'status' liberado para permitir alteração via PATCH
        read_only_fields = ['customer', 'restaurant']

    def validate(self, attrs):
        # Se for uma atualização parcial contendo apenas 'status', ignora a validação de restaurante e itens
        if self.instance and 'status' in attrs and len(attrs) == 1:
            return attrs

        rest_id = attrs.pop('restaurant_id', None) or self.initial_data.get('restaurant_id') or self.initial_data.get('restaurant')
        
        if rest_id and not self.instance:
            try:
                attrs['restaurant'] = Restaurant.objects.get(id=rest_id)
            except Restaurant.DoesNotExist:
                raise serializers.ValidationError({"restaurant_id": ["Restaurante não encontrado."]})

        return attrs

    def update(self, instance, validated_data):
        # Garante que apenas o status ou campos permitidos sejam atualizados com segurança no PATCH
        validated_data.pop('items', None)
        
        if 'status' in validated_data:
            instance.status = validated_data['status']
        
        instance.save()
        return instance

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['customer'] = request.user

        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order