
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { getWeek, getMonth, getYear, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Goal } from '@/api/entities';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Printer, Users, ShoppingCart, MessageSquare, Star, CheckCircle, AlertTriangle, AlertCircle, Lightbulb, Trophy } from 'lucide-react';

// --- Sub-componente para Definir Metas ---
function GoalSetter({ periodIdentifier, periodType, onGoalUpdate }) {
  const [goals, setGoals] = useState({
    orders_revenue_target: 0,
    orders_count_target: 0,
    showcase_revenue_target: 0,
    showcase_count_target: 0,
  });
  const [goalId, setGoalId] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      const existingGoals = await Goal.filter({ period_identifier: periodIdentifier });
      if (existingGoals.length > 0) {
        setGoals(existingGoals[0]);
        setGoalId(existingGoals[0].id);
      } else {
        setGoals({
          orders_revenue_target: 0,
          orders_count_target: 0,
          showcase_revenue_target: 0,
          showcase_count_target: 0,
        });
        setGoalId(null);
      }
    };
    fetchGoals();
  }, [periodIdentifier]);

  const handleSave = async () => {
    const dataToSave = { ...goals, period_type: periodType, period_identifier: periodIdentifier };
    if (goalId) {
      await Goal.update(goalId, dataToSave);
    } else {
      await Goal.create(dataToSave);
    }
    alert('Metas salvas!');
    onGoalUpdate();
  };

  const handleChange = (e) => {
    setGoals({ ...goals, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Definir Metas para {periodType === 'weekly' ? 'a Semana' : 'o Mês'}</CardTitle>
        <CardDescription>{periodIdentifier}</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Faturamento Encomendas (Kz)</Label>
          <Input name="orders_revenue_target" type="number" value={goals.orders_revenue_target} onChange={handleChange} />
        </div>
        <div>
          <Label>Nº Pedidos Encomendas</Label>
          <Input name="orders_count_target" type="number" value={goals.orders_count_target} onChange={handleChange} />
        </div>
        <div>
          <Label>Faturamento Vitrine (Kz)</Label>
          <Input name="showcase_revenue_target" type="number" value={goals.showcase_revenue_target} onChange={handleChange} />
        </div>
        <div>
          <Label>Nº Pedidos Vitrine</Label>
          <Input name="showcase_count_target" type="number" value={goals.showcase_count_target} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <Button onClick={handleSave} className="w-full">Salvar Metas</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Componente de Progresso das Metas MELHORADO ---
function GoalsProgress({ goals, actualData, periodType }) {
  const getProgressPercentage = (actual, target) => {
    if (!target || target === 0) return 0;
    return Math.min((actual / target) * 100, 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (percentage >= 75) return <TrendingUp className="w-5 h-5 text-blue-500" />;
    if (percentage >= 50) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusMessage = (percentage, metricName) => {
    if (percentage >= 100) return `🎉 Meta de ${metricName} ATINGIDA! Parabéns!`;
    if (percentage >= 90) return `🔥 Quase lá! Faltam apenas ${(100 - percentage).toFixed(0)}% para atingir a meta de ${metricName}`;
    if (percentage >= 75) return `💪 Bom progresso em ${metricName}! Continue assim!`;
    if (percentage >= 50) return `⚠️ Meta de ${metricName} precisa de atenção`;
    return `🚨 Meta de ${metricName} requer ação urgente`;
  };

  const chartData = [
    {
      name: 'Faturamento Encomendas',
      meta: goals.orders_revenue_target || 0,
      atual: actualData.ordersRevenue || 0,
      percentage: getProgressPercentage(actualData.ordersRevenue, goals.orders_revenue_target),
      shortName: 'Fat. Encomendas'
    },
    {
      name: 'Pedidos Encomendas',
      meta: goals.orders_count_target || 0,
      atual: actualData.ordersCount || 0,
      percentage: getProgressPercentage(actualData.ordersCount, goals.orders_count_target),
      shortName: 'Qtd. Encomendas'
    },
    {
      name: 'Faturamento Vitrine',
      meta: goals.showcase_revenue_target || 0,
      atual: actualData.showcaseRevenue || 0,
      percentage: getProgressPercentage(actualData.showcaseRevenue, goals.showcase_revenue_target),
      shortName: 'Fat. Vitrine'
    },
    {
      name: 'Pedidos Vitrine',
      meta: goals.showcase_count_target || 0,
      atual: actualData.showcaseCount || 0,
      percentage: getProgressPercentage(actualData.showcaseCount, goals.showcase_count_target),
      shortName: 'Qtd. Vitrine'
    }
  ];

  // Calcular performance geral
  const overallProgress = chartData.reduce((sum, item) => sum + item.percentage, 0) / chartData.length;
  const metasAtingidas = chartData.filter(item => item.percentage >= 100).length;
  const metasEmRisco = chartData.filter(item => item.percentage < 50).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Progresso das Metas {periodType === 'weekly' ? 'Semanais' : 'Mensais'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Resumo Geral das Metas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-700">Performance Geral</h4>
              <p className="text-3xl font-bold text-blue-600">{overallProgress.toFixed(0)}%</p>
              <p className="text-sm text-blue-600">das metas</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <h4 className="font-semibold text-green-700">Metas Atingidas</h4>
              <p className="text-3xl font-bold text-green-600">{metasAtingidas}</p>
              <p className="text-sm text-green-600">de {chartData.length} metas</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
              <h4 className="font-semibold text-yellow-700">Em Progresso</h4>
              <p className="text-3xl font-bold text-yellow-600">{chartData.filter(item => item.percentage >= 50 && item.percentage < 100).length}</p>
              <p className="text-sm text-yellow-600">metas</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <h4 className="font-semibold text-red-700">Precisam Atenção</h4>
              <p className="text-3xl font-bold text-red-600">{metasEmRisco}</p>
              <p className="text-sm text-red-600">metas em risco</p>
            </div>
          </div>

          {/* Alertas e Recomendações */}
          <div className="mb-6 space-y-3">
            {chartData.map((item, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 ${
                  item.percentage >= 100 
                    ? 'bg-green-50 border-green-500' 
                    : item.percentage >= 75
                    ? 'bg-blue-50 border-blue-500'
                    : item.percentage >= 50 
                    ? 'bg-yellow-50 border-yellow-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.percentage)}
                    <div>
                      <h5 className="font-medium">{item.name}</h5>
                      <p className="text-sm text-gray-600">
                        {getStatusMessage(item.percentage, item.shortName)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getStatusColor(item.percentage)}`}>
                      {item.percentage.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.name.includes('Faturamento') 
                        ? `Kz ${item.atual.toFixed(0)} / Kz ${item.meta.toFixed(0)}`
                        : `${item.atual} / ${item.meta}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Barras de Progresso Detalhadas */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {chartData.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-sm font-bold ${getStatusColor(item.percentage)}`}>
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      item.percentage >= 100 
                        ? 'bg-gradient-to-r from-green-500 to-green-600' 
                        : item.percentage >= 75
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : item.percentage >= 50 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Atual: {item.name.includes('Faturamento') ? `Kz ${item.atual.toFixed(2)}` : item.atual}</span>
                  <span>Meta: {item.name.includes('Faturamento') ? `Kz ${item.meta.toFixed(2)}` : item.meta}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Faltam: {item.name.includes('Faturamento') 
                    ? `Kz ${Math.max(0, item.meta - item.atual).toFixed(2)}` 
                    : Math.max(0, item.meta - item.atual)
                  } para atingir a meta
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico de Comparação */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="shortName" 
                  tick={{ fontSize: 12 }} 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [
                    name.includes('Faturamento') ? `Kz ${value.toFixed(2)}` : value,
                    name === 'meta' ? 'Meta' : 'Atual'
                  ]}
                />
                <Legend />
                <Bar dataKey="atual" fill="#f97316" name="Atual" />
                <Bar dataKey="meta" fill="#e5e7eb" name="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Plano de Ação */}
          <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Plano de Ação Recomendado
            </h4>
            <div className="space-y-3">
              {overallProgress >= 90 && (
                <p className="text-orange-800">🎯 <strong>Foco na Sprint Final:</strong> Você está muito próximo! Mantenha o ritmo e execute as estratégias que estão funcionando.</p>
              )}
              {overallProgress >= 75 && overallProgress < 90 && (
                <p className="text-orange-800">💪 <strong>Acelere o Ritmo:</strong> Bom progresso! Identifique gargalos e otimize os processos que estão funcionando bem.</p>
              )}
              {overallProgress >= 50 && overallProgress < 75 && (
                <p className="text-orange-800">⚡ <strong>Ação Necessária:</strong> Revise sua estratégia e intensifique os esforços nas áreas com melhor performance.</p>
              )}
              {overallProgress < 50 && (
                <p className="text-orange-800">🚨 <strong>Mudança de Estratégia:</strong> É hora de repensar a abordagem. Considere ajustar as metas ou modificar completamente a estratégia.</p>
              )}
              
              {metasEmRisco > 0 && (
                <p className="text-orange-800">📢 <strong>Metas em Risco:</strong> {metasEmRisco} meta(s) precisam de atenção imediata. Priorize ações para essas áreas.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Componente Principal dos Relatórios ---
export default function ReportsDashboard({ allOrders, allCustomers, allMessages }) {
  const [period, setPeriod] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [goals, setGoals] = useState({});
  const [actualData, setActualData] = useState({});

  // Adicionar função para calcular previsão de cumprimento
  const calculateGoalProjection = (currentValue, targetValue, daysElapsed, totalDays) => {
    if (daysElapsed === 0 || targetValue === 0) return 0;
    const dailyAverage = currentValue / daysElapsed;
    const projectedTotal = dailyAverage * totalDays;
    return Math.min((projectedTotal / targetValue) * 100, 150); // Máximo 150% para mostrar superação
  };

  const processReportData = async () => {
    const now = new Date();
    let startDate, endDate, periodId;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        periodId = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        periodId = `${getYear(new Date())}-W${getWeek(new Date(), { weekStartsOn: 1 })}`;
        break;
      case 'annual':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        periodId = `${getYear(new Date())}`;
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        periodId = `${getYear(new Date())}-M${String(getMonth(new Date()) + 1).padStart(2, '0')}`;
        break;
    }

    // Filtrar dados pelo período
    const periodOrders = allOrders.filter(o => new Date(o.created_date) >= startDate && new Date(o.created_date) <= endDate);
    const periodCustomers = allCustomers.filter(c => new Date(c.created_date) >= startDate && new Date(c.created_date) <= endDate);
    const periodMessages = allMessages.filter(m => new Date(m.created_date) >= startDate && new Date(m.created_date) <= endDate);
    
    // Processar dados
    const showcaseOrders = periodOrders.filter(o => o.order_type === 'vitrine_diaria');
    const customOrders = periodOrders.filter(o => o.order_type === 'encomenda');

    const showcaseRevenue = showcaseOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const ordersRevenue = customOrders.reduce((sum, o) => sum + o.total_amount, 0);

    const productSales = periodOrders.flatMap(o => o.items).reduce((acc, item) => {
        acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity;
        return acc;
    }, {});
    const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const customerSpend = periodOrders.reduce((acc, order) => {
        acc[order.customer_name] = (acc[order.customer_name] || 0) + order.total_amount;
        return acc;
    }, {});
    const topCustomers = Object.entries(customerSpend).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    const complaints = periodMessages.filter(m => m.message_type === 'reclamacao');
    const suggestions = periodMessages.filter(m => m.message_type === 'sugestao');

    // Buscar metas para o período atual
    let currentGoals = {};
    if (period === 'weekly' || period === 'monthly') {
      const goalResults = await Goal.filter({ period_identifier: periodId });
      if (goalResults.length > 0) {
        currentGoals = goalResults[0];
      }
    }

    const currentActualData = {
      ordersRevenue,
      ordersCount: customOrders.length,
      showcaseRevenue,
      showcaseCount: showcaseOrders.length
    };

    setGoals(currentGoals);
    setActualData(currentActualData);

    setReportData({
      periodLabel: `${format(startDate, 'dd/MM/yy', {locale: ptBR})} - ${format(endDate, 'dd/MM/yy', {locale: ptBR})}`,
      activeCustomers: new Set(periodOrders.map(o => o.customer_email)).size,
      newCustomers: periodCustomers.length,
      totalRevenue: showcaseRevenue + ordersRevenue,
      showcaseStats: { revenue: showcaseRevenue, count: showcaseOrders.length },
      orderStats: { revenue: ordersRevenue, count: customOrders.length },
      topProducts,
      topCustomers,
      complaints,
      suggestions
    });
  };

  useEffect(() => {
    processReportData();
  }, [period, allOrders, allCustomers, allMessages]);
  
  const handlePrint = () => {
    window.print();
  };

  const now = new Date();
  const weeklyId = `${getYear(now)}-W${getWeek(now, { weekStartsOn: 1 })}`;
  const monthlyId = `${getYear(now)}-M${String(getMonth(now) + 1).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Definição de Metas */}
      <div className="grid md:grid-cols-2 gap-6 no-print">
        <GoalSetter periodIdentifier={weeklyId} periodType="weekly" onGoalUpdate={processReportData} />
        <GoalSetter periodIdentifier={monthlyId} periodType="monthly" onGoalUpdate={processReportData} />
      </div>

      {/* Progresso das Metas MELHORADO */}
      {(period === 'weekly' || period === 'monthly') && Object.keys(goals).length > 0 && (
        <div className="no-print">
          <GoalsProgress 
            goals={goals} 
            actualData={actualData} 
            periodType={period} 
          />
        </div>
      )}

      {/* Dashboard de Alerta Rápido */}
      {(period === 'weekly' || period === 'monthly') && Object.keys(goals).length > 0 && (
        <Card className="no-print border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Trophy className="w-5 h-5" />
              Status das Metas - Visão Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-orange-900">✅ Metas no Caminho Certo:</h4>
                <div className="space-y-2">
                  {Object.entries(actualData).map(([key, value]) => {
                    const targetKey = key.replace('Revenue', '_revenue_target').replace('Count', '_count_target');
                    const target = goals[targetKey] || 0;
                    const percentage = target > 0 ? (value / target) * 100 : 0;
                    
                    if (percentage >= 75) {
                      return (
                        <div key={key} className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">
                            {key.includes('Revenue') ? 'Faturamento' : 'Pedidos'} 
                            {key.includes('orders') ? ' Encomendas' : ' Vitrine'}: {percentage.toFixed(0)}%
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-orange-900">⚠️ Metas que Precisam de Atenção:</h4>
                <div className="space-y-2">
                  {Object.entries(actualData).map(([key, value]) => {
                    const targetKey = key.replace('Revenue', '_revenue_target').replace('Count', '_count_target');
                    const target = goals[targetKey] || 0;
                    const percentage = target > 0 ? (value / target) * 100 : 0;
                    
                    if (percentage < 75) {
                      return (
                        <div key={key} className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">
                            {key.includes('Revenue') ? 'Faturamento' : 'Pedidos'} 
                            {key.includes('orders') ? ' Encomendas' : ' Vitrine'}: {percentage.toFixed(0)}%
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório Detalhado */}
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center no-print">
              <div>
                <CardTitle>Relatório de Performance</CardTitle>
                <CardDescription>Análise detalhada do período selecionado.</CardDescription>
              </div>
              <div className="flex gap-2">
                  <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded-md px-3 py-2">
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="annual">Anual</option>
                  </select>
                  <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Exportar para PDF</Button>
              </div>
            </div>
            <div className="print-only" style={{display: 'none', padding: '2rem'}}>
                <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: '#f97316'}}>Doce Encanto - Relatório de Performance</h1>
                <p style={{fontSize: '1.2rem', color: '#555'}}>Período: {reportData?.periodLabel}</p>
                <p style={{fontSize: '1rem', color: '#777'}}>Gerado em: {format(new Date(), 'dd/MM/yyyy HH:mm', {locale: ptBR})}</p>
            </div>
        </CardHeader>
        <CardContent>
          {reportData ? (
            <div className="space-y-8 report-content">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Faturamento Total</p>
                    <p className="text-2xl font-bold">Kz {reportData.totalRevenue.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Total de Pedidos</p>
                    <p className="text-2xl font-bold">{reportData.showcaseStats.count + reportData.orderStats.count}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Clientes Ativos</p>
                    <p className="text-2xl font-bold">{reportData.activeCustomers}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Novos Clientes</p>
                    <p className="text-2xl font-bold">{reportData.newCustomers}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabelas de Topo */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Star className="text-yellow-500" /> Produtos Mais Vendidos</h3>
                  <ul className="space-y-2">
                    {reportData.topProducts.map(([name, count]) => (
                      <li key={name} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{name}</span>
                        <span className="font-bold">{count} un.</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Users className="text-blue-500" /> Clientes que Mais Compraram</h3>
                   <ul className="space-y-2">
                    {reportData.topCustomers.map(([name, value]) => (
                      <li key={name} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{name}</span>
                        <span className="font-bold">Kz {value.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feedback */}
               <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="text-purple-500" /> Feedback dos Clientes</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Reclamações ({reportData.complaints.length})</h4>
                      <div className="space-y-2 text-sm">
                        {reportData.complaints.map(m => (
                          <p key={m.id} className="p-2 border rounded bg-red-50">"{m.message}" - <em>{m.customer_name}</em></p>
                        ))}
                      </div>
                    </div>
                     <div>
                      <h4 className="font-medium text-green-600 mb-2">Sugestões ({reportData.suggestions.length})</h4>
                      <div className="space-y-2 text-sm">
                        {reportData.suggestions.map(m => (
                          <p key={m.id} className="p-2 border rounded bg-green-50">"{m.message}" - <em>{m.customer_name}</em></p>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <p>Carregando dados do relatório...</p>
          )}
        </CardContent>
      </Card>
       <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only {
                display: block !important;
            }
            .report-content, .report-content * {
              visibility: visible;
            }
            .report-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
      `}</style>
    </div>
  );
}
