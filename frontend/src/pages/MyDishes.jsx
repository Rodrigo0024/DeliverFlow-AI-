import React, { useState } from 'react';
import { createMenuItem, deleteMenuItem } from '../services/api';

export default function MyDishes({ myRestaurant, loadData, setFeedbackMessage }) {
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishImage, setDishImage] = useState('');

  const handleCreateDish = async (e) => {
    e.preventDefault();
    if (!myRestaurant) {
      setFeedbackMessage('Erro: Nenhum restaurante associado a esta conta. Cadastre a loja primeiro na aba "Minha Loja".');
      return;
    }

    try {
      await createMenuItem(myRestaurant.id, {
        name: dishName,
        description: dishDescription,
        price: parseFloat(dishPrice),
        image: dishImage
      });
      setFeedbackMessage('Prato cadastrado com sucesso!');
      setDishName('');
      setDishDescription('');
      setDishPrice('');
      setDishImage('');
      loadData();
    } catch (error) {
      console.error("Erro ao cadastrar prato:", error.response?.data);
      setFeedbackMessage('Erro ao cadastrar prato. Verifique os dados.');
    }
  };

  const handleDeleteDish = async (itemId) => {
    if (window.confirm('Tem a certeza de que deseja excluir este prato?')) {
      try {
        await deleteMenuItem(itemId);
        setFeedbackMessage('Prato excluído com sucesso!');
        loadData();
      } catch (error) {
        setFeedbackMessage('Erro ao excluir o prato.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gestão de Pratos do Cardápio</h2>
        <p className="text-sm text-gray-600 mb-6">
          Restaurante atual: <strong className="text-red-600">{myRestaurant ? myRestaurant.name : 'Nenhum restaurante encontrado'}</strong>
        </p>

        {myRestaurant ? (
          <form onSubmit={handleCreateDish} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-sm text-gray-700">Adicionar Novo Prato</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome do Prato</label>
                <input 
                  type="text" 
                  value={dishName} 
                  onChange={(e) => setDishName(e.target.value)} 
                  required
                  className="w-full border rounded p-2 text-sm bg-white"
                  placeholder="Ex: X-Tudo Especial"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={dishPrice} 
                  onChange={(e) => setDishPrice(e.target.value)} 
                  required
                  className="w-full border rounded p-2 text-sm bg-white"
                  placeholder="35.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
              <textarea 
                value={dishDescription} 
                onChange={(e) => setDishDescription(e.target.value)} 
                required
                className="w-full border rounded p-2 text-sm bg-white"
                placeholder="Ingredientes e detalhes do prato"
                rows="2"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL da Imagem</label>
              <input 
                type="url" 
                value={dishImage} 
                onChange={(e) => setDishImage(e.target.value)} 
                className="w-full border rounded p-2 text-sm bg-white"
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>
            <button 
              type="submit" 
              className="bg-green-600 text-white font-bold px-4 py-2 rounded text-sm hover:bg-green-700 transition cursor-pointer border-0"
            >
              Cadastrar Prato
            </button>
          </form>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm">
            <p className="font-bold">Atenção!</p>
            <p className="text-xs mt-1">Para cadastrar pratos, precisa primeiro de registar os dados da sua loja na aba "Minha Loja".</p>
          </div>
        )}
      </div>

      {/* Listagem visual dos pratos */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Pratos Cadastrados ({myRestaurant?.menu_items?.length || 0})
        </h3>

        {myRestaurant?.menu_items && myRestaurant.menu_items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myRestaurant.menu_items.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden bg-gray-50 flex flex-col justify-between shadow-sm">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sem imagem</div>
                )}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t flex justify-between items-center">
                    <span className="font-black text-green-600 text-sm">R$ {item.price}</span>
                    <button 
                      onClick={() => handleDeleteDish(item.id)}
                      className="bg-red-500 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-red-600 transition border-0 cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic text-center py-6">Ainda não existem pratos registados para este restaurante.</p>
        )}
      </div>
    </div>
  );
}