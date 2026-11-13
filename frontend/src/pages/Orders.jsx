import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Orders({ orders, restaurants = [], loadData, setFeedbackMessage }) {
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [clientLocation, setClientLocation] = useState(null);

  // Obtém a geolocalização do cliente via GPS ao carregar a página de pedidos
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setClientLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocalização indisponível nos pedidos:", error);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Fórmula de Haversine para calcular a distância em KM
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Estimativa aproximada de tempo (3 min por km + 10 min de preparo)
  const calculateETA = (distanceKm) => {
    if (!distanceKm) return null;
    const minutes = Math.round(distanceKm * 3 + 10);
    return `${minutes} min`;
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Tem certeza de que deseja cancelar este pedido?')) return;
    
    try {
      await api.patch(`orders/${orderId}/`, { status: 'cancelled' });
      if (setFeedbackMessage) setFeedbackMessage('Pedido cancelado com sucesso.');
      if (loadData) loadData();
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error.response?.data || error);
      if (setFeedbackMessage) {
        setFeedbackMessage('Erro ao cancelar o pedido. Verifique se ele ainda pode ser cancelado.');
      }
    }
  };

  const filteredOrders = (orders || []).filter(order => {
    const status = (order.status || '').toLowerCase();
    
    if (activeSubTab === 'pending') {
      return status === 'pending' || status === 'pendente';
    }
    if (activeSubTab === 'active') {
      return ['preparing', 'delivering', 'em preparo', 'entregando'].includes(status);
    }
    if (activeSubTab === 'cancelled') {
      return status === 'cancelled' || status === 'cancelado';
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Meus Pedidos</h1>
          <p className="text-sm text-gray-600 mt-0.5">Acompanhe o status, detalhes e histórico das suas solicitações.</p>
        </div>
      </div>

      {/* Abas de Filtro de Status */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
            activeSubTab === 'pending' ? 'bg-amber-500 text-white shadow' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setActiveSubTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
            activeSubTab === 'active' ? 'bg-purple-600 text-white shadow ring-2 ring-purple-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          A Caminho / Em Andamento
        </button>
        <button
          onClick={() => setActiveSubTab('cancelled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
            activeSubTab === 'cancelled' ? 'bg-red-600 text-white shadow' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Cancelados
        </button>
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border-0 ${
            activeSubTab === 'all' ? 'bg-gray-900 text-white shadow' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Lista de Pedidos Filtrados */}
      <div className="space-y-4">
        {filteredOrders && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusLower = (order.status || '').toLowerCase();
            const isPending = statusLower === 'pending' || statusLower === 'pendente';
            const isActive = ['preparing', 'delivering', 'em preparo', 'entregando'].includes(statusLower);
            const isCancelled = statusLower === 'cancelled' || statusLower === 'cancelado';
            
            const totalValue = order.total_amount || order.total_price || order.items?.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0) || 0;

            // Busca o restaurante correspondente na lista de restaurantes pelo ID ou nome
            const matchedRestaurant = restaurants.find(r => 
              String(r.id) === String(order.restaurant) || r.name === order.restaurant_name
            );

            const restaurantAddress = order.restaurant_address || order.address || matchedRestaurant?.address;
            const restLat = order.restaurant_latitude || matchedRestaurant?.latitude;
            const restLon = order.restaurant_longitude || matchedRestaurant?.longitude;

            // Cálculo da distância e ETA
            const distance = clientLocation && restLat && restLon
              ? calculateDistance(clientLocation.latitude, clientLocation.longitude, restLat, restLon)
              : null;

            const eta = calculateETA(distance);

            return (
              <div 
                key={order.id} 
                className={`bg-white p-6 rounded-2xl shadow-sm border transition hover:shadow-md ${
                  isActive ? 'border-purple-300 ring-2 ring-purple-100 bg-purple-50/20' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                        Pedido #{order.id}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isPending ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        isActive ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse font-black' :
                        isCancelled ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        Status: {order.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mt-2">
                      {order.restaurant_name || matchedRestaurant?.name || `Restaurante #${order.restaurant}`}
                    </h3>

                    {/* Exibição do Endereço do Restaurante e Distância/ETA */}
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        📍 {restaurantAddress || 'Endereço do restaurante não informado'}
                      </p>
                      {distance && (
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          ⏱️ Tempo estimado: {eta} ({distance} km até sua casa)
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Realizado em: {new Date(order.created_at || Date.now()).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <span className="text-xs text-gray-400 block">Valor Total</span>
                      <span className="text-base font-black text-emerald-600">
                        R$ {Number(totalValue).toFixed(2)}
                      </span>
                    </div>

                    {isPending && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition border border-red-200 cursor-pointer"
                      >
                        Cancelar Pedido
                      </button>
                    )}
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="pt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Itens do Pedido</h4>
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-700 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                              {item.quantity}x
                            </span>
                            <span className="font-semibold text-gray-800">
                              {item.menu_item_name || item.name || `Prato #${item.menu_item_id || item.id}`}
                            </span>
                          </div>
                          <span className="font-bold text-gray-600">
                            R$ {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Detalhes dos itens indisponíveis.</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-gray-700">Nenhum pedido nesta aba</p>
            <p className="text-xs text-gray-400 mt-1">Não existem pedidos correspondentes ao filtro selecionado.</p>
          </div>
        )}
      </div>
    </div>
  );
}