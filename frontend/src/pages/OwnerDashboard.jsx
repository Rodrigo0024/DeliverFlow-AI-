import React from 'react';

export default function OwnerDashboard({ currentUser, myRestaurant, filteredOrders, handleStatusChange }) {
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Painel do Restaurante</h2>
        {myRestaurant ? (
          <p className="text-sm text-gray-600">
            Restaurante vinculado: <strong className="text-gray-900">{myRestaurant.name}</strong>. Gerencie abaixo apenas os pedidos recebidos para o seu estabelecimento.
          </p>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm mt-2">
            <p className="font-bold">Nenhum restaurante cadastrado!</p>
            <p className="text-xs mt-1">
              Você está logado como dono de restaurante (`{currentUser.username}`), mas ainda não possui um restaurante cadastrado. Vá na aba <strong>Minha Loja & Pratos</strong> para registrar seu estabelecimento.
            </p>
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold mb-4 text-gray-800">Pedidos Recebidos</h3>
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-100">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-100 text-xs uppercase text-gray-600 font-bold border-b">
              <th className="p-3">Pedido ID</th>
              <th className="p-3">Restaurante</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status Atual</th>
              <th className="p-3">Ações de Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3 font-semibold">#{order.id}</td>
                <td className="p-3">{order.restaurant_name}</td>
                <td className="p-3 font-bold text-green-600">R$ {order.total_amount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="space-x-1 sm:space-x-2 whitespace-nowrap">
                    <button onClick={() => handleStatusChange(order.id, 'preparing')} className="bg-blue-500 text-white px-2.5 py-1 rounded text-xs hover:bg-blue-600 transition border-0 cursor-pointer">Em Preparo</button>
                    <button onClick={() => handleStatusChange(order.id, 'delivering')} className="bg-purple-500 text-white px-2.5 py-1 rounded text-xs hover:bg-purple-600 transition border-0 cursor-pointer">Entregando</button>
                    <button onClick={() => handleStatusChange(order.id, 'completed')} className="bg-green-600 text-white px-2.5 py-1 rounded text-xs hover:bg-green-700 transition border-0 cursor-pointer">Concluir</button>
                    <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="bg-red-600 text-white px-2.5 py-1 rounded text-xs hover:bg-red-700 transition border-0 cursor-pointer">Cancelar</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400 italic">
                  {myRestaurant 
                    ? "Nenhum pedido recebido para o seu restaurante ainda." 
                    : "Você precisa cadastrar um restaurante primeiro para receber e visualizar pedidos."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}