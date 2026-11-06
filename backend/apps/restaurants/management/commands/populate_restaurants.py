from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.restaurants.models import Restaurant, MenuItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Popula a base de dados com restaurantes fictícios, endereços, coordenadas GPS e pratos de forma segura.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('A iniciar a população de restaurantes e cardápios...'))

        # 1. Garante que existe um utilizador dono (owner) para associar aos restaurantes
        owner, created = User.objects.get_or_create(
            username='chef_admin',
            defaults={'email': 'chef@deliverflow.ai'}
        )
        if created:
            owner.set_password('admin123')
            owner.save()
            self.stdout.write(self.style.SUCCESS(f'Utilizador criador criado: {owner.username}'))

        # 2. Lista de restaurantes fictícios
        restaurants_data = [
            {
                "name": "Burger Craft Artesanal",
                "category": "Lanches",
                "delivery_fee": 6.00,
                "address": "Av. Principal, 1500 - Centro",
                "latitude": -22.2215,
                "longitude": -49.9542,
                "menu": [
                    {"name": "X-Salada Duplo Bacon", "description": "Pão brioche, 2x carne artesanal 160g, cheddar cremoso e bacon crocante.", "price": 34.90, "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"},
                    {"name": "Burger Smash Crispy", "description": "Pão potato, 2x smash burger 90g, queijo prato e cebola caramelizada.", "price": 28.50, "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500"},
                    {"name": "Batata rústica com cheddar", "description": "Porção generosa de batatas rústicas temperadas com alecrim e molho cheddar.", "price": 22.00, "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500"}
                ]
            },
            {
                "name": "Pizzaria Bella Napoles",
                "category": "Pizzas",
                "delivery_fee": 8.00,
                "address": "Rua das Palmeiras, 320 - Jardim América",
                "latitude": -22.2310,
                "longitude": -49.9450,
                "menu": [
                    {"name": "Pizza Margherita Família", "description": "Molho de tomate rústico, mozzarella de búfala, manjericão fresco e azeite.", "price": 58.90, "image": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500"},
                    {"name": "Pizza Pepperoni Especial", "description": "Molho de tomate, mozzarella, rodelas generosas de pepperoni importado e origâmo.", "price": 68.00, "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500"}
                ]
            },
            {
                "name": "Sushi Tokyo Express",
                "category": "Japonesa",
                "delivery_fee": 10.00,
                "address": "Praça da Liberdade, 88 - Vila Nova",
                "latitude": -22.2150,
                "longitude": -49.9620,
                "menu": [
                    {"name": "Combo Especial do Chef (32 peças)", "description": "Sashimis de salmão, hossomakis, uramakis philadelphia e niguiris variados.", "price": 98.90, "image": "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500"},
                    {"name": "Hot Holl Salmão (10 unidades)", "description": "Sushi empanado e frito recheado com salmão, cream cheese e cebolinha.", "price": 42.00, "image": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500"}
                ]
            }
        ]

        # 3. Tratamento seguro utilizando .filter().first() para evitar erros de duplicados
        for r_data in restaurants_data:
            menu_items = r_data.pop('menu')
            
            existing_restaurants = Restaurant.objects.filter(name=r_data['name'])
            
            if existing_restaurants.exists():
                restaurant = existing_restaurants.first()
                for key, value in r_data.items():
                    setattr(restaurant, key, value)
                restaurant.owner = owner
                restaurant.save()
                self.stdout.write(self.style.WARNING(f'Restaurante atualizado: {restaurant.name}'))
            else:
                restaurant = Restaurant.objects.create(**r_data, owner=owner)
                self.stdout.write(self.style.SUCCESS(f'Restaurante criado: {restaurant.name}'))

            # Cria ou atualiza os itens do cardápio de forma segura
            for item_data in menu_items:
                item_qs = MenuItem.objects.filter(restaurant=restaurant, name=item_data['name'])
                if item_qs.exists():
                    item = item_qs.first()
                    for key, value in item_data.items():
                        setattr(item, key, value)
                    item.save()
                else:
                    MenuItem.objects.create(restaurant=restaurant, **item_data)
                    self.stdout.write(f'  -> Prato adicionado: {item_data["name"]} (R$ {item_data["price"]})')

        self.stdout.write(self.style.SUCCESS('Processo concluído com sucesso! Base de dados populada sem erros.'))