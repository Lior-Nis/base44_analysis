import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  User as UserIcon,
  Loader2,
  Edit,
  Phone,
  Mail,
  AlertCircle,
  ShoppingCart,
  Calendar,
  Package
} from 'lucide-react';
import { User, Order } from '@/api/entities';
import ReminderManager from '../components/customer/ReminderManager';

function ProfileUpdateForm({ user, onUpdate }) {
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 9) {
      alert('Por favor, insira um número de telefone válido.');
      return;
    }
    
    setIsSaving(true);
    try {
      await User.updateMyUserData({ phone, address });
      onUpdate({ ...user, phone, address });
      alert('Perfil atualizado com sucesso! Agora você receberá notificações no WhatsApp.');
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert('Não foi possível atualizar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-orange-500" />
          Complete seu Cadastro
        </CardTitle>
        <CardDescription>
          Adicione seu número de telefone para receber notificações importantes sobre seus pedidos via WhatsApp.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Seu número de telefone será usado para todas as comunicações sobre pedidos, incluindo confirmações e atualizações de status via WhatsApp.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-medium">
              Número de Telefone *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+244 943 XXX XXX"
              className="text-base"
              required
            />
            <p className="text-sm text-gray-600">
              Formato: +244 9XX XXX XXX (inclua o código do país)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-medium">
              Endereço para Entregas (Opcional)
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Sua localização para facilitar entregas futuras"
              className="text-base"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving} className="w-full bg-orange-500 hover:bg-orange-600">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
            Salvar e Ativar Notificações WhatsApp
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function OrderHistorySection({ user }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalSpent: 0, orderCount: 0, loyaltyPoints: 0 });

  useEffect(() => {
    if (user && user.email) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      console.log('Buscando pedidos para:', user.email);
      // Buscar todos os pedidos do usuário
      const userOrders = await Order.list('-created_date');
      
      // Filtrar apenas os pedidos deste usuário
      const myOrders = userOrders.filter(order => 
        order.customer_email === user.email
      );
      
      console.log('Pedidos encontrados:', myOrders);
      setOrders(myOrders);

      // Calcular estatísticas
      const totalSpent = myOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const orderCount = myOrders.length;
      const completedOrders = myOrders.filter(o => o.status === 'entregue' || o.status === 'retirado');
      const loyaltyPoints = Math.floor(completedOrders.reduce((sum, o) => sum + o.total_amount, 0) / 100);

      setStats({ totalSpent, orderCount, loyaltyPoints });

    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateOrderCode = (order) => {
    const isVitrine = order.order_type === 'vitrine_diaria';
    const prefix = isVitrine ? 'VT-' : 'PD-';
    const sequentialNumber = order.id.slice(-6).replace(/\D/g, '').slice(-2).padStart(2, '0');
    return `${prefix}${sequentialNumber}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-blue-100 text-blue-800';
      case 'preparando': return 'bg-purple-100 text-purple-800';
      case 'pronto': return 'bg-green-100 text-green-800';
      case 'entregue': case 'retirado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold text-gray-900">Kz {stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.orderCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pontos de Fidelidade</p>
                <p className="text-2xl font-bold text-purple-600">{stats.loyaltyPoints} pts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos</CardTitle>
          <CardDescription>
            Todos os seus pedidos, incluindo encomendas e compras da vitrine diária.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido ainda</h3>
              <p className="text-gray-500 mb-6">Que tal fazer seu primeiro pedido?</p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Ver Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const orderCode = generateOrderCode(order);
                const isVitrine = order.order_type === 'vitrine_diaria';
                
                return (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{orderCode}</h4>
                          <Badge variant={isVitrine ? "outline" : "default"}>
                            {isVitrine ? "Vitrine Diária" : "Encomenda"}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(order.created_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        {order.event_date && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Evento: {new Date(order.event_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          Kz {order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <h5 className="font-medium text-gray-900 mb-2">Itens:</h5>
                      <div className="space-y-1">
                        {order.items?.map((item, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.product_name} - Kz {(item.quantity * item.unit_price).toFixed(2)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerPanel() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Usuário não autenticado ou erro ao carregar dados:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-700">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Acesso Negado</h1>
        <p className="text-gray-600 mt-2">Você precisa estar logado para acessar esta página.</p>
        <Button onClick={() => User.login()} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
          Fazer Login
        </Button>
      </div>
    );
  }

  const showProfileForm = !user.phone || user.phone === '';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meu Painel</h1>
          <p className="text-gray-600">Bem-vindo de volta, {user.full_name}!</p>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meus Pedidos
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meu Perfil
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'reminders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lembretes
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {activeTab === 'overview' && <OrderHistorySection user={user} />}
            
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {showProfileForm && (
                  <ProfileUpdateForm user={user} onUpdate={handleProfileUpdate} />
                )}
                
                {!showProfileForm && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-600">✅ Perfil Completo</CardTitle>
                      <CardDescription>
                        Seu perfil está configurado corretamente. Você receberá notificações via WhatsApp.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'reminders' && <ReminderManager user={user} />}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-orange-500" />
                  Suas Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Nome:</span>
                  <span>{user.full_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Telefone:</span>
                  <span className={user.phone ? 'text-green-600' : 'text-red-500'}>
                    {user.phone || 'Não informado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Email:</span>
                  <span className="text-xs text-gray-600">{user.email}</span>
                </div>
                
                {user.address && (
                  <div className="pt-2 border-t">
                    <span className="font-medium">Endereço:</span>
                    <p className="text-sm text-gray-600 mt-1">{user.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {user.phone && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-800">WhatsApp Ativo</h3>
                    <p className="text-sm text-green-600 mt-1">
                      Você receberá notificações sobre seus pedidos no WhatsApp
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}