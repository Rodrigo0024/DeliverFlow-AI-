import React, { useState, useEffect } from 'react';
import { createRestaurant, updateRestaurant, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';

export default function ManageRestaurant({ myRestaurant, loadData, setFeedbackMessage }) {
  const [restName, setRestName] = useState('');
  const [restCategory, setRestCategory] = useState('Lanches');
  const [restDeliveryFee, setRestDeliveryFee] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishImage, setDishImage] = useState('');

  useEffect(() => {
    if (myRestaurant) {
      setRestName(myRestaurant.name || '');
      setRestCategory(myRestaurant.category || 'Lanches');
      setRestDeliveryFee(myRestaurant.delivery_fee || '');
    }
  }, [myRestaurant]);

  const handleRegisterRestaurant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: restName,
        category: restCategory,
        delivery_fee: parseFloat(restDeliveryFee)
      };

      if (myRestaurant && myRestaurant.id) {
        await updateRestaurant(myRestaurant.id, payload);
        setFeedbackMessage('Dados da loja atualizados com sucesso!');
      } else {
        await createRestaurant(payload);
        setFeedbackMessage('Restaurante cadastrado com sucesso!');
      }
      loadData();
    } catch (error) {
      console.error("Erro ao salvar restaurante:", error.response?.data);
      const errorData = error.response?.data;
      let errorMsg = 'Erro ao salvar restaurante.';
      if (errorData) {
        errorMsg = typeof errorData === 'string' ? errorData : Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(' | ');
      }
      setFeedbackMessage(errorMsg);
    }
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    
    if (!myRestaurant || !myRestaurant.id) {
      setFeedbackMessage('Erro: Nenhum restaurante associado. Salve os dados da loja primeiro.');
      return;
    }

    try {
      if (editingId) {
        await updateMenuItem(editingId, {
          name: dishName,
          description: dishDescription,
          price: parseFloat(dishPrice),
          image: dishImage,
          restaurant: myRestaurant.id
        });
        setFeedbackMessage('Prato atualizado com sucesso!');
        setEditingId(null);
      } else {
        await createMenuItem(myRestaurant.id, {
          name: dishName,
          description: dishDescription,
          price: parseFloat(dishPrice),
          image: dishImage
        });
        setFeedbackMessage('Prato cadastrado com sucesso!');
      }

      setDishName('');
      setDishDescription('');
      setDishPrice('');
      setDishImage('');
      loadData();
    } catch (error) {
      console.error("Erro ao salvar prato:", error.response?.data);
      const errData = error.response?.data;
      let msg = 'Erro ao salvar prato. Verifique os dados.';
      if (errData) {
        msg = typeof errData === 'string' ? errData : Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join(' | ');
      }
      setFeedbackMessage(msg);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setDishName(item.name);
    setDishDescription(item.description);
    setDishPrice(item.price);
    setDishImage(item.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (itemId) => {
    if (window.confirm('Tem certeza que deseja excluir este prato?')) {
      try {
        await deleteMenuItem(itemId);
        setFeedbackMessage('Prato excluído com sucesso!');
        loadData();
      } catch (error) {
        setFeedbackMessage('Erro ao excluir prato.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gestão do Estabelecimento</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure as informações da sua loja e monte o seu cardápio de vendas.</p>
        </div>
        {myRestaurant && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
            Loja Ativa: {myRestaurant.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bloco 1: Dados do Restaurante */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">🏪</div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Perfil da Loja</h2>
                <p className="text-xs text-gray-500">Altere o nome, categoria ou taxa de entrega.</p>
              </div>
            </div>

            <form onSubmit={handleRegisterRestaurant} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nome do Restaurante</label>
                <input 
                  type="text" 
                  value={restName} 
                  onChange={(e) => setRestName(e.target.value)} 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  placeholder="Ex: Burger Craft Artesanal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Categoria Principal</label>
                <select 
                  value={restCategory} 
                  onChange={(e) => setRestCategory(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Taxa de Entrega (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={restDeliveryFee} 
                  onChange={(e) => setRestDeliveryFee(e.target.value)} 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  placeholder="5.00"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-sm hover:shadow cursor-pointer border-0 mt-2"
              >
                {myRestaurant ? 'Atualizar Dados da Loja' : 'Salvar Restaurante'}
              </button>
            </form>
          </div>
        </div>

        {/* Bloco 2: Cadastrar/Editar Prato */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg">🍽️</div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{editingId ? 'Editar Prato' : 'Novo Prato'}</h2>
                  <p className="text-xs text-gray-500">Adicione itens deliciosos ao cardápio.</p>
                </div>
              </div>
              {editingId && (
                <button 
                  onClick={() => { setEditingId(null); setDishName(''); setDishDescription(''); setDishPrice(''); setDishImage(''); }}
                  className="text-xs text-red-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            {myRestaurant ? (
              <form onSubmit={handleSaveMenuItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nome do Prato</label>
                  <input 
                    type="text" 
                    value={dishName} 
                    onChange={(e) => setDishName(e.target.value)} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="Ex: X-Salada Duplo Bacon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Descrição</label>
                  <textarea 
                    value={dishDescription} 
                    onChange={(e) => setDishDescription(e.target.value)} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
                    placeholder="Pão brioche, carne artesanal 160g..."
                    rows="2"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Preço (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={dishPrice} 
                      onChange={(e) => setDishPrice(e.target.value)} 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      placeholder="29.90"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">URL da Imagem</label>
                    <input 
                      type="url" 
                      value={dishImage} 
                      onChange={(e) => setDishImage(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`w-full text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-sm hover:shadow cursor-pointer border-0 mt-4 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {editingId ? 'Salvar Alterações do Prato' : 'Adicionar ao Cardápio'}
                </button>
              </form>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-sm text-center">
                <p className="font-bold mb-1">Loja não configurada</p>
                <p className="text-xs text-amber-700">Preencha e salve os dados da sua loja ao lado para liberar o cadastro de pratos.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Seção Inferior: Listagem Moderna dos Pratos */}
      {myRestaurant && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cardápio Cadastrado</h3>
              <p className="text-xs text-gray-500">Gerencie os itens disponíveis para os clientes.</p>
            </div>
            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
              {myRestaurant.menu_items?.length || 0} {myRestaurant.menu_items?.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {myRestaurant.menu_items && myRestaurant.menu_items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRestaurant.menu_items.map((item) => (
                <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  <div className="relative h-40 bg-gray-200">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">Sem imagem</div>
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-700 font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                      R$ {Number(item.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Disponível</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          className="bg-white border border-gray-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-3xl mb-2">🍽️</div>
              <p className="text-sm font-bold text-gray-700">Nenhum prato cadastrado ainda</p>
              <p className="text-xs text-gray-400 mt-1">Utilize o formulário acima para adicionar o primeiro item ao cardápio.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}