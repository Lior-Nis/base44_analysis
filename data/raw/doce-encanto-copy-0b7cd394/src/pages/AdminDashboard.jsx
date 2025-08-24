
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
// Removed Tabs, TabsList, TabsTrigger as per outline - replaced with custom buttons
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  Plus,
  Settings,
  FileText,
  MessageSquare,
  Star,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Printer,
  MapPin,
  Clock,
  Gift,
  Bot,
  Shield,
  Bell,
  Phone,
  CloudUpload,
  Loader2,
  AlertTriangle,
  Code,
  Copy,
  RotateCcw,
  Globe // Adicionar ícone de globo para domínio
} from 'lucide-react';
import { Product, Order, User, Testemunho, Coupon, CustomerMessage, CustomerReminder, SiteConfig, Notification } from '@/api/entities';
import { UploadFile, SendEmail } from "@/api/integrations";
import { motion } from 'framer-motion';
import ProductForm from '../components/admin/ProductForm';
import ReportsDashboard from '../components/admin/ReportsDashboard';
import ReportArchiveComponent from '../components/admin/ReportArchive';
import InventoryManagement from '../components/admin/InventoryManagement';
import LearnManagement from '../components/admin/LearnManagement';
import PrintableOrder from '../components/admin/PrintableOrder';
import SiteConfigForm from '../components/admin/SiteConfigForm';
import MarketingAI from '../components/admin/MarketingAI';
import DomainConfig from '../components/admin/DomainConfig'; // Adicionar import

// Componente DailyShowcase
function DailyShowcase({ products, orders, onPublishProduct, onUpdateStock, onRemoveFromToday, onUpdateOrderStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const todayPublishedProducts = products.filter(p => p.published_today);
  const availableProducts = products.filter(p => !p.published_today);
  const dailyOrders = orders.filter(o => o.order_type === 'vitrine_diaria');

  const filteredAvailableProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const todayRevenue = dailyOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const todayOrders = dailyOrders.length;

  const generateOrderCode = (order) => {
    const isVitrine = order.order_type === 'vitrine_diaria';
    const prefix = isVitrine ? 'VT-' : 'PD-';
    // Use the last 6 characters of the ID, remove non-digits, and take the last 2 digits, pad with '0'
    const sequentialNumber = order.id.slice(-6).replace(/\D/g, '').slice(-2).padStart(2, '0');
    return `${prefix}${sequentialNumber}`;
  };

  const handleWhatsAppNotificationDaily = (order) => {
    const phoneNumber = order.customer_phone.replace(/\D/g, ''); // Remove non-numeric characters
    const orderCode = generateOrderCode(order);
    let statusMessage = '';

    switch(order.status) {
      case 'preparando':
        statusMessage = 'está sendo preparado com carinho';
        break;
      case 'pronto':
        statusMessage = 'está pronto para ser retirado! 🎉 Pode vir buscar quando quiser';
        break;
      case 'entregue':
        statusMessage = 'foi entregue. Esperamos que tenha gostado!';
        break;
      default:
        statusMessage = `foi atualizado para: ${order.status}`;
    }

    const message = encodeURIComponent(`Olá ${order.customer_name}! 😊 Seu pedido ${orderCode} da nossa Vitrine Diária ${statusMessage}. Obrigado por escolher a Lina Kamati! 🍰`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vitrine Diária</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Receita de Hoje</p>
          <p className="text-2xl font-bold text-green-600">Kz {todayRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{todayOrders} pedidos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Produtos Publicados Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-500" />
              Produtos na Vitrine Hoje ({todayPublishedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayPublishedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum produto publicado hoje</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayPublishedProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">Kz {product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm">Estoque:</span>
                        <Input
                          type="number"
                          value={product.daily_stock || 0}
                          onChange={(e) => onUpdateStock(product.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                          min="0"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveFromToday(product.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produtos Disponíveis para Publicar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Adicionar à Vitrine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">Todas</option>
                  <option value="Doces">Doces</option>
                  <option value="Salgados">Salgados</option>
                  <option value="Bebidas">Bebidas</option>
                </select>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredAvailableProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium">{product.name}</h5>
                      <p className="text-sm text-gray-600">Kz {product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        className="w-20 h-8"
                        min="1"
                        id={`stock-${product.id}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const stockInput = document.getElementById(`stock-${product.id}`);
                          const stock = parseInt(stockInput.value) || 1;
                          onPublishProduct(product.id, stock);
                          stockInput.value = '';
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos da Vitrine Diária */}
      {dailyOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pedidos da Vitrine Diária Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyOrders.map(order => {
                const orderCode = generateOrderCode(order);
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{orderCode}</p>
                      <p className="text-sm font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_date).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold">Kz {order.total_amount.toFixed(2)}</p>
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 mt-1"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="preparando">Preparando</option>
                          <option value="pronto">Pronto</option>
                          <option value="entregue">Retirado</option>
                        </select>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100 ml-2"
                        onClick={() => handleWhatsAppNotificationDaily(order)}
                        title="Notificar via WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente de Visão Geral do Dashboard
function DashboardOverview({ stats, todaySales, weeklyTrends, onAddProduct, onTabChange, onExportReport }) {
  const [selectedStatus, setSelectedStatus] = useState(null);

  return (
    <div className="space-y-8">
      {/* Cards de Estatísticas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Vendas de Hoje (Geral)</p>
                <p className="text-3xl font-bold">Kz {todaySales.toFixed(2)}</p>
                <p className="text-blue-100 text-sm">+12% vs ontem</p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Pedidos de Encomenda Ativos</p>
                <p className="text-3xl font-bold">{stats.activeOrders}</p>
                <p className="text-green-100 text-sm">{stats.newOrders} novas hoje</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">Produto Destaque (Geral)</p>
                <p className="text-xl font-bold">{stats.topProduct?.name || 'Carregando...'}</p>
                <p className="text-purple-100 text-sm">{stats.topProduct?.sales || 0} vendidos</p>
              </div>
              <Package className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Clientes Ativos</p>
                <p className="text-3xl font-bold">{stats.activeCustomers}</p>
                <p className="text-orange-100 text-sm">{stats.newCustomers} novos na semana</p>
              </div>
              <Users className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance da Vitrine Diária */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Star className="text-yellow-500"/>
                Performance da Vitrine Diária
            </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Receita da Vitrine Hoje</p>
                <p className="text-2xl font-bold text-green-600">Kz {stats.dailyShowcaseRevenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Itens Vendidos na Vitrine</p>
                <p className="text-2xl font-bold text-blue-600">{stats.dailyShowcaseItemsSold || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Produto Mais Popular da Vitrine</p>
                <p className="text-2xl font-bold text-purple-600">{stats.dailyTopProduct || 'N/A'}</p>
            </div>
        </CardContent>
      </Card>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Tendências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Tendência de Vendas - Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Total da Semana: <strong className="text-orange-600">Kz {weeklyTrends.reduce((sum, day) => sum + day.sales, 0).toFixed(2)}</strong></span>
                <span>Média Diária: <strong className="text-blue-600">Kz {(weeklyTrends.reduce((sum, day) => sum + day.sales, 0) / 7).toFixed(2)}</strong></span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `Kz ${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`Kz ${value.toFixed(2)}`, 'Vendas do Dia']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f97316"
                  strokeWidth={3}
                  fill="url(#salesGradient)"
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#f97316', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dashboard de Status dos Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              Status dos Pedidos de Encomenda
            </CardTitle>
            <p className="text-sm text-gray-600">
              Total: {stats.orderStatusData?.reduce((sum, item) => sum + item.value, 0) || 0} pedidos
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.orderStatusData?.map((statusItem) => {
                const totalOrders = stats.orderStatusData.reduce((sum, item) => sum + item.value, 0);
                const percentage = totalOrders > 0
                  ? (statusItem.value / totalOrders) * 100
                  : 0;

                const isSelected = selectedStatus === statusItem.name;

                return (
                  <motion.div
                    key={statusItem.name}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedStatus(isSelected ? null : statusItem.name)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="absolute inset-0 rounded-xl opacity-10"
                      style={{
                        background: `linear-gradient(to right, ${statusItem.color} ${percentage}%, transparent ${percentage}%)`
                      }}
                    />

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: statusItem.color }}
                        />

                        <div>
                          <h4 className="font-semibold text-gray-800">{statusItem.name}</h4>
                          <p className="text-sm text-gray-500">
                            {percentage.toFixed(1)}% do total
                          </p>
                        </div>
                      </div>

                      <div className="2xl font-bold" style={{ color: statusItem.color }}>
                        {statusItem.value}
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Ações Sugeridas:</p>
                            <p className="font-medium">
                              {statusItem.name === 'Pendente' && 'Confirmar pedidos'}
                              {statusItem.name === 'Confirmado' && 'Iniciar preparação'}
                              {statusItem.name === 'Preparando' && 'Finalizar produção'}
                              {statusItem.name === 'Pronto' && 'Organizar entrega'}
                              {statusItem.name === 'Entregue' && 'Pedir avaliação'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Prioridade:</p>
                            <p className="font-medium">
                              {statusItem.name === 'Pendente' && '🔴 Alta'}
                              {statusItem.name === 'Confirmado' && '🟡 Média'}
                              {statusItem.name === 'Preparando' && '🟡 Média'}
                              {statusItem.name === 'Pronto' && '🔴 Alta'}
                              {statusItem.name === 'Entregue' && '🟢 Baixa'}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTabChange('orders');
                          }}
                        >
                          Ver Pedidos {statusItem.name}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2" onClick={onAddProduct}>
              <Plus className="w-6 h-6" />
              Adicionar Produto
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => onTabChange('messages')}>
              <MessageSquare className="w-6 h-6" />
              Ver Mensagens
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => onTabChange('coupons')}>
              <Gift className="w-6 h-6" />
              Criar Cupom
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={onExportReport}>
              <Download className="w-6 h-6" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Gestão de Pedidos
function OrdersManagement({ orders, onStatusChange, onDeleteOrder, onPrintOrder }) {
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    let filtered = orders;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.order_type === typeFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, typeFilter]);

  const getStatusColor = (status) => {
    const colors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'confirmado': 'bg-blue-100 text-blue-800',
      'preparando': 'bg-purple-100 text-purple-800',
      'pronto': 'bg-green-100 text-green-800',
      'entregue': 'bg-gray-100 text-gray-800',
      'retirado': 'bg-gray-100 text-gray-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="all">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="preparando">Preparando</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="retirado">Retirado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="all">Todos os Tipos</option>
            <option value="encomenda">Encomenda</option>
            <option value="vitrine_diaria">Vitrine Diária</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <li key={order.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900">
                        Pedido #{order.id.slice(-6)}
                      </p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant={order.order_type === 'vitrine_diaria' ? 'outline' : 'default'}>
                        {order.order_type === 'vitrine_diaria' ? 'Vitrine' : 'Encomenda'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500">
                        Kz {order.total_amount?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <strong>Cliente:</strong> {order.customer_name} • <strong>Telefone:</strong> {order.customer_phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_date).toLocaleDateString('pt-BR')} às {new Date(order.created_date).toLocaleTimeString('pt-BR')}
                    </p>
                    {order.event_date && (
                      <p className="text-sm text-gray-500">
                        <strong>Data do Evento:</strong> {new Date(order.event_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {/* Dropdown de Status */}
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="preparando">Preparando</option>
                    <option value="pronto">Pronto</option>
                    <option value="entregue">Entregue</option>
                    <option value="retirado">Retirado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                  
                  {/* Botão Imprimir */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPrintOrder(order)}
                    className="text-xs"
                  >
                    Imprimir
                  </Button>
                  
                  {/* Botão Eliminar */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteOrder(order.id)}
                    className="text-xs bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
              
              {/* Itens do Pedido */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Itens do Pedido:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">{item.quantity}x</span> {item.product_name}
                        <span className="text-gray-500 ml-2">
                          (Kz {item.unit_price?.toFixed(2)} cada)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Observações */}
              {order.notes && (
                <div className="mt-2 p-2 bg-yellow-50 rounded">
                  <p className="text-xs text-gray-700">
                    <strong>Observações:</strong> {order.notes}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum pedido encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductManagement({ products, onAddProduct, onEditProduct, onDeleteProduct }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Produtos</h2>
        <Button onClick={onAddProduct} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Todas as Categorias</option>
          <option value="Salgados">Salgados</option>
          <option value="Doces">Doces</option>
          <option value="Especiais">Especiais</option>
          <option value="Bebidas">Bebidas</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all">
            <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {product.published_today && (
                <Badge className="absolute top-2 right-2 bg-purple-500 text-white">
                  Vitrine Diária
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl font-bold text-orange-600">
                  Kz {product.price.toFixed(2)}
                </span>
                {product.tags?.includes('Destaque') && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Destaque
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEditProduct(product)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onDeleteProduct(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CustomerManagement({ customers, orders, onDeleteCustomer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('value');

  const calculateCustomerStats = () => {
    const customerOrdersMap = new Map();
    orders.forEach(order => {
        if (order.order_type !== 'vitrine_diaria') {
            if (!customerOrdersMap.has(order.customer_email)) {
                customerOrdersMap.set(order.customer_email, []);
            }
            customerOrdersMap.get(order.customer_email).push(order);
        }
    });

    const customerStats = customers.map(customer => {
      const customerOrders = customerOrdersMap.get(customer.email) || [];
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const orderCount = customerOrders.length;
      const lastOrderDate = customerOrders.length > 0
        ? Math.max(...customerOrders.map(order => new Date(order.created_date).getTime()))
        : null;

      const daysSinceLastOrder = lastOrderDate
        ? Math.floor((Date.now() - lastOrderDate) / (1000 * 60 * 60 * 24))
        : 999;

      const loyaltyScore = (totalSpent / 100) * 100 + (orderCount * 10) + (Math.max(0, 30 - daysSinceLastOrder) * 1);

      return {
        ...customer,
        totalSpent,
        orderCount,
        lastOrderDate,
        loyaltyScore
      };
    });

    return customerStats.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalSpent - a.totalSpent;
        case 'frequency':
          return b.orderCount - a.orderCount;
        case 'loyalty':
          return b.loyaltyScore - a.loyaltyScore;
        default:
          return b.totalSpent - a.totalSpent;
      }
    });
  };

  const customerStats = calculateCustomerStats();
  const filteredCustomers = customerStats.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.created_date);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear && order.order_type !== 'vitrine_diaria';
  });

  const monthlyCustomerStats = customers.map(customer => {
    const customerMonthlyOrders = thisMonthOrders.filter(order => order.customer_email === customer.email);
    const monthlySpent = customerMonthlyOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const monthlyOrderCount = customerMonthlyOrders.length;

    return {
      ...customer,
      monthlySpent,
      monthlyOrderCount,
      monthlyScore: monthlySpent + (monthlyOrderCount * 20)
    };
  }).sort((a, b) => b.monthlyScore - a.monthlyScore);

  const bestCustomerOfMonth = monthlyCustomerStats[0];

  const getBadgeColor = (index) => {
    if (index === 0) return "bg-yellow-500 text-white";
    if (index === 1) return "bg-gray-400 text-white";
    if (index === 2) return "bg-amber-600 text-white";
    return "bg-blue-100 text-blue-800";
  };

  const getCustomerTier = (loyaltyScore) => {
    if (loyaltyScore >= 500) return { name: "VIP", color: "bg-purple-100 text-purple-800" };
    if (loyaltyScore >= 200) return { name: "Ouro", color: "bg-yellow-100 text-yellow-800" };
    if (loyaltyScore >= 100) return { name: "Prata", color: "bg-gray-100 text-gray-800" };
    return { name: "Bronze", color: "bg-amber-100 text-amber-800" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
          <Button variant="outline">
            <Gift className="w-4 h-4 mr-2" />
            Enviar Promoção
          </Button>
        </div>
      </div>

      {bestCustomerOfMonth && bestCustomerOfMonth.monthlySpent > 0 && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-300" />
              🏆 Cliente do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{bestCustomerOfMonth.full_name}</h3>
                <p className="text-purple-100">{bestCustomerOfMonth.email}</p>
                <p className="text-sm text-purple-200 mt-2">
                  Gastou Kz {bestCustomerOfMonth.monthlySpent.toFixed(2)} este mês
                  em {bestCustomerOfMonth.monthlyOrderCount} {bestCustomerOfMonth.monthlyOrderCount === 1 ? 'pedido' : 'pedidos'}
                </p>
              </div>
              <div className="text-right">
                <Link to={createPageUrl('RewardPage') + `?customerId=${bestCustomerOfMonth.id}`}>
                    <Button variant="outline" className="bg-white text-purple-600 hover:bg-purple-50">
                      <Gift className="w-4 h-4 mr-2" />
                      Enviar Prêmio
                    </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="value">Maior Valor Gasto</option>
          <option value="frequency">Mais Pedidos</option>
          <option value="loyalty">Maior Fidelidade</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Posição</th>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Categoria</th>
                  <th className="text-left p-4 font-medium">Total Gasto</th>
                  <th className="text-left p-4 font-medium">Pedidos</th>
                  <th className="text-left p-4 font-medium">Último Pedido</th>
                  <th className="text-left p-4 font-medium">Fidelidade</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => {
                  const tier = getCustomerTier(customer.loyaltyScore);
                  return (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Badge className={getBadgeColor(index)}>
                          #{index + 1}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{customer.full_name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={tier.color}>
                          {tier.name}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-green-600">Kz {customer.totalSpent.toFixed(2)}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{customer.orderCount}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600">
                          {customer.lastOrderDate
                            ? `${customer.daysSinceLastOrder} dias atrás`
                            : 'Nunca'
                          }
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-purple-600">
                          {customer.loyaltyScore.toFixed(0)} pts
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Gift className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => onDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
            <p className="text-sm text-gray-600">Total de Clientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              Kz {customerStats.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Receita Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {customerStats.filter(c => c.loyaltyScore >= 200).length}
            </p>
            <p className="text-sm text-gray-600">Clientes VIP/Ouro</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              Kz {customerStats.length > 0 ? (customerStats.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-600">Ticket Médio</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente CouponManagement
function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false); // This state is defined but the form component is not implemented here.

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await Coupon.list('-created_date');
      setCoupons(data);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2">Carregando cupons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Cupons</h2>
        <Button onClick={() => setShowCouponForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Cupom
        </Button>
      </div>

      <div className="grid gap-4">
        {coupons.map(coupon => (
          <Card key={coupon.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{coupon.code}</h3>
                  <p className="text-sm text-gray-600">{coupon.description}</p>
                  <p className="text-sm text-gray-500">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `Kz ${coupon.discount_value}`} de desconto
                  </p>
                </div>
                <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                  {coupon.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Componente CustomerMessagesManagement
function CustomerMessagesManagement() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await CustomerMessage.list('-created_date');
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2">Carregando mensagens...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mensagens dos Clientes</h2>

      <div className="space-y-4">
        {messages.map(message => (
          <Card key={message.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{message.customer_name}</h3>
                  <p className="text-sm text-gray-600">{message.customer_email}</p>
                  <p className="mt-2">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.created_date).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge variant={message.status === 'pending' ? 'destructive' : 'default'}>
                  {message.status === 'pending' ? 'Pendente' : 'Respondida'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MarketingManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Marketing e Engajamento</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Programa de Fidelidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Pontos por Kz gasto</Label>
              <Input type="number" defaultValue="1" />
            </div>
            <div>
              {/* Corrected: Changed <label> to <Label> component */}
              <Label className="block text-sm font-medium mb-2">Pontos por cadastro</Label>
              <Input type="number" defaultValue="100" />
            </div>
            <Button>Atualizar Configurações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Lives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Próximas Lives</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Nova Live
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Tutorial Bolo de Natal</p>
                    <p className="text-sm text-gray-600">20 de Dezembro, 2024 - 15:00</p>
                  </div>
                  <Badge>Agendada</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// New ApiDocs component
function ApiDocs() {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/orders',
      description: 'Obtém uma lista de todos os pedidos, com opções de filtragem e ordenação.',
      params: [
        { name: 'status', type: 'string', description: 'Filtra pedidos por status (e.g., "pendente", "entregue").' },
        { name: 'customer_id', type: 'string', description: 'Filtra pedidos por ID do cliente.' },
        { name: 'created_date__gte', type: 'datetime', description: 'Filtra pedidos criados a partir desta data.' },
        { name: 'sort_by', type: 'string', description: 'Campo para ordenar (e.g., "-created_date", "total_amount").' },
        { name: 'limit', type: 'integer', description: 'Número máximo de resultados a retornar.' },
      ],
      exampleRequest: `GET /api/orders?status=pendente&sort_by=-created_date&limit=10`,
      exampleResponse: `[
  {
    "id": "ord_xyz123",
    "customer_name": "Ana Silva",
    "total_amount": 150.75,
    "status": "pendente",
    "created_date": "2024-03-10T10:30:00Z",
    "items": [
      {"product_name": "Bolo de Cenoura", "quantity": 1, "price": 75.00},
      {"product_name": "Brigadeiro", "quantity": 10, "price": 7.50}
    ]
  },
  {
    "id": "ord_abc456",
    "customer_name": "João Souza",
    "total_amount": 200.00,
    "status": "pronto",
    "created_date": "2024-03-09T14:00:00Z"
  }
]`
    },
    {
      method: 'POST',
      path: '/api/products',
      description: 'Cria um novo produto no sistema.',
      params: [
        { name: 'name', type: 'string (required)', description: 'Nome do produto.' },
        { name: 'description', type: 'string', description: 'Descrição detalhada do produto.' },
        { name: 'price', type: 'number (required)', description: 'Preço unitário do produto.' },
        { name: 'category', type: 'string', description: 'Categoria do produto (e.g., "Doces", "Salgados").' },
        { name: 'image_url', type: 'string', description: 'URL da imagem do produto.' },
        { name: 'stock', type: 'integer', description: 'Quantidade em estoque.' }
      ],
      exampleRequest: `POST /api/products
Content-Type: application/json

{
  "name": "Tartelete de Frutas",
  "description": "Deliciosa tartelete com creme patissiere e frutas frescas.",
  "price": 35.00,
  "category": "Doces",
  "image_url": "https://example.com/tartelete.jpg",
  "stock": 50
}`,
      exampleResponse: `{
  "id": "prod_789ghi",
  "name": "Tartelete de Frutas",
  "price": 35.00,
  "category": "Doces",
  "created_date": "2024-03-11T11:00:00Z"
}`
    },
    {
      method: 'GET',
      path: '/api/customers/{id}',
      description: 'Obtém detalhes de um cliente específico pelo seu ID.',
      params: [
        { name: 'id', type: 'string (path parameter)', description: 'O ID único do cliente.' }
      ],
      exampleRequest: `GET /api/customers/usr_jkl012`,
      exampleResponse: `{
  "id": "usr_jkl012",
  "full_name": "Helena Costa",
  "email": "helena.costa@email.com",
  "phone": "+244912345678",
  "address": "Rua Principal, 123",
  "registered_date": "2023-01-15T09:00:00Z",
  "total_spent": 1250.50,
  "order_count": 8
}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code className="w-6 h-6 text-orange-500" />
          Documentação da API Lina Kamati
        </h2>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Baixar Postman Collection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            Bem-vindo à documentação da API da Lina Kamati! Esta API permite que você interaja programaticamente com os dados da sua confeitaria, incluindo pedidos, produtos e clientes. Use-a para integrar com outros sistemas, automatizar tarefas ou criar relatórios personalizados.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Todos os endpoints são acessados via HTTPS e aceitam e retornam dados em formato JSON.
          </p>
          <h3 className="text-lg font-semibold mt-4 mb-2">Autenticação</h3>
          <p className="text-gray-700">
            A autenticação é feita via <strong>Token Bearer</strong> no cabeçalho `Authorization`. Você deve obter seu token de API nas configurações do painel administrativo.
          </p>
          <pre className="bg-gray-100 p-3 rounded-md text-sm mt-2 overflow-x-auto">
            <code>Authorization: Bearer SEU_TOKEN_DE_API_AQUI</code>
          </pre>
        </CardContent>
      </Card>

      <h3 className="text-xl font-bold mt-8">Endpoints Disponíveis</h3>

      <div className="space-y-6">
        {endpoints.map((endpoint, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                <Badge className={`${endpoint.method === 'GET' ? 'bg-blue-500' :
                                  endpoint.method === 'POST' ? 'bg-green-500' :
                                  endpoint.method === 'PUT' ? 'bg-yellow-500' :
                                  endpoint.method === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'} text-white mr-2`}>
                  {endpoint.method}
                </Badge>
                {endpoint.path}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{endpoint.description}</p>

              {endpoint.params && endpoint.params.length > 0 && (
                <>
                  <h4 className="font-semibold text-md mb-2">Parâmetros:</h4>
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full bg-white border border-gray-200 rounded-md">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-2 border-b">Nome</th>
                          <th className="px-4 py-2 border-b">Tipo</th>
                          <th className="px-4 py-2 border-b">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.params.map((param, pIndex) => (
                          <tr key={pIndex} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b text-sm font-medium text-gray-900">{param.name}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-600">{param.type}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-600">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <h4 className="font-semibold text-md mb-2">Exemplo de Requisição:</h4>
              <div className="relative mb-4">
                <Textarea
                  value={endpoint.exampleRequest}
                  readOnly
                  rows={endpoint.exampleRequest.split('\n').length}
                  className="bg-gray-800 text-white font-mono text-sm p-4 rounded-md resize-none overflow-x-auto"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => handleCopy(endpoint.exampleRequest)}
                  title="Copiar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <h4 className="font-semibold text-md mb-2">Exemplo de Resposta:</h4>
              <div className="relative">
                <Textarea
                  value={endpoint.exampleResponse}
                  readOnly
                  rows={endpoint.exampleResponse.split('\n').length > 15 ? 15 : endpoint.exampleResponse.split('\n').length}
                  className="bg-gray-800 text-white font-mono text-sm p-4 rounded-md resize-none overflow-x-auto"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => handleCopy(endpoint.exampleResponse)}
                  title="Copiar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configurações do Sistema</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Loja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Nome da Loja</Label>
              <Input defaultValue="Doce Encanto" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Telefone</Label>
              <Input defaultValue="(11) 5555-1234" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Email</Label>
              <Input defaultValue="contato@doceencanto.com.br" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Endereço</Label>
              <Input defaultValue="Av. Paulista, 1234 - São Paulo, SP" />
            </div>
            <Button>Atualizar Informações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horário de Funcionamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => (
              <div key={day} className="flex items-center justify-between">
                <span className="font-medium w-24">{day}</span>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="10:00" className="w-24" />
                  <span>às</span>
                  <Input type="time" defaultValue="22:00" className="w-24" />
                </div>
              </div>
            ))}
            <Button>Atualizar Horários</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Usuários Administradores</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">João Silva</p>
                    <p className="text-sm text-gray-600">joao@doceencanto.com.br</p>
                  </div>
                  <Badge>Super Admin</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Maria Santos</p>
                    <p className="text-sm text-gray-600">maria@doceencanto.com.br</p>
                  </div>
                  <Badge variant="outline">Gestor de Pedidos</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Notificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações de Novos Pedidos</p>
                <p className="text-sm text-gray-600">Receber notificações quando novos pedidos chegarem</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Estoque Baixo</p>
                <p className="text-sm text-gray-600">Alertar quando produtos estiverem com estoque baixo</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações de Avaliações de Clientes</p>
                <p className="text-sm text-gray-600">Receber notificações de novas avaliações</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Novo componente para gerenciar notificações
function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Reduzir frequência de verificação para evitar spam de requisições
    const interval = setInterval(loadNotifications, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setHasError(false);

      // Timeout para evitar requisições que ficam pendentes
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );

      const data = await Promise.race([
        Notification.list('-created_date', 20),
        timeoutPromise
      ]);

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      setHasError(true);
      // Manter notificações em cache se houver erro
      console.log('Sistema de notificações temporariamente indisponível');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log('Erro ao marcar notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => Notification.update(n.id, { is_read: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log('Erro ao marcar todas como lidas');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4 mr-2" />
        Notificações
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {hasError && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" title="Sistema temporariamente indisponível" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notificações</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Marcar todas como lidas'}
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">{unreadCount} não lidas</p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium text-gray-800 ${!notification.is_read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.created_date)}
                          </span>
                          {notification.category && (
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    activeOrders: 0,
    newOrders: 0,
    topProduct: null,
    activeCustomers: 0,
    newCustomers: 0,
    orderStatusData: [],
    dailyShowcaseRevenue: 0,
    dailyShowcaseItemsSold: 0,
    dailyTopProduct: null,
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [todaySales, setTodaySales] = useState(0);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Função para criar notificações automáticas
  const createNotification = async (title, message, type = 'info', category = 'system', relatedId = null) => {
    try {
      await Notification.create({
        title,
        message,
        type,
        category,
        related_id: relatedId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      });
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  };

  useEffect(() => {
    const loadSiteConfig = async () => {
        try {
            const configs = await SiteConfig.list();
            if (configs.length > 0) {
                setSiteConfig(configs[0]);
            }
        } catch (error) {
            console.error("Failed to load site config:", error);
        }
    };

    loadDashboardData();
    checkAndSendReminders();
    loadSiteConfig();

    // Verificar novos pedidos a cada 2 minutos (reduzindo frequência)
    const orderCheckInterval = setInterval(checkForNewOrders, 120000);

    return () => {
      clearInterval(orderCheckInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setLoadError(null); // Reseta o erro ao tentar carregar novamente
    try {
      // Carregar dados com retry em caso de falha
      const loadWithRetry = async (entityCall, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await entityCall();
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Delay progressivo
          }
        }
      };

      const [ordersData, productsData, usersData, messagesData] = await Promise.all([
        loadWithRetry(() => Order.list('-created_date', 500)),
        loadWithRetry(() => Product.list('-created_date')),
        loadWithRetry(() => User.list()),
        loadWithRetry(() => CustomerMessage.list('-created_date'))
      ]);

      setMessages(messagesData);

      const today = new Date().toDateString();

      const generalOrders = ordersData.filter(o => o.order_type !== 'vitrine_diaria');
      const dailyShowcaseOrders = ordersData.filter(o => o.order_type === 'vitrine_diaria');

      const todaysGeneralOrders = generalOrders.filter(o => new Date(o.created_date).toDateString() === today);
      const todaysGeneralRevenue = todaysGeneralOrders.reduce((sum, order) => sum + order.total_amount, 0);

      const todaysDailyOrders = dailyShowcaseOrders.filter(o => new Date(o.created_date).toDateString() === today);
      const dailyShowcaseRevenue = todaysDailyOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const dailyShowcaseItemsSold = todaysDailyOrders.flatMap(o => o.items).reduce((sum, item) => sum + item.quantity, 0);

      let dailyTopProduct = 'N/A';
      if(todaysDailyOrders.length > 0) {
        const productCounts = todaysDailyOrders
            .flatMap(o => o.items)
            .reduce((acc, item) => {
                acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity;
                return acc;
            }, {});

        dailyTopProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b, 'N/A');
      }

      const totalTodaySales = todaysGeneralRevenue + dailyShowcaseRevenue;

      const weeklyData = [];
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();

        const dayOrders = ordersData.filter(o => new Date(o.created_date).toDateString() === dateString);
        const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total_amount, 0);

        weeklyData.push({
          day: dayNames[date.getDay()],
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          sales: dayRevenue,
          orders: dayOrders.length
        });
      }

      const statusData = [
        { name: 'Pendente', value: generalOrders.filter(o => o.status === 'pendente').length, color: '#fbbf24' },
        { name: 'Confirmado', value: generalOrders.filter(o => o.status === 'confirmado').length, color: '#3b82f6' },
        { name: 'Preparando', value: generalOrders.filter(o => o.status === 'preparando').length, color: '#8b5cf6' },
        { name: 'Pronto', value: generalOrders.filter(o => o.status === 'pronto').length, color: '#10b981' },
        { name: 'Entregue', value: generalOrders.filter(o => o.status === 'entregue').length, color: '#6b7280' },
      ];

       const productSales = generalOrders
        .flatMap(o => o.items)
        .reduce((acc, item) => {
            acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity;
            return acc;
        }, {});

      const topProductName = Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b, 'N/A');
      const topProductSales = productSales[topProductName] || 0;

      setStats({
        activeOrders: generalOrders.filter(o => ['pendente', 'confirmado', 'preparando', 'pronto'].includes(o.status)).length,
        newOrders: todaysGeneralOrders.length,
        topProduct: { name: topProductName, sales: topProductSales },
        activeCustomers: usersData.length,
        newCustomers: usersData.filter(u => (new Date() - new Date(u.created_date)) < 7 * 24 * 60 * 60 * 1000).length,
        orderStatusData: statusData,
        dailyShowcaseRevenue: dailyShowcaseRevenue,
        dailyShowcaseItemsSold: dailyShowcaseItemsSold,
        dailyTopProduct: dailyTopProduct,
      });

      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(usersData);
      setTodaySales(totalTodaySales);
      setWeeklyTrends(weeklyData);

    } catch (error) {
      console.error('Erro de rede ao carregar dados do dashboard:', error);
      setLoadError('Não foi possível carregar os dados do painel. Verifique sua conexão com a internet e tente novamente.');
      // Keep previous data or set to default if loadError is triggered.
      setStats({
        activeOrders: 0,
        newOrders: 0,
        topProduct: { name: 'Carregando...', sales: 0 },
        activeCustomers: 0,
        newCustomers: 0,
        orderStatusData: [],
        dailyShowcaseRevenue: 0,
        dailyShowcaseItemsSold: 0,
        dailyTopProduct: 'N/A',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndSendReminders = async () => {
    try {
      const allReminders = await CustomerReminder.list();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const reminder of allReminders) {
        if (reminder.is_notified) continue;

        const reminderDate = new Date(reminder.reminder_date);
        reminderDate.setHours(0, 0, 0, 0);

        const advanceDays = reminder.advance_days || 7;
        const notificationDate = new Date(reminderDate.getTime() - (advanceDays * 24 * 60 * 60 * 1000));
        notificationDate.setHours(0, 0, 0, 0);

        if (today.getTime() === notificationDate.getTime()) {
          await sendReminderEmail(reminder);

          await CustomerReminder.update(reminder.id, {
            is_notified: true,
            notification_sent_date: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error);
    }
  };

  const sendReminderEmail = async (reminder) => {
    try {
      const eventTypeMap = {
        'aniversario': 'Aniversário',
        'casamento': 'Casamento',
        'formatura': 'Formatura',
        'reuniao': 'Reunião',
        'outro': 'Evento Especial'
      };

      const eventTypeName = eventTypeMap[reminder.reminder_type] || 'Evento';
      const eventDate = new Date(reminder.reminder_date).toLocaleDateString('pt-BR');

      const subject = `🎉 Lembrete da Lina Kamati: ${reminder.title} se aproxima!`;

      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; margin-bottom: 10px;">🎉 Lina Kamati</h1>
              <h2 style="color: #333; margin-bottom: 20px;">Lembrete Especial para Você!</h2>
            </div>

            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #f97316; margin: 0 0 10px 0;">${reminder.title}</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Tipo:</strong> ${eventTypeName}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Data:</strong> ${eventDate}</p>
              ${reminder.description ? `<p style="color: #666; margin: 10px 0 0 0;"><em>${reminder.description}</em></p>` : ''}
            </div>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h4 style="color: #0369a1; margin: 0 0 15px 0;">💡 Que tal tornar esta data ainda mais especial?</h4>
              <p style="color: #374151; margin-bottom: 15px;">
                Na Lina Kamati, criamos delícias personalizadas para momentos únicos como este.
                Entre em contato conosco para uma encomenda especial!
              </p>

              <div style="text-align: center;">
                <a href="tel:+244943480916" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 5px;">
                  📞 Ligar Agora
                </a>
                <a href="https://wa.me/244943480916" style="display: inline-block; background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 5px;">
                  💬 WhatsApp
                </a>
              </div>
            </div>

            ${reminder.notes ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #92400e; margin: 0;"><strong>Suas observações:</strong> ${reminder.notes}</p>
              </div>
            ` : ''}

            <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280;">
              <p style="margin: 5px 0;">✨ Obrigado por confiar na Lina Kamati!</p>
              <p style="margin: 5px 0; font-size: 14px;">
                Este lembrete foi enviado ${reminder.advance_days} dias antes da data programada.
              </p>
            </div>
          </div>
        </div>
      `;

      await SendEmail({
        to: reminder.customer_email,
        subject: subject,
        body: body,
        from_name: 'Lina Kamati'
      });

      // Criar notificação de sucesso
      await createNotification(
        'Lembrete Enviado',
        `Lembrete "${reminder.title}" enviado com sucesso para ${reminder.customer_email}`,
        'success',
        'customer',
        reminder.id
      );

      console.log(`Lembrete enviado para ${reminder.customer_email}: ${reminder.title}`);

    } catch (error) {
      console.error('Erro ao enviar lembrete por e-mail:', error);
      // Criar notificação de erro
      await createNotification(
        'Erro ao Enviar Lembrete',
        `Falha ao enviar lembrete "${reminder.title}" para ${reminder.customer_email}`,
        'error',
        'customer',
        reminder.id
      );
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log('Atualizando pedido:', orderId, 'para status:', newStatus);
      
      await Order.update(orderId, { status: newStatus });
      
      console.log('Status atualizado com sucesso');

      // Recarregar dados após atualização
      await loadDashboardData();

      // Lógica de envio de emails para status específicos
      if (newStatus === 'pronto') {
        try {
          const order = orders.find(o => o.id === orderId);
          if (order && order.customer_email) {
            const subject = `Lina Kamati: Seu pedido #${order.id.slice(-6)} está pronto!`;
            const body = `
              Olá, ${order.customer_name}!

              Temos uma ótima notícia! Seu pedido #${order.id.slice(-6)} da Lina Kamati está pronto.

              ${order.delivery_type === 'retirada'
                ? 'Você já pode vir retirá-lo em nossa loja.'
                : 'Ele já saiu para entrega e chegará em breve no seu endereço.'
              }

              Agradecemos a sua preferência!

              Atenciosamente,
              Equipe Lina Kamati
            `;

            await SendEmail({
              to: order.customer_email,
              subject: subject,
              body: body,
              from_name: 'Lina Kamati'
            });

            await createNotification(
              'Pedido Finalizado',
              `Pedido #${order.id.slice(-6)} marcado como pronto e cliente notificado`,
              'success',
              'order',
              orderId
            );
          }
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError);
        }

      } else if (newStatus === 'confirmado') {
        try {
          const order = orders.find(o => o.id === orderId);
          if (order && order.customer_email) {
            const subject = `Lina Kamati: Seu pedido #${order.id.slice(-6)} foi confirmado!`;
            const body = `
              Olá, ${order.customer_name}!

              Ótima notícia! Seu pedido de encomenda #${order.id.slice(-6)} na Lina Kamati foi confirmado com sucesso.

              Já estamos nos preparando para criar suas delícias com todo o carinho. Você será notificado novamente assim que seu pedido estiver pronto.

              Agradecemos a sua preferência!

              Atenciosamente,
              Equipe Lina Kamati
            `;

            await SendEmail({
              to: order.customer_email,
              subject: subject,
              body: body,
              from_name: 'Lina Kamati'
            });

            await createNotification(
              'Pedido Confirmado',
              `Pedido #${order.id.slice(-6)} confirmado e cliente notificado`,
              'success',
              'order',
              orderId
            );
          }
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError);
        }
      }

    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      alert('Não foi possível atualizar o status do pedido. Tente novamente.');
      
      await createNotification(
        'Erro ao Atualizar Pedido',
        `Falha ao atualizar status do pedido #${orderId.slice(-6)}`,
        'error',
        'order',
        orderId
      );
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const orderCode = order.id.slice(-6);
    const orderType = order.order_type === 'vitrine_diaria' ? 'da Vitrine Diária' : 'de Encomenda';
    
    const confirmMessage = `Tem certeza que deseja ELIMINAR permanentemente o pedido #${orderCode} ${orderType}?\n\nEsta ação não pode ser desfeita e todos os dados do pedido serão perdidos.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log('Eliminando pedido:', orderId);
        
        await Order.delete(orderId);
        
        console.log('Pedido eliminado com sucesso');

        // Recarregar dados após eliminação
        await loadDashboardData();

        // Criar notificação de eliminação
        await createNotification(
          'Pedido Eliminado',
          `Pedido #${orderCode} ${orderType} foi eliminado permanentemente`,
          'warning',
          'order',
          orderId
        );

        alert(`Pedido #${orderCode} eliminado com sucesso.`);

      } catch (error) {
        console.error('Erro ao eliminar pedido:', error);
        alert('Não foi possível eliminar o pedido. Tente novamente.');
        
        await createNotification(
          'Erro ao Eliminar Pedido',
          `Falha ao eliminar pedido #${orderCode} ${orderType}`,
          'error',
          'order',
          orderId
        );
      }
    }
  };

  const handlePrintOrder = (order) => {
    setOrderToPrint(order);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? A ação não pode ser desfeita.')) {
        try {
            await Product.delete(productId);
            await loadDashboardData();
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            alert('Não foi possível excluir o produto.');
        }
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e removerá todos os dados relacionados.')) {
        try {
            await User.delete(customerId);
            await loadDashboardData();
            alert('Cliente excluído com sucesso.');
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            alert('Não foi possível excluir o cliente.');
        }
    }
  };

  const handleProductFormSubmit = async (productData, imageFile) => {
    try {
        let finalData = { ...productData };

        if (imageFile) {
            const { file_url } = await UploadFile({ file: imageFile });
            finalData.image_url = file_url;
        }

        if (editingProduct) {
            await Product.update(editingProduct.id, finalData);
        } else {
            await Product.create(finalData);
        }

        setIsProductFormOpen(false);
        setEditingProduct(null);
        await loadDashboardData();
    } catch (error) {
        console.error("Erro ao salvar produto:", error);
        alert("Ocorreu um erro ao salvar o produto. Tente novamente.");
    }
  };

  const handlePublishProduct = async (productId, stock) => {
    try {
      await Product.update(productId, {
        published_today: true,
        published_date: new Date().toISOString(),
        daily_stock: stock
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao publicar produto:', error);
      alert('Não foi possível publicar o produto.');
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await Product.update(productId, { daily_stock: newStock });
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      alert('Não foi possível atualizar o estoque.');
    }
  };

  const handleRemoveFromToday = async (productId) => {
    if (window.confirm('Tem certeza que deseja remover este produto da vitrine diária?')) {
      try {
        await Product.update(productId, {
          published_today: false,
          daily_stock: 0
        });
        await loadDashboardData();
      } catch (error) {
        console.error('Erro ao remover produto da vitrine:', error);
        alert('Não foi possível remover o produto da vitrine diária.');
      }
    }
  };

  const handleUpdateDailyOrderStatus = async (orderId, newStatus) => {
    try {
      await Order.update(orderId, { status: newStatus });

      if (newStatus === 'pronto') {
        const order = await Order.get(orderId);
        const subject = `Lina Kamati: Seu pedido da Vitrine Diária está pronto!`;
        const body = `
          Olá, ${order.customer_name}!

          Seu pedido #${order.id.slice(-6)} da nossa Vitrine Diária já está pronto para ser retirado.

          Estamos te esperando!

          Atenciosamente,
          Equipe Lina Kamati
        `;

        await SendEmail({
          to: order.customer_email,
          subject: subject,
          body: body
        });
        alert(`E-mail de "Pedido Pronto" da Vitrine Diária enviado para ${order.customer_email}.`);
      }

      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao atualizar status do pedido da vitrine:', error);
      alert('Não foi possível atualizar o status do pedido da vitrine.');
    }
  };

  const handleExportReport = () => {
    if (orders.length === 0) {
      alert("Não há pedidos para exportar.");
      return;
    }

    const csvRows = [];
    const headers = ['ID Pedido', 'Data', 'Cliente', 'Email', 'Telefone', 'Tipo Pedido', 'Tipo Entrega', 'Status', 'Total Kz'];
    csvRows.push(headers.join(','));

    for (const order of orders) {
        const values = [
            order.id,
            new Date(order.created_date).toLocaleString('pt-BR'),
            `"${order.customer_name.replace(/"/g, '""')}"`,
            order.customer_email,
            order.customer_phone,
            order.order_type,
            order.delivery_type,
            order.status,
            order.total_amount.toFixed(2).replace('.', ',')
        ];
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_pedidos_doce_encanto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Verificar automaticamente por novos pedidos com melhor tratamento de erro
  const checkForNewOrders = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Usar timeout menor e tratamento de erro
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000) // 10 seconds timeout
      );

      const recentOrders = await Promise.race([
        Order.filter({ status: 'pendente' }, '-created_date', 10),
        timeoutPromise
      ]);

      const recentNotifications = await Promise.race([
        Notification.filter({ category: 'order', created_date__gt: oneHourAgo.toISOString() }, '-created_date'),
        timeoutPromise
      ]);

      const newOrdersToNotify = recentOrders.filter(order => {
        const orderCreatedDate = new Date(order.created_date);
        const alreadyNotified = recentNotifications.some(n => n.related_id === order.id);
        return orderCreatedDate > fiveMinutesAgo && !alreadyNotified;
      });

      for (const order of newOrdersToNotify) {
        await createNotification(
          'Novo Pedido Recebido',
          `Novo pedido #${order.id.slice(-6)} de ${order.customer_name} no valor de Kz ${order.total_amount.toFixed(2)}.`,
          'info',
          'order',
          order.id
        );
      }
    } catch (error) {
      // Log silencioso - não mostrar erro para o usuário constantemente
      console.log('Verificação de novos pedidos temporariamente indisponível');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  // NOVA LÓGICA: Exibir tela de erro se houver falha no carregamento
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg text-center shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center justify-center gap-3 text-xl">
              <AlertTriangle size={28} />
              Erro de Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{loadError}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={loadDashboardData}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (orderToPrint) {
    return (
      <PrintableOrder
        order={orderToPrint}
        onBack={() => setOrderToPrint(null)}
        siteConfig={siteConfig}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'dashboard' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'orders' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'products' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Produtos
                </button>
                <button
                  onClick={() => setActiveTab('vitrine')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'vitrine' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Vitrine Diária
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'customers' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Clientes
                </button>
                <button
                  onClick={() => setActiveTab('settings')} // Mapping 'config' to 'settings'
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'settings' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Configurações
                </button>
                <button
                  onClick={() => setActiveTab('domain')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'domain' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Domínio
                </button>
                <button
                  onClick={() => setActiveTab('sofia')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'sofia' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Bot className="w-4 h-4 mr-1" />
                  Sofia IA
                </button>
              </div>
            </div>
            {/* Added NotificationCenter and Export Button outside the sm:hidden block */}
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              todaySales={todaySales}
              weeklyTrends={weeklyTrends}
              onAddProduct={handleAddProduct}
              onTabChange={setActiveTab}
              onExportReport={handleExportReport}
            />
          )}

          {activeTab === 'vitrine' && (
            <DailyShowcase
              products={products}
              orders={orders}
              onPublishProduct={handlePublishProduct}
              onUpdateStock={handleUpdateStock}
              onRemoveFromToday={handleRemoveFromToday}
              onUpdateOrderStatus={handleUpdateDailyOrderStatus}
            />
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Gerir todos os pedidos de encomenda e vitrine diária
                </p>
              </div>
              <OrdersManagement
                orders={orders}
                onStatusChange={handleStatusChange}
                onDeleteOrder={handleDeleteOrder}
                onPrintOrder={setOrderToPrint}
              />
            </div>
          )}

          {activeTab === 'products' && (
            <ProductManagement
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'inventory' && <InventoryManagement />}

          {activeTab === 'learn' && <LearnManagement />}

          {activeTab === 'customers' && (
            <CustomerManagement
              customers={customers}
              orders={orders}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'coupons' && <CouponManagement />}

          {activeTab === 'messages' && <CustomerMessagesManagement />}

          {activeTab === 'reports' && (
            <ReportsDashboard
              allOrders={orders}
              allCustomers={customers}
              allMessages={messages}
            />
          )}

          {activeTab === 'archive' && <ReportArchiveComponent />}

          {activeTab === 'marketing' && <MarketingManagement />} {/* Assuming this is distinct from marketing-ai/sofia */}

          {activeTab === 'sofia' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sofia - Assistente IA de Marketing</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Consultora inteligente para análise de negócios e estratégias de crescimento
                </p>
              </div>
              <MarketingAI 
                orders={orders} 
                products={products} 
                customers={customers} 
                messages={messages} 
              />
            </div>
          )}

          {activeTab === 'api-docs' && <ApiDocs />}

          {activeTab === 'settings' && <SystemSettings />}

          {activeTab === 'site-settings' && <SiteConfigForm />}

          {activeTab === 'domain' && <DomainConfig />}

        </div>
      </main>

      <ProductForm
        open={isProductFormOpen}
        setOpen={setIsProductFormOpen}
        product={editingProduct}
        onSubmit={handleProductFormSubmit}
      />
    </div>
  );
}
