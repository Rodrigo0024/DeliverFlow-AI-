import React, { useState } from 'react';
import { registerUser, loginUser, createRestaurant } from '../services/api';

export default function Auth({ setCurrentUser, setActiveTab, setFeedbackMessage }) {
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('customer');

  // Campos obrigatórios quando o perfil for Dono de Restaurante
  const [restName, setRestName] = useState('');
  const [restCategory, setRestCategory] = useState('Lanches');
  const [restDeliveryFee, setRestDeliveryFee] = useState('5.00');
  const [restAddress, setRestAddress] = useState('');
  const [restLatitude, setRestLatitude] = useState('');
  const [restLongitude, setRestLongitude] = useState('');
  const [gpsStatus, setGpsStatus] = useState('');

  // Captura o GPS do dispositivo durante o cadastro
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocalização não suportada pelo navegador.');
      return;
    }

    setGpsStatus('Buscando coordenadas...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRestLatitude(position.coords.latitude);
        setRestLongitude(position.coords.longitude);
        setGpsStatus('Coordenadas capturadas!');
      },
      (error) => {
        console.error('Erro GPS:', error);
        setGpsStatus('Não foi possível obter GPS. Preencha manualmente.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'register') {
        // 1. Validação extra caso seja dono de restaurante
        if (userType === 'restaurant_owner') {
          if (!restName.trim() || !restAddress.trim() || restLatitude === '' || restLongitude === '') {
            setFeedbackMessage('Por favor, preencha o nome, endereço e coordenadas GPS do restaurante.');
            return;
          }
        }

        // 2. Cria o usuário
        await registerUser({ username, password, email, user_type: userType });

        // 3. Se for Dono de Restaurante, loga automaticamente para criar a loja com a localização
        if (userType === 'restaurant_owner') {
          const loginResp = await loginUser({ username, password });
          const token = loginResp.data.token;

          localStorage.setItem('authToken', token);
          localStorage.setItem('authUsername', username);
          localStorage.setItem('authUserType', 'restaurant_owner');

          // Cria o restaurante associado ao usuário recém-criado
          await createRestaurant({
            name: restName,
            category: restCategory,
            delivery_fee: parseFloat(restDeliveryFee) || 0,
            address: restAddress,
            latitude: parseFloat(restLatitude),
            longitude: parseFloat(restLongitude),
          });

          setCurrentUser({ username, user_type: 'restaurant_owner', token });
          setFeedbackMessage('Conta e restaurante cadastrados com sucesso!');
          setActiveTab('restaurant_dashboard');
        } else {
          setFeedbackMessage('Conta criada com sucesso! Faça login.');
          setAuthMode('login');
        }
      } else {
        // Fluxo normal de Login
        const response = await loginUser({ username, password });
        const token = response.data.token;
        const uType = response.data.user_type || userType;

        localStorage.setItem('authToken', token);
        localStorage.setItem('authUsername', username);
        localStorage.setItem('authUserType', uType);

        setCurrentUser({ username, user_type: uType, token });
        setFeedbackMessage(`Bem-vindo de volta, ${username}!`);
        setActiveTab(uType !== 'customer' ? 'restaurant_dashboard' : 'home');
      }
    } catch (error) {
      console.error("Erro na autenticação/cadastro:", error.response?.data || error);
      const errData = error.response?.data;
      let msg = 'Erro ao processar solicitação. Verifique os dados informados.';
      if (errData && typeof errData === 'object') {
        msg = Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join(' | ');
      }
      setFeedbackMessage(msg);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-6 mb-12">
      <h2 className="text-2xl font-black text-center text-gray-900 mb-6">
        {authMode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
      </h2>

      <form onSubmit={handleAuthSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome de Usuário</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" 
            placeholder="Seu usuário" 
          />
        </div>

        {authMode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" 
                placeholder="seu@email.com" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Perfil</label>
              <select 
                value={userType} 
                onChange={(e) => setUserType(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm bg-white"
              >
                <option value="customer">Cliente</option>
                <option value="restaurant_owner">Dono de Restaurante</option>
                <option value="delivery_driver">Entregador</option>
              </select>
            </div>

            {/* CAMPOS OBRIGATÓRIOS PARA DONO DE RESTAURANTE */}
            {userType === 'restaurant_owner' && (
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-3 mt-2">
                <div className="flex justify-between items-center border-b border-red-100 pb-2">
                  <span className="text-xs font-black text-red-700 uppercase">Dados & Localização da Loja</span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border-0"
                  >
                    📍 Usar Meu GPS
                  </button>
                </div>

                {gpsStatus && (
                  <p className="text-[11px] font-semibold text-emerald-700">{gpsStatus}</p>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Nome do Restaurante *</label>
                  <input 
                    type="text" 
                    value={restName} 
                    onChange={(e) => setRestName(e.target.value)} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                    placeholder="Ex: Burger Craft Artesanal" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Categoria *</label>
                    <select 
                      value={restCategory} 
                      onChange={(e) => setRestCategory(e.target.value)} 
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm"
                    >
                      <option value="Lanches">Lanches</option>
                      <option value="Pizzas">Pizzas</option>
                      <option value="Brasileira">Brasileira</option>
                      <option value="Japonesa">Japonesa</option>
                      <option value="Italiana">Italiana</option>
                      <option value="Doces e Sobremesas">Doces e Sobremesas</option>
                      <option value="Bebidas">Bebidas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Taxa Entrega (R$) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={restDeliveryFee} 
                      onChange={(e) => setRestDeliveryFee(e.target.value)} 
                      required 
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                      placeholder="5.00" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Endereço Completo *</label>
                  <input 
                    type="text" 
                    value={restAddress} 
                    onChange={(e) => setRestAddress(e.target.value)} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                    placeholder="Ex: Av. Paulista, 1000 - Centro" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Latitude *</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={restLatitude} 
                      onChange={(e) => setRestLatitude(e.target.value)} 
                      required 
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                      placeholder="-22.2215" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Longitude *</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={restLongitude} 
                      onChange={(e) => setRestLongitude(e.target.value)} 
                      required 
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                      placeholder="-49.9542" 
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Senha</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" 
            placeholder="••••••••" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition cursor-pointer border-0 mt-2"
        >
          {authMode === 'login' ? 'Entrar' : 'Cadastrar Conta'}
        </button>

        <div className="text-center mt-4">
          <button 
            type="button" 
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
            className="text-xs text-red-600 hover:underline font-semibold bg-transparent border-0 cursor-pointer"
          >
            {authMode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </form>
    </div>
  );
}