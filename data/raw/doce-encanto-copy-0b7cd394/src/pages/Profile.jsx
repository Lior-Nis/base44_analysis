import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Order } from '@/api/entities';
import Layout from '../layout';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User as UserIcon, ShoppingCart, Gift, LogOut, Edit } from 'lucide-react';
import ReminderManager from '../components/customer/ReminderManager';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalSpent: 0, orderCount: 0, loyaltyPoints: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentUser = await User.me();
        if (!currentUser) {
          throw new Error("Utilizador não autenticado.");
        }
        setUser(currentUser);

        // MODIFICAÇÃO: Buscar TODOS os pedidos do cliente, sem filtrar por tipo
        const allUserOrders = await Order.filter({ customer_email: currentUser.email }, '-created_date');
        setOrders(allUserOrders);

        // MODIFICAÇÃO: Calcular estatísticas com base em TODOS os pedidos
        const totalSpent = allUserOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const orderCount = allUserOrders.length;
        
        // Assume-se que 1 ponto é ganho a cada 100 Kz gastos em pedidos entregues
        const calculatedPoints = Math.floor(
          allUserOrders
            .filter(o => o.status === 'entregue' || o.status === 'retirado')
            .reduce((sum, o) => sum + o.total_amount, 0) / 100
        );

        setStats({ 
          totalSpent, 
          orderCount,
          loyaltyPoints: calculatedPoints
        });

      } catch (e) {
        console.error("Falha ao carregar dados do perfil:", e);
        setError("Não foi possível carregar os seus dados. Por favor, tente novamente mais tarde ou faça login.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await User.logout();
    window.location.href = createPageUrl('Home');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
          <Button asChild className="mt-4">
            <Link to={createPageUrl('Entrar')}>Ir para a Página de Login</Link>
          </Button>
        </div>
      );
    }

    return (
      <>
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              Painel do Cliente
            </h2>
            <p className="mt-1 text-lg text-gray-500">Olá, {user.full_name}!</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Gasto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">Kz {stats.totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats.orderCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pontos de Fidelidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.loyaltyPoints} pts</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${activeTab === 'overview' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Histórico de Pedidos
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`${activeTab === 'reminders' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Meus Lembretes de Eventos
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle>Seus Pedidos Recentes</CardTitle>
                <CardDescription>Aqui está o histórico de todas as suas compras, incluindo encomendas e itens da vitrine.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length > 0 ? orders.map(order => {
                    const orderCode = order.id.slice(-6).toUpperCase();
                    const isVitrine = order.order_type === 'vitrine_diaria';
                    return (
                      <div key={order.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">Pedido #{orderCode}</h3>
                            {/* NOVO: Badge para diferenciar o tipo de pedido */}
                            <Badge variant={isVitrine ? "outline" : "default"}>
                              {isVitrine ? "Vitrine Diária" : "Encomenda"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_date).toLocaleDateString('pt-AO', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {order.items.map(item => `${item.quantity}x ${item.product_name}`).join(', ')}
                          </p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-lg font-bold">Kz {order.total_amount.toFixed(2)}</p>
                          <Badge className={`mt-1 capitalize ${order.status === 'entregue' || order.status === 'retirado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="text-center py-10">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Sem pedidos ainda</h3>
                      <p className="mt-1 text-sm text-gray-500">Que tal começar a explorar nosso menu?</p>
                      <Button asChild className="mt-6">
                        <Link to={createPageUrl('Menu')}>Ver Menu</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'reminders' && user && (
            <ReminderManager customerEmail={user.email} />
          )}
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
}