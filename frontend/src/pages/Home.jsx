import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Home({ currentUser, restaurants, topDishes, setSelectedRestaurant, setSelectedItem, setActiveTab, selectedRestaurant, quantity, setQuantity, orderSubmit, selectedItem }) {
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [smartInsights, setSmartInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Buscando GPS...');

  // Busca os Insights de IA e captura a geolocalização real do cliente (GPS)
  useEffect(() => {
    if (!currentUser) return;

    async function loadSmartInsightsWithLocation(lat = null, lon = null) {
      setLoadingInsights(true);
      try {
        const restId = selectedRestaurant ? selectedRestaurant.id : '';
        let queryParams = `item_count=${quantity || 1}&restaurant_id=${restId}`;
        
        if (lat && lon) {
          queryParams += `&lat=${lat}&lon=${lon}`;
          setLocationStatus('Rota GPS Ativa');
        } else {
          setLocationStatus('Localização Padrão');
        }

        const response = await api.get(`analytics/recommendations/?${queryParams}`);
        setSmartInsights(response.data);
      } catch (error) {
        console.error("Erro ao carregar insights de IA:", error);
        setLocationStatus('Erro no GPS');
      } finally {
        setLoadingInsights(false);
      }
    }

    // Tenta obter a localização via GPS do navegador
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          loadSmartInsightsWithLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocalização negada ou indisponível, prosseguindo sem coordenadas GPS.", error);
          loadSmartInsightsWithLocation(); // Fallback sem coordenadas
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      loadSmartInsightsWithLocation();
    }
  }, [currentUser, quantity, selectedRestaurant]);

  const handleRestaurantChange = (e) => {
    const restaurantId = parseInt(e.target.value, 10);
    const found = restaurants.find(r => r.id === restaurantId);
    setSelectedRestaurant(found || null);
    setSelectedItem('');
  };

  const currentMenu = selectedRestaurant ? (selectedRestaurant.menu_items || selectedRestaurant.menuitems || []) : [];
  const displayedRestaurants = showAllRestaurants ? restaurants : restaurants.slice(0, 2);

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Banner Superior */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <h3 className="text-xl sm:text-2xl font-black">Descubra os melhores sabores perto de você!</h3>
          <p className="text-xs sm:text-sm text-red-100 mt-1">Faça login ou cadastre-se para começar a realizar seus pedidos com a DeliverFlow AI.</p>
        </div>
        {!currentUser && (
          <button 
            onClick={() => setActiveTab('auth')}
            className="bg-yellow-400 text-red-900 font-bold px-6 py-3 rounded-xl shadow hover:bg-yellow-300 transition shrink-0 text-sm border-0 cursor-pointer"
          >
            Entrar na Conta
          </button>
        )}
      </div>

      {/* PAINEL DE INTELIGÊNCIA ARTIFICIAL: Previsão Dinâmica de Entrega com Base em GPS */}
      {currentUser && smartInsights && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-indigo-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/20">
                IA PREDICTIVE ENGINE (GPS ROUTING)
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                {locationStatus}
              </span>
            </div>
            <h4 className="text-lg font-black mt-2 text-white">
              Entrega Estimada: ~{smartInsights.estimated_delivery_time_minutes} minutos ({smartInsights.delivery_window})
            </h4>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              {smartInsights.prediction_basis}
            </p>
          </div>
          <div className="bg-indigo-600/30 border border-indigo-400/30 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-200">
            {loadingInsights ? 'Calculando Rota...' : 'Algoritmo Ativo'}
          </div>
        </div>
      )}

      {/* Seção de Pedido Rápido */}
      {currentUser && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Fazer Pedido Rápido</h3>
          <form onSubmit={orderSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Restaurante</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" 
                value={selectedRestaurant ? selectedRestaurant.id : ""}
                onChange={handleRestaurantChange}
              >
                <option value="" disabled>Selecione o restaurante...</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prato</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" 
                value={selectedItem} 
                onChange={e => setSelectedItem(e.target.value)} 
                disabled={!selectedRestaurant || currentMenu.length === 0}
              >
                <option value="" disabled>
                  {!selectedRestaurant ? 'Selecione a loja primeiro...' : (currentMenu.length === 0 ? 'Sem pratos disponíveis' : 'Selecione o prato...')}
                </option>
                {currentMenu.map(i => (
                  <option key={i.id} value={i.id}>{i.name} - R$ {Number(i.price).toFixed(2)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantidade</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" 
              />
            </div>

            <div>
              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition border-0 cursor-pointer"
              >
                Confirmar Pedido
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECOMENDAÇÕES INTELIGENTES DE PRATOS (IA / Histórico) */}
      {currentUser && smartInsights?.recommendations && smartInsights.recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Recomendados para Você</h2>
              <p className="text-xs text-gray-500 mt-0.5">Sugestões calculadas com base nos seus pedidos e pratos populares.</p>
            </div>
            <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
              Personalizado via IA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {smartInsights.recommendations.map((dish) => (
              <div key={dish.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                <div>
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-xs text-gray-400">Sem Imagem</div>
                  )}
                  <h4 className="font-bold text-gray-800 text-sm">{dish.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dish.description}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-black text-emerald-600 text-sm">R$ {Number(dish.price).toFixed(2)}</span>
                  <button 
                    onClick={() => {
                      const rest = restaurants.find(r => (r.menu_items || r.menuitems || []).some(m => m.id === dish.id));
                      if (rest) setSelectedRestaurant(rest);
                      setSelectedItem(dish.id.toString());
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition border-0 cursor-pointer"
                  >
                    Selecionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Melhores Pratos Recomendados (Geral) */}
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4">Melhores Pratos Recomendados</h2>
        {topDishes && topDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {topDishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
                {dish.image && <img src={dish.image} alt={dish.name} className="w-full h-36 object-cover" />}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded">{dish.restaurantName}</span>
                    <h4 className="font-bold text-sm text-gray-800 mt-1">{dish.name}</h4>
                    <p className="text-gray-500 text-xs line-clamp-2 mt-1">{dish.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="font-black text-green-600 text-sm">R$ {Number(dish.price).toFixed(2)}</span>
                    {currentUser ? (
                      <button 
                        onClick={() => { 
                          const rest = restaurants.find(r => r.name === dish.restaurantName); 
                          if (rest) setSelectedRestaurant(rest); 
                          setSelectedItem(dish.id.toString()); 
                          window.scrollTo({ top: 0, behavior: 'smooth' }); 
                        }} 
                        className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-700 transition border-0 cursor-pointer"
                      >
                        Pedir
                      </button>
                    ) : (
                      <button onClick={() => setActiveTab('auth')} className="text-xs text-red-600 font-bold hover:underline bg-transparent border-0 cursor-pointer">Entrar p/ pedir</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic bg-white p-6 rounded-2xl border border-gray-100 text-center">Nenhum prato recomendado disponível no momento.</p>
        )}
      </div>

      {/* Restaurantes Mais Populares */}
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4">Restaurantes Mais Populares</h2>
        {restaurants && restaurants.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedRestaurants.map((rest) => {
                const menuList = rest.menu_items || rest.menuitems || [];
                return (
                  <div key={rest.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{rest.name}</h3>
                          <span className="text-xs bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-semibold">{rest.category}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500">Taxa: R$ {Number(rest.delivery_fee).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Cardápio</h4>
                        {menuList.length > 0 ? (
                          <div className="space-y-2.5">
                            {menuList.map((item) => (
                              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100 gap-3">
                                {item.image ? <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shrink-0" /> : <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center text-[9px] text-gray-400">Sem foto</div>}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-xs text-gray-800 truncate">{item.name}</h5>
                                  <p className="text-gray-500 text-[11px] truncate">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="font-black text-green-600 text-xs">R$ {Number(item.price).toFixed(2)}</span>
                                  {currentUser ? (
                                    <button 
                                      onClick={() => {
                                        setSelectedRestaurant(rest);
                                        setSelectedItem(item.id.toString());
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition border-0 cursor-pointer"
                                    >
                                      Pedir
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => setActiveTab('auth')}
                                      className="text-[10px] text-red-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                                    >
                                      Entrar
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-xs text-gray-400 italic">Nenhum item no cardápio.</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {restaurants.length > 2 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllRestaurants(!showAllRestaurants)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-sm cursor-pointer border-0"
                >
                  {showAllRestaurants ? 'Ver Menos' : `Ver Mais (${restaurants.length - 2} restantes)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic bg-white p-6 rounded-2xl border border-gray-100 text-center">Nenhum restaurante cadastrado no banco de dados.</p>
        )}
      </div>
    </div>
  );
}