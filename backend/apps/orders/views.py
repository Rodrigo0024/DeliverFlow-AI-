from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'user_type', '') == 'customer' or not user.is_staff:
            return Order.objects.filter(customer=user)
        return Order.objects.all()

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)