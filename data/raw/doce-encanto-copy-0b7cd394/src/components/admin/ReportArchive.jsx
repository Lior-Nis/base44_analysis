
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportArchive as ReportArchiveEntity, Goal, Order, User, CustomerMessage } from '@/api/entities';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Download, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  MessageSquare,
  Archive,
  FileText,
  Eye,
  RefreshCw,
  Target,
  BarChart3,
  Filter,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

// Componente para visualizar um relatório específico
function ReportViewer({ report, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  const getGoalProgress = (achieved, target) => {
    if (!target || target === 0) return 0;
    return Math.min((achieved / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Relatório Arquivado</h2>
          <p className="text-gray-600">
            {report.report_type === 'daily' && `Relatório Diário - ${format(new Date(report.report_date), 'dd/MM/yyyy', { locale: ptBR })}`}
            {report.report_type === 'weekly' && `Relatório Semanal - ${report.period_identifier}`}
            {report.report_type === 'monthly' && `Relatório Mensal - ${report.period_identifier}`}
            {report.report_type === 'annual' && `Relatório Anual - ${report.period_identifier}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Faturamento Total</p>
                <p className="text-xl font-bold">Kz {report.total_revenue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-xl font-bold">{report.total_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-xl font-bold">{report.active_customers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Feedback Total</p>
                <p className="text-xl font-bold">{(report.complaints_count || 0) + (report.suggestions_count || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Metas (se disponível) */}
      {report.goals_data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Performance vs Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Faturamento</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Encomendas:</span>
                    <span className="font-bold">
                      {getGoalProgress(report.goals_data.orders_revenue_achieved, report.goals_data.orders_revenue_target).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitrine:</span>
                    <span className="font-bold">
                      {getGoalProgress(report.goals_data.showcase_revenue_achieved, report.goals_data.showcase_revenue_target).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quantidade de Pedidos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Encomendas:</span>
                    <span className="font-bold">
                      {getGoalProgress(report.goals_data.orders_count_achieved, report.goals_data.orders_count_target).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitrine:</span>
                    <span className="font-bold">
                      {getGoalProgress(report.goals_data.showcase_count_achieved, report.goals_data.showcase_count_target).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Produtos e Clientes Top */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.top_products?.slice(0, 5).map((product, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{product.name}</span>
                  <Badge>{product.quantity} vendidos</Badge>
                </div>
              )) || <p className="text-gray-500">Dados não disponíveis</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Melhores Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.top_customers?.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{customer.name}</span>
                  <Badge>Kz {customer.total_spent?.toFixed(2)}</Badge>
                </div>
              )) || <p className="text-gray-500">Dados não disponíveis</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback dos Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-700">Reclamações</h4>
              <p className="text-2xl font-bold text-red-600">{report.complaints_count || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700">Sugestões</h4>
              <p className="text-2xl font-bold text-green-600">{report.suggestions_count || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal do arquivo de relatórios
export default function ReportArchiveComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [archivedReports, setArchivedReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('custom');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingMissing, setIsGeneratingMissing] = useState(false);

  useEffect(() => {
    loadArchivedReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [selectedDate, archivedReports, reportType, dateRange, searchTerm]);

  const loadArchivedReports = async () => {
    try {
      const reports = await ReportArchiveEntity.list('-report_date');
      setArchivedReports(reports);
    } catch (error) {
      console.error('Erro ao carregar relatórios arquivados:', error);
    }
  };

  const filterReports = () => {
    let filtered = [...archivedReports];

    // Filtrar por tipo de relatório
    if (reportType !== 'all') {
      filtered = filtered.filter(report => report.report_type === reportType);
    }

    // Filtrar por data/período
    if (dateRange === 'custom') {
      const selected = new Date(selectedDate);
      if (reportType === 'daily' || reportType === 'all') {
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.report_date);
          return reportDate.toDateString() === selected.toDateString();
        });
      } else if (reportType === 'weekly') {
        const weekStart = startOfWeek(selected);
        const weekEnd = endOfWeek(selected);
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.report_date);
          return reportDate >= weekStart && reportDate <= weekEnd;
        });
      } else if (reportType === 'monthly') {
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.report_date);
          return reportDate.getMonth() === selected.getMonth() && 
                 reportDate.getFullYear() === selected.getFullYear();
        });
      }
    } else if (dateRange === 'last_week') {
      const lastWeek = subDays(new Date(), 7);
      filtered = filtered.filter(report => new Date(report.report_date) >= lastWeek);
    } else if (dateRange === 'last_month') {
      const lastMonth = subDays(new Date(), 30);
      filtered = filtered.filter(report => new Date(report.report_date) >= lastMonth);
    } else if (dateRange === 'last_year') {
      const lastYear = subDays(new Date(), 365);
      filtered = filtered.filter(report => new Date(report.report_date) >= lastYear);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.period_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.report_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const generateMissingReports = async () => {
    setIsGeneratingMissing(true);
    
    try {
      // Esta função criará relatórios automaticamente para períodos em falta
      // Em uma implementação real, isso seria executado por um job em background
      
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      
      // Buscar dados dos últimos 30 dias para gerar relatórios em falta
      const [allOrders, allCustomers, allMessages] = await Promise.all([
        Order.list('-created_date', 1000),
        User.list(),
        CustomerMessage.list('-created_date', 1000)
      ]);

      let generatedCount = 0;

      // Gerar relatórios diários em falta dos últimos 30 dias
      for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        
        // Verificar se já existe relatório para este dia
        const existingReport = archivedReports.find(r => 
          r.report_type === 'daily' && r.period_identifier === dateStr
        );
        
        if (!existingReport) {
          const reportData = await generateReportData(d, 'daily', allOrders, allCustomers, allMessages);
          if (reportData.total_orders > 0 || reportData.total_revenue > 0) {
            await ReportArchiveEntity.create(reportData);
            generatedCount++;
          }
        }
      }

      alert(`${generatedCount} relatórios foram gerados automaticamente!`);
      loadArchivedReports();
      
    } catch (error) {
      console.error('Erro ao gerar relatórios automáticos:', error);
      alert('Erro ao gerar relatórios automáticos.');
    } finally {
      setIsGeneratingMissing(false);
    }
  };

  const generateReportData = async (date, type, allOrders, allCustomers, allMessages) => {
    let startDate, endDate, periodId;
    
    switch (type) {
      case 'daily':
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        periodId = format(date, 'yyyy-MM-dd');
        break;
      case 'weekly':
        startDate = startOfWeek(date);
        endDate = endOfWeek(date);
        periodId = `${date.getFullYear()}-W${format(date, 'II')}`;
        break;
      case 'monthly':
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        periodId = `${date.getFullYear()}-M${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'annual':
        startDate = startOfYear(date);
        endDate = endOfYear(date);
        periodId = `${date.getFullYear()}`;
        break;
    }

    // Filtrar dados pelo período
    const periodOrders = allOrders.filter(o => {
      const orderDate = new Date(o.created_date);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const periodCustomers = allCustomers.filter(c => {
      const customerDate = new Date(c.created_date);
      return customerDate >= startDate && customerDate <= endDate;
    });

    const periodMessages = allMessages.filter(m => {
      const messageDate = new Date(m.created_date);
      return messageDate >= startDate && messageDate <= endDate;
    });

    // Calcular métricas
    const showcaseOrders = periodOrders.filter(o => o.order_type === 'vitrine_diaria');
    const customOrders = periodOrders.filter(o => o.order_type === 'encomenda');

    const showcaseRevenue = showcaseOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const ordersRevenue = customOrders.reduce((sum, o) => sum + o.total_amount, 0);

    // Produtos mais vendidos
    const productSales = periodOrders.flatMap(o => o.items).reduce((acc, item) => {
      acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity;
      return acc;
    }, {});
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, quantity]) => ({ name, quantity }));

    // Clientes que mais compraram
    const customerSpend = periodOrders.reduce((acc, order) => {
      acc[order.customer_name] = (acc[order.customer_name] || 0) + order.total_amount;
      return acc;
    }, {});
    const topCustomers = Object.entries(customerSpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total_spent]) => ({ name, total_spent }));

    // Feedback
    const complaints = periodMessages.filter(m => m.message_type === 'reclamacao');
    const suggestions = periodMessages.filter(m => m.message_type === 'sugestao');

    return {
      report_date: date.toISOString().split('T')[0],
      report_type: type,
      period_identifier: periodId,
      total_revenue: showcaseRevenue + ordersRevenue,
      orders_revenue: ordersRevenue,
      showcase_revenue: showcaseRevenue,
      total_orders: periodOrders.length,
      orders_count: customOrders.length,
      showcase_count: showcaseOrders.length,
      active_customers: new Set(periodOrders.map(o => o.customer_email)).size,
      new_customers: periodCustomers.length,
      top_products: topProducts,
      top_customers: topCustomers,
      complaints_count: complaints.length,
      suggestions_count: suggestions.length
    };
  };

  const exportCSV = () => {
    if (filteredReports.length === 0) {
      alert("Nenhum relatório para exportar.");
      return;
    }

    const csvRows = [];
    const headers = ['Data', 'Tipo', 'Período', 'Faturamento Total', 'Pedidos Total', 'Clientes Ativos', 'Novos Clientes'];
    csvRows.push(headers.join(','));

    filteredReports.forEach(report => {
      const values = [
        format(new Date(report.report_date), 'dd/MM/yyyy'),
        report.report_type,
        report.period_identifier,
        `"Kz ${(report.total_revenue || 0).toFixed(2)}"`,
        report.total_orders || 0,
        report.active_customers || 0,
        report.new_customers || 0
      ];
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_historico_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedReport) {
    return <ReportViewer report={selectedReport} onClose={() => setSelectedReport(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="w-6 h-6 text-blue-500" />
            Arquivo de Relatórios Históricos
          </h2>
          <p className="text-gray-600">
            {archivedReports.length} relatórios arquivados - Sistema de geração automática ativo
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateMissingReports}
            disabled={isGeneratingMissing}
          >
            {isGeneratingMissing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            Gerar Relatórios Pendentes
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros Avançados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="daily">Diários</option>
                <option value="weekly">Semanais</option>
                <option value="monthly">Mensais</option>
                <option value="annual">Anuais</option>
                <option value="all">Todos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="custom">Data Específica</option>
                <option value="last_week">Última Semana</option>
                <option value="last_month">Último Mês</option>
                <option value="last_year">Último Ano</option>
                <option value="all">Todos os Períodos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por período..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {dateRange === 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatórios Encontrados ({filteredReports.length})
            </span>
            {filteredReports.length > 0 && (
              <Badge variant="outline">
                {dateRange === 'custom' 
                  ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
                  : dateRange
                }
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredReports.map(report => (
              <div 
                key={report.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">
                      {report.report_type === 'daily' && '📊 Relatório Diário'}
                      {report.report_type === 'weekly' && '📈 Relatório Semanal'}
                      {report.report_type === 'monthly' && '📅 Relatório Mensal'}
                      {report.report_type === 'annual' && '🗓️ Relatório Anual'}
                    </h4>
                    <p className="text-sm text-gray-600">{report.period_identifier}</p>
                    <p className="text-xs text-gray-500">
                      Gerado automaticamente em: {format(new Date(report.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      {report.report_type}
                    </Badge>
                    <p className="text-sm font-semibold text-green-600">Kz {report.total_revenue?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-600">{report.total_orders || 0} pedidos</p>
                    <p className="text-xs text-gray-600">{report.active_customers || 0} clientes</p>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReport(report);
                  }}>
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    // Implementar download individual do relatório
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredReports.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum relatório encontrado</p>
                <p className="text-sm">
                  {reportType === 'all' 
                    ? 'Ajuste os filtros ou gere relatórios automáticos'
                    : `Nenhum relatório ${reportType} para o período selecionado`
                  }
                </p>
                <Button 
                  className="mt-4" 
                  onClick={generateMissingReports}
                  disabled={isGeneratingMissing}
                >
                  {isGeneratingMissing ? 'Gerando...' : 'Gerar Relatórios Automáticos'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Arquivo */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Arquivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-700">Total de Relatórios</h4>
              <p className="text-2xl font-bold text-blue-600">{archivedReports.length}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700">Relatórios Diários</h4>
              <p className="text-2xl font-bold text-green-600">
                {archivedReports.filter(r => r.report_type === 'daily').length}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-700">Relatórios Mensais</h4>
              <p className="text-2xl font-bold text-purple-600">
                {archivedReports.filter(r => r.report_type === 'monthly').length}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-700">Período Coberto</h4>
              <p className="text-2xl font-bold text-orange-600">
                {archivedReports.length > 0 
                  ? Math.floor((new Date() - new Date(Math.min(...archivedReports.map(r => new Date(r.report_date))))) / (365 * 24 * 60 * 60 * 1000))
                  : 0
                } anos
              </p>
            </div>
          </div>

          {/* Mini Gráfico de Tendência */}
          {archivedReports.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Tendência de Faturamento (Últimos 30 dias)</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={
                    archivedReports
                      .filter(r => r.report_type === 'daily')
                      .filter(r => (new Date() - new Date(r.report_date)) / (1000 * 60 * 60 * 24) <= 30)
                      .sort((a, b) => new Date(a.report_date) - new Date(b.report_date))
                      .slice(-30)
                      .map(r => ({
                        date: format(new Date(r.report_date), 'dd/MM'),
                        revenue: r.total_revenue || 0
                      }))
                  }>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [`Kz ${value.toFixed(2)}`, 'Faturamento']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#f97316" 
                      fill="#f97316" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
