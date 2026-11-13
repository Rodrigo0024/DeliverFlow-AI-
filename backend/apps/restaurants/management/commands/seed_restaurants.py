from django.core.management.base import BaseCommand
from apps.restaurants.models import Restaurant, MenuItem
from apps.orders.models import Order, OrderItem
from apps.accounts.models import User

class Command(BaseCommand):
    help = 'Limpa o banco de dados e popula com pelo menos 15 restaurantes, endereços, coordenadas GPS e pratos'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Limpando dados antigos do banco de dados...'))
        
        # Limpa pedidos e itens associados para evitar restrições de chave estrangeira
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        
        # Limpa pratos e restaurantes existentes
        MenuItem.objects.all().delete()
        Restaurant.objects.all().delete()

        owner, created = User.objects.get_or_create(
            username='restaurante_parceiro',
            defaults={'email': 'parceiro@deliverflow.com', 'user_type': 'restaurant_owner'}
        )
        if created:
            owner.set_password('admin123')
            owner.save()

        restaurants_data = [
            {
                "name": "Burger Craft Artesanal",
                "category": "Lanches",
                "delivery_fee": 5.90,
                "address": "Av. Principal, 100 - Centro",
                "latitude": -22.2215,
                "longitude": -49.9542,
                "items": [
                    {"name": "Smash Burger Duplo", "description": "Dois hambúrgueres smash de 90g, queijo cheddar cremoso e bacon crocante no pão brioche.", "price": 32.90, "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Burger Veggie de Grão-de-Bico", "description": "Hambúrguer artesanal de grão-de-bico, alface americana, tomate e maionese verde vegana.", "price": 28.50, "image": "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Batata Frita com Cheddar e Bacon", "description": "Porção generosa de batatas fritas sequinhas cobertas com cheddar cremoso e pedaços de bacon.", "price": 24.00, "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Napoli Pizzeria & Trattoria",
                "category": "Pizza",
                "delivery_fee": 8.00,
                "address": "Rua das Flores, 450 - Jardim América",
                "latitude": -22.2250,
                "longitude": -49.9580,
                "items": [
                    {"name": "Pizza Margherita Tradicional", "description": "Molho de tomate artesanal italiano, mozarela de búfala fresca, manjericão e fio de azeite.", "price": 54.90, "image": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Pizza Pepperoni Especial", "description": "Molho de tomate, mozarela derretida, fatias generosas de pepperoni levemente picante e orégano.", "price": 68.00, "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Sabor da Fazenda - Comida Mineira",
                "category": "Brasileira",
                "delivery_fee": 6.50,
                "address": "Rodovia do Café, Km 12",
                "latitude": -22.2180,
                "longitude": -49.9450,
                "items": [
                    {"name": "Frango com Quiabo e Polenta", "description": "Frango caipira cozido com quiabo fresco, servido com polenta cremosa e arroz branco.", "price": 42.00, "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Feijoada Completa", "description": "Acompanha arroz, couve mineira sauté, farofa de mandioca, torresmo crocante e laranja.", "price": 49.90, "image": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Sakura Sushi & Oriental",
                "category": "Japonesa",
                "delivery_fee": 10.00,
                "address": "Av. Brasil, 890 - Vila Industrial",
                "latitude": -22.2300,
                "longitude": -49.9600,
                "items": [
                    {"name": "Combinado Especial do Chef (32 peças)", "description": "Variedade de sashimis de salmão, atum, niguiris, hossomakis e uramakis especiais.", "price": 115.00, "image": "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Hot Roll de Salmão (10 unidades)", "description": "Sushi recheado com salmão e cream cheese, empanado, frito e finalizado com molho taritê.", "price": 38.00, "image": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "La Gondola Massa Italiana",
                "category": "Italiana",
                "delivery_fee": 7.50,
                "address": "Rua XV de Novembro, 300",
                "latitude": -22.2150,
                "longitude": -49.9500,
                "items": [
                    {"name": "Spaghetti à Carbonara", "description": "Massa fresca grano duro, guanciale crocante, gema de ovo fresca e queijo Pecorino Romano.", "price": 52.00, "image": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Ravioli de Búfala ao Sugo", "description": "Recheados com mozarela de búfala e ricota ao molho de tomate rústico e manjericão fresco.", "price": 46.50, "image": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Tacos & Burritos El Mex",
                "category": "Mexicana",
                "delivery_fee": 7.00,
                "address": "Av. das Nações, 710",
                "latitude": -22.2280,
                "longitude": -49.9420,
                "items": [
                    {"name": "Burrito de Carne Asada", "description": "Tortilla de trigo recheada com carne grelhada, arroz mexicano, feijão preto e cheddar.", "price": 36.00, "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Combo Tacos Crocantes (3 unidades)", "description": "Tacos de milho crocantes com carne moída temperada, alface, tomate e sour cream.", "price": 34.00, "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Cantina do Churrasco",
                "category": "Churrasco",
                "delivery_fee": 9.00,
                "address": "Rua dos Expedicionários, 120",
                "latitude": -22.2190,
                "longitude": -49.9650,
                "items": [
                    {"name": "Picanha Nobre na Brasa (para 2 pessoas)", "description": "Corte especial de picanha grelhada, arroz bi-bi, vinagrete, mandioca frita e farofa.", "price": 98.00, "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Frango com Bacon Grelhado", "description": "Filé de peito enrolado com bacon defumado, batatas rústicas e salada verde.", "price": 40.00, "image": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Dragon Wok - Comida Chinesa",
                "category": "Asiática",
                "delivery_fee": 6.00,
                "address": "Av. Domingos Juarez, 55",
                "latitude": -22.2350,
                "longitude": -49.9510,
                "items": [
                    {"name": "Yakisoba Especial de Frango e Carne", "description": "Macarrão oriental salteado no wok com legumes frescos, carne, frango e molho shoyu especial.", "price": 44.00, "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Frango Xadrez Tradicional", "description": "Cubos de frango salteados com pimentões, cebola, amendoim crocante e molho à base de gengibre.", "price": 41.50, "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Green Life Salads & Bowls",
                "category": "Saudável",
                "delivery_fee": 5.00,
                "address": "Rua Pernambuco, 1100",
                "latitude": -22.2220,
                "longitude": -49.9480,
                "items": [
                    {"name": "Poke de Salmão Fresco", "description": "Base de arroz japonês, salmão em cubos, abacate, pepino sunomono, manga e gergelim.", "price": 48.00, "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Salada Caesar com Frango Grelhado", "description": "Mix de folhas verdes, croûtons crocantes, parmesão ralado e tiras de frango grelhado.", "price": 32.00, "image": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Beirut & Cia - Comida Árabe",
                "category": "Árabe",
                "delivery_fee": 6.00,
                "address": "Av. Sampaio Vidal, 400",
                "latitude": -22.2130,
                "longitude": -49.9530,
                "items": [
                    {"name": "Beirute Tradicional de Frango", "description": "Pão sírio grande tostado, frango desfiado temperado, zaatar, alface, tomate e maionese.", "price": 35.00, "image": "https://images.unsplash.com/photo-1561651857-4581907c3d3d?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Esfirras Abertas Premium (Kit 6 unidades)", "description": "Variadas entre carne temperada, queijo fundido e coalhada seca artesanal.", "price": 28.00, "image": "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Doce Encanto Confeitaria",
                "category": "Doces e Sobremesas",
                "delivery_fee": 4.50,
                "address": "Rua Paraíba, 220",
                "latitude": -22.2240,
                "longitude": -49.9570,
                "items": [
                    {"name": "Bolo de Chocolate Trufado (Fatia)", "description": "Massa fofinha de chocolate recheada com ganache meio amargo e cobertura de brigadeiro.", "price": 16.50, "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Cheesecake de Frutas Vermelhas", "description": "Base de biscoito amanteigado, creme leve de cream cheese e calda artesanal de amoras.", "price": 18.00, "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Açaí Power & Vitaminas",
                "category": "Açaí",
                "delivery_fee": 5.00,
                "address": "Av. Tiradentes, 850",
                "latitude": -22.2170,
                "longitude": -49.9620,
                "items": [
                    {"name": "Açaí na Tigela 500ml", "description": "Açaí cremoso batido com guaraná, acompanhado de morango, banana, leite condensado e granola.", "price": 25.00, "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Vitamina de Abacate", "description": "Abacate batido com leite gelado, açúcar mascavo e toque de limão.", "price": 14.00, "image": "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Kebab Express & Esfirras",
                "category": "Árabe",
                "delivery_fee": 6.50,
                "address": "Rua 9 de Julho, 330",
                "latitude": -22.2260,
                "longitude": -49.9490,
                "items": [
                    {"name": "Kebab de Cordeiro", "description": "Pão arábico enrolado com carne de cordeiro desfiada, molho tahine, cebola roxa e hortelã.", "price": 39.00, "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Kibe Frito Recheado (4 unidades)", "description": "Kibes de carne bovina moída recheados com carne e hortelã, fritos até ficarem crocantes.", "price": 22.00, "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Carioca Sabor de Boteco",
                "category": "Petiscos",
                "delivery_fee": 6.00,
                "address": "Av. Rio Branco, 1020",
                "latitude": -22.2110,
                "longitude": -49.9560,
                "items": [
                    {"name": "Bolinho de Bacalhau (6 unidades)", "description": "Tradicionais bolinhos portugueses recheados com bacalhau desfiado e batata.", "price": 34.00, "image": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Frango a Passarinho Crocante", "description": "Pedaços de frango temperados ao alho e óleo com bastante salsinha e limão espremido.", "price": 36.50, "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=500&q=80"}
                ]
            },
            {
                "name": "Padaria & Café Pão Dourado",
                "category": "Cafeteria",
                "delivery_fee": 4.00,
                "address": "Rua Coronel Goulart, 75",
                "latitude": -22.2205,
                "longitude": -49.9535,
                "items": [
                    {"name": "Kit Café da Manhã Completo", "description": "Pão francês na chapa com manteiga, fatia de bolo caseiro de milho e café com leite.", "price": 22.00, "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80"},
                    {"name": "Pão de Queijo Recheado com Catupiry (4 unidades)", "description": "Pão de queijo mineiro quentinho recheado com requeijão cremoso.", "price": 18.00, "image": "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=500&q=80"}
                ]
            }
        ]

        for data in restaurants_data:
            restaurant = Restaurant.objects.create(
                name=data["name"],
                owner=owner,
                category=data["category"],
                delivery_fee=data["delivery_fee"],
                address=data["address"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                is_active=True
            )

            for item_data in data["items"]:
                MenuItem.objects.create(
                    restaurant=restaurant,
                    name=item_data["name"],
                    description=item_data["description"],
                    price=item_data["price"],
                    image=item_data.get("image", ""),
                    is_available=True
                )

        self.stdout.write(self.style.SUCCESS('Banco limpo e 15 restaurantes com endereços e GPS gerados com sucesso!'))