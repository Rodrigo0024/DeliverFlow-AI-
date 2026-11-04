from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from .models import User
from .serializers import UserSerializer, RegisterSerializer

class IsAdminUserRole(permissions.BasePermission):
    """Permite acesso apenas a superusuários ou usuários administradores."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff)

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    @action(detail=True, methods=['patch'])
    def toggle_ban(self, request, pk=None):
        """Ação para banir ou reativar um usuário alterando o is_active."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        status_msg = "ativado" if user.is_active else "banido"
        return Response(
            {"message": f"Usuário {user.username} foi {status_msg} com sucesso!", "is_active": user.is_active},
            status=status.HTTP_200_OK
        )

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class CustomLoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'user_type': user.user_type
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)