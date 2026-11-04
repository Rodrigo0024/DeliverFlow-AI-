import React from 'react';
import logoImage from '../assets/Gemini_Generated_Image_99cycx99cycx99cy.jfif';

export default function Header({ currentUser, activeTab, setActiveTab, isOperationalUser, handleLogout }) {
  return (
    <header className="bg-red-600 text-white shadow-none py-3 px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-3">
      <div 
        className="cursor-pointer flex flex-col items-center md:items-start text-center md:text-left" 
        onClick={() => setActiveTab(isOperationalUser ? 'restaurant_dashboard' : 'home')}
      >
        <img 
          src={logoImage} 
          alt="DeliverFlow AI Logo" 
          className="h-10 sm:h-12 w-auto object-contain bg-transparent border-0 shadow-none" 
        />
        <span className="text-[11px] sm:text-xs text-yellow-200 tracking-wide mt-0.5">
          Deliver food, aqui você encontra os melhores pratos
        </span>
      </div>
      
      <nav className="flex flex-wrap justify-center items-center gap-2 sm:space-x-3">
        {isOperationalUser ? (
          <>
            <button 
              onClick={() => setActiveTab('restaurant_dashboard')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium border-0 transition ${activeTab === 'restaurant_dashboard' ? 'bg-red-700 font-bold' : 'hover:bg-red-500 bg-red-600'}`}
            >
              Gerenciar Pedidos
            </button>
            <button 
              onClick={() => setActiveTab('manage_restaurant')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium border-0 transition ${activeTab === 'manage_restaurant' ? 'bg-red-700 font-bold' : 'hover:bg-red-500 bg-red-600'}`}
            >
              Minha Loja & Pratos
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium border-0 transition ${activeTab === 'home' ? 'bg-red-700 font-bold' : 'hover:bg-red-500 bg-red-600'}`}
            >
              Recomendações
            </button>

            {currentUser && (
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium border-0 transition ${activeTab === 'orders' ? 'bg-red-700 font-bold' : 'hover:bg-red-500 bg-red-600'}`}
              >
                Meus Pedidos
              </button>
            )}
          </>
        )}

        {currentUser ? (
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="bg-red-700 px-3 py-1 rounded text-xs sm:text-sm font-bold border-0">
              {currentUser.username}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-yellow-400 text-red-900 text-xs px-3 py-1.5 rounded hover:bg-yellow-300 transition font-bold border-0 cursor-pointer"
            >
              Sair
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setActiveTab('auth')}
            className="bg-yellow-400 text-red-900 font-bold px-4 py-1.5 rounded hover:bg-yellow-300 transition text-xs sm:text-sm mt-2 md:mt-0 border-0 cursor-pointer"
          >
            Entrar / Cadastrar
          </button>
        )}
      </nav>
    </header>
  );
}