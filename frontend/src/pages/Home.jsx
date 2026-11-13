import React, { useState } from 'react';

export default function Home({ currentUser, restaurants, topDishes, setSelectedRestaurant, setSelectedItem, setActiveTab, selectedRestaurant, quantity, setQuantity, orderSubmit, selectedItem }) {
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [clientLocation, setClientLocation] = useState(null);

  // Tenta obter a localização via GPS do navegador para calcular as distâncias
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setClientLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocalização indisponível:", error);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Cálculo da distância Haversine em km
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

      {/* Seção de Pedido Rápido com Botão de Confirmar */}
      {currentUser && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🛒</span> Fazer Pedido Rápido
          </h3>
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
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition border-0 cursor-pointer shadow-sm"
              >
                Confirmar Pedido
              </button>
            </div>
          </form>
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

      {/* Restaurantes Mais Populares com Endereço e Cálculo de Distância */}
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4">Restaurantes Mais Populares</h2>
        {restaurants && restaurants.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedRestaurants.map((rest) => {
                const menuList = rest.menu_items || rest.menuitems || [];
                const distance = clientLocation && rest.latitude && rest.longitude
                  ? calculateDistance(clientLocation.latitude, clientLocation.longitude, rest.latitude, rest.longitude)
                  : null;

                return (
                  <div key={rest.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{rest.name}</h3>
                          <span className="text-xs bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-semibold">{rest.category}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500">Taxa: R$ {Number(rest.delivery_fee).toFixed(2)}</span>
                      </div>

                      {/* Exibição do Endereço e Distância por GPS */}
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-4 pb-2 border-b border-gray-100">
                        <p className="flex items-center gap-1">
                          📍 {rest.address || 'Endereço não informado'}
                        </p>
                        {distance && (
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {distance} km de você
                          </span>
                        )}
                      </div>

                      <div>
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
                                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition border-0 cursor-pointer shadow-sm"
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