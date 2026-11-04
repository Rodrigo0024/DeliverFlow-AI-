import math
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.restaurants.models import Restaurant, MenuItem, Order, OrderItem

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """Calcula a distância real em km entre o cliente e o restaurante."""
    R = 6371  # Raio da Terra em km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class RecommendationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # ... (sua lógica de recomendação de pratos que já fizemos) ...
        recommendations = [] 

        # Parâmetros recebidos do Frontend (GPS do Cliente + ID do Restaurante selecionado)
        restaurant_id = request.GET.get('restaurant_id')
        client_lat = request.GET.get('lat')
        client_lon = request.GET.get('lon')
        
        try:
            item_count = int(request.GET.get('item_count', 1))
        except (TypeError, ValueError):
            item_count = 1

        distance_km = 2.0  # Distância padrão caso o restaurante não tenha coordenadas
        estimated_minutes = 30

        if restaurant_id:
            try:
                restaurant = Restaurant.objects.get(id=restaurant_id)
                
                # Verifica se o restaurante tem latitude/longitude cadastradas e se o cliente enviou o GPS
                if restaurant.latitude and restaurant.longitude and client_lat and client_lon:
                    distance_km = calculate_haversine_distance(
                        float(client_lat), float(client_lon),
                        float(restaurant.latitude), float(restaurant.longitude)
                    )
                
                # Cálculo logístico profissional:
                # 15 min base de preparo + 4 minutos por km de trajeto + 2.5 min por item no carrinho
                prep_time = 15
                delivery_time_per_km = 4 
                item_complexity = item_count * 2.5
                
                estimated_minutes = int(prep_time + (distance_km * delivery_time_per_km) + item_complexity)
                
            except Restaurant.DoesNotExist:
                pass

        min_range = max(15, estimated_minutes - 4)
        max_range = estimated_minutes + 6

        return Response({
            "recommendations": recommendations,
            "estimated_delivery_time_minutes": estimated_minutes,
            "delivery_window": f"{min_range} - {max_range} min",
            "prediction_basis": f"Rota calculada: {distance_km:.1f} km de distância entre si e o restaurante."
        })