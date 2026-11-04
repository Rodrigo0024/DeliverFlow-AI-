import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/api';

export default function Auth({ setCurrentUser, setActiveTab, setFeedbackMessage }) {
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('customer');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'register') {
        await registerUser({ username, password, email, user_type: userType });
        setFeedbackMessage('Conta criada com sucesso! Faça login.');
        setAuthMode('login');
      } else {
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
      console.error("Erro na autenticação:", error);
      setFeedbackMessage('Erro ao processar autenticação. Verifique suas credenciais.');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <h2 className="text-2xl font-black text-center text-gray-900 mb-6">
        {authMode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
      </h2>
      <form onSubmit={handleAuthSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome de Usuário</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" placeholder="Seu usuário" />
        </div>

        {authMode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Perfil</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm bg-white">
                <option value="customer">Cliente</option>
                <option value="restaurant_owner">Dono de Restaurante</option>
                <option value="delivery_driver">Entregador</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" placeholder="••••••••" />
        </div>

        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition cursor-pointer border-0 mt-2">
          {authMode === 'login' ? 'Entrar' : 'Cadastrar Conta'}
        </button>

        <div className="text-center mt-4">
          <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs text-red-600 hover:underline font-semibold bg-transparent border-0 cursor-pointer">
            {authMode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </form>
    </div>
  );
}