import React, { useEffect, useState } from 'react';
import { getRestaurants, getOrders, createOrder, updateOrderStatus } from './services/api';
import Header from './components/Header';
import Home from './pages/Home';
import Auth from './pages/Auth';
import OwnerDashboard from './pages/OwnerDashboard';
import ManageRestaurant from './pages/ManageRestaurant';
import MyDishes from './pages/MyDishes';
import Orders from './pages/Orders';

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('authUsername');
    const savedUserType = localStorage.getItem('authUserType');

    if (savedToken && savedUsername) {
      setCurrentUser({
        username: savedUsername,
        user_type: savedUserType,
        token: savedToken
      });
      if (savedUserType !== 'customer') {
        setActiveTab('restaurant_dashboard');
      }
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resRestaurants = await getRestaurants();
      const rawData = resRestaurants.data;
      const restaurantsArray = Array.isArray(rawData) ? rawData : (rawData?.results || []);

      const normalizedRestaurants = restaurantsArray.map(r => ({
        ...r,
        menu_items: r.menu_items || r.menuitems || []
      }));

      setRestaurants(normalizedRestaurants);

      const resOrders = await getOrders();
      const ordersData = resOrders.data;
      setOrders(Array.isArray(ordersData) ? ordersData : (ordersData?.results || []));

    } catch (error) {
      console.error("Erro ao carregar dados da API:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setFeedbackMessage('Você saiu da sua conta.');
    setActiveTab('home');
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!selectedRestaurant || !selectedItem || selectedItem === "") {
      setFeedbackMessage('Por favor, selecione um restaurante e um prato válido.');
      return;
    }

    try {
      await createOrder({
        restaurant: parseInt(selectedRestaurant.id, 10),
        items: [{ 
          menu_item_id: parseInt(selectedItem, 10), 
          quantity: parseInt(quantity, 10) || 1 
        }]
      });
      setFeedbackMessage('Pedido realizado com sucesso!');
      setSelectedItem('');
      setQuantity(1);
      loadData();
      setActiveTab('orders');
    } catch (error) {
      console.error("Erro ao criar pedido:", error.response?.data);
      setFeedbackMessage('Erro ao registrar o pedido. Verifique os dados selecionados.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const isOperationalUser = currentUser && currentUser.user_type !== 'customer';
  
  const myRestaurant = isOperationalUser 
    ? restaurants.find(r => 
        r.owner === currentUser?.username || 
        r.owner_username === currentUser?.username ||
        r.owner === currentUser?.id
      )
    : null;

  // FILTRAGEM RIGOROSA DE PEDIDOS:
  // - Se for Lojista/Dono: vê apenas os pedidos do SEU restaurante.
  // - Se for Cliente: vê apenas os SEUS próprios pedidos.
  const myCustomerOrders = orders.filter(order => {
    if (isOperationalUser) {
      return myRestaurant && (order.restaurant === myRestaurant.id || order.restaurant_name === myRestaurant.name);
    }
    if (currentUser) {
      return order.customer_username === currentUser.username || 
             order.customer === currentUser.username || 
             order.customer === currentUser.id;
    }
    return true; // fallback se não houver dados de usuário para filtrar localmente
  });

  const allMenuItems = restaurants.flatMap(r => {
    const dishes = r.menu_items || r.menuitems || [];
    return dishes.map(item => ({ ...item, restaurantName: r.name }));
  });
  const topDishes = allMenuItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      <Header 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOperationalUser={isOperationalUser} 
        handleLogout={handleLogout} 
      />

      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1">
        {feedbackMessage && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-xl text-xs sm:text-sm font-semibold shadow-sm flex justify-between items-center">
            <span>{feedbackMessage}</span>
            <button onClick={() => setFeedbackMessage('')} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {activeTab === 'home' && (
          <Home 
            currentUser={currentUser}
            restaurants={restaurants}
            topDishes={topDishes}
            setSelectedRestaurant={setSelectedRestaurant}
            setSelectedItem={setSelectedItem}
            setActiveTab={setActiveTab}
            selectedRestaurant={selectedRestaurant}
            selectedItem={selectedItem}
            quantity={quantity}
            setQuantity={setQuantity}
            orderSubmit={handleCreateOrder}
          />
        )}

        {activeTab === 'orders' && (
          <Orders 
            orders={myCustomerOrders} 
            loadData={loadData} 
            setFeedbackMessage={setFeedbackMessage} 
          />
        )}

        {activeTab === 'auth' && (
          <Auth 
            setCurrentUser={setCurrentUser}
            setActiveTab={setActiveTab}
            setFeedbackMessage={setFeedbackMessage}
          />
        )}

        {activeTab === 'restaurant_dashboard' && currentUser && isOperationalUser && (
          <OwnerDashboard 
            currentUser={currentUser} 
            myRestaurant={myRestaurant} 
            filteredOrders={myCustomerOrders} 
            handleStatusChange={handleStatusChange} 
          />
        )}

        {activeTab === 'manage_restaurant' && currentUser && isOperationalUser && (
          <ManageRestaurant 
            myRestaurant={myRestaurant} 
            loadData={loadData} 
            setFeedbackMessage={setFeedbackMessage} 
          />
        )}

        {activeTab === 'my_dishes' && currentUser && isOperationalUser && (
          <MyDishes 
            myRestaurant={myRestaurant} 
            loadData={loadData} 
            setFeedbackMessage={setFeedbackMessage} 
          />
        )}
      </main>
    </div>
  );
}