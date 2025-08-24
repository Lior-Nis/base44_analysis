import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Aula,
  LearnEvent,
  LearnLive,
  LearnPDF,
  EventRegistration,
  IndividualClassRequest,
  LearnAccess
} from '@/api/entities';
import { UploadFile, SendEmail } from '@/api/integrations';
import {
  Video,
  Calendar,
  Wifi,
  FileText,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Key,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  Bell,
  Filter,
  Search,
  Upload,
  Play,
  Pause,
  Settings,
  Shield,
  Award,
  BookOpen,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  AlertTriangle,
  Star,
  BarChart3,
  SkipForward,
  Lock,
  Plus,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Import components
import StreamingStudio from './streaming/StreamingStudio';
import StreamingInfrastructure from './streaming/StreamingInfrastructure';

// Aulas Management Component
function AulasManagement() {
  const [aulas, setAulas] = useState([]);
  const [filteredAulas, setFilteredAulas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAulaForm, setShowAulaForm] = useState(false);
  const [editingAula, setEditingAula] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    loadAulas();
  }, []);

  useEffect(() => {
    filterAulas();
  }, [aulas, searchTerm, categoryFilter, levelFilter]);

  const loadAulas = async () => {
    setIsLoading(true);
    try {
      const data = await Aula.list('-created_date');
      setAulas(data);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAulas = () => {
    let filtered = aulas;

    if (searchTerm) {
      filtered = filtered.filter(aula =>
        aula.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (aula.description && aula.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(aula => aula.category === categoryFilter);
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(aula => aula.level === levelFilter);
    }

    setFilteredAulas(filtered);
  };

  const handleSubmitAula = async (aulaData) => {
    try {
      if (editingAula) {
        await Aula.update(editingAula.id, aulaData);
      } else {
        await Aula.create(aulaData);
      }

      setShowAulaForm(false);
      setEditingAula(null);
      await loadAulas();
      alert('Aula salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
      alert('Erro ao salvar aula. Tente novamente.');
    }
  };

  const handleEditAula = (aula) => {
    setEditingAula(aula);
    setShowAulaForm(true);
  };

  const handleDeleteAula = async (aulaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.')) {
      try {
        await Aula.delete(aulaId);
        await loadAulas();
        alert('Aula excluída com sucesso.');
      } catch (error) {
        console.error('Erro ao excluir aula:', error);
        alert('Erro ao excluir aula.');
      }
    }
  };

  const handleAddAula = () => {
    setEditingAula(null);
    setShowAulaForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2">Carregando aulas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1 flex-wrap">
          <div className="relative flex-1 max-w-md min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar aulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              <SelectItem value="Técnicas Básicas">Técnicas Básicas</SelectItem>
              <SelectItem value="Bolos">Bolos</SelectItem>
              <SelectItem value="Doces Finos">Doces Finos</SelectItem>
              <SelectItem value="Salgados">Salgados</SelectItem>
              <SelectItem value="Decoração">Decoração</SelectItem>
              <SelectItem value="Recursos Educacionais">Recursos Educacionais</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Iniciante">Iniciante</SelectItem>
              <SelectItem value="Intermediário">Intermediário</SelectItem>
              <SelectItem value="Avançado">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAddAula} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Aula
        </Button>
      </div>

      {/* Lista de Aulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAulas.map((aula) => (
          <Card key={aula.id} className="group hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
              {aula.thumbnail_url ? (
                <img
                  src={aula.thumbnail_url}
                  alt={aula.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                  <Video className="w-16 h-16 text-orange-400" />
                </div>
              )}
              
              <div className="absolute top-2 right-2">
                {aula.is_free ? (
                  <Badge className="bg-green-500 text-white">GRÁTIS</Badge>
                ) : (
                  <Badge className="bg-orange-500 text-white">R$ {aula.price?.toFixed(2)}</Badge>
                )}
              </div>

              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex justify-between">
                  <span>{aula.duration_minutes} min</span>
                  <span>{aula.views || 0} views</span>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate flex-1">{aula.title}</h3>
                {aula.category && (
                  <Badge variant="outline" className="text-xs ml-2">{aula.category}</Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {aula.description}
              </p>

              {aula.level && (
                <div className="mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {aula.level}
                  </Badge>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEditAula(aula)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                {aula.video_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(aula.video_url, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDeleteAula(aula.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAulas.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all' 
              ? 'Nenhuma aula encontrada' 
              : 'Nenhuma aula adicionada ainda'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando sua primeira aula em vídeo'
            }
          </p>
          {(!searchTerm && categoryFilter === 'all' && levelFilter === 'all') && (
            <Button onClick={handleAddAula} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Aula
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Lives Management Component (mantém estrutura existente)
function LivesManagement({ lives, onRefresh, openStreamingStudio }) {
  const [isLiveFormOpen, setIsLiveFormOpen] = useState(false);
  const [editingLive, setEditingLive] = useState(null);
  const [accessRequests, setAccessRequests] = useState([]);

  const loadAccessRequests = useCallback(async () => {
    try {
      const requests = await LearnAccess.filter({ content_type: 'live' });
      setAccessRequests(requests);
    } catch (error) {
      console.error('Erro ao carregar solicitações de acesso:', error);
    }
  }, []);

  useEffect(() => {
    loadAccessRequests();
  }, [loadAccessRequests]);

  const handleCreateLive = () => {
    setEditingLive(null);
    setIsLiveFormOpen(true);
  };

  const handleEditLive = (live) => {
    setEditingLive(live);
    setIsLiveFormOpen(true);
  };

  const handleSubmitLive = async (liveData) => {
    try {
      if (editingLive) {
        await LearnLive.update(editingLive.id, liveData);
      } else {
        await LearnLive.create(liveData);
      }
      setIsLiveFormOpen(false);
      setEditingLive(null);
      onRefresh();
    } catch (error) {
      console.error('Erro ao salvar live:', error);
      alert('Erro ao salvar live. Tente novamente.');
    }
  };

  const handleDeleteLive = async (liveId) => {
    if (window.confirm('Tem certeza que deseja excluir esta live?')) {
      try {
        await LearnLive.delete(liveId);
        onRefresh();
      } catch (error) {
        console.error('Erro ao excluir live:', error);
        alert('Erro ao excluir live.');
      }
    }
  };

  const handleVerifyPayment = async (accessId) => {
    try {
      await LearnAccess.update(accessId, { payment_verified: true });
      loadAccessRequests();
      alert('Pagamento verificado e acesso liberado!');
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">🎥 Central de Lives Nativas</h3>
          <p className="text-gray-600">Gerencie suas transmissões ao vivo com infraestrutura própria</p>
        </div>
        <Button onClick={handleCreateLive} className="bg-red-500 hover:bg-red-600">
          <PlusCircle className="w-4 h-4 mr-2" />
          Criar Nova Live
        </Button>
      </div>

      {/* Lista de Lives */}
      <div className="space-y-4">
        {lives.length > 0 ? lives.map(live => (
          <Card key={live.id} className="overflow-hidden">
            <div className="grid md:grid-cols-4 gap-4 p-6">
              <div className="md:col-span-1">
                {live.thumbnail_url && (
                  <img 
                    src={live.thumbnail_url} 
                    alt={live.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-lg">{live.title}</h4>
                  <Badge className={`${
                    live.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                    live.status === 'ao_vivo' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {live.status === 'agendada' && '📅 Agendada'}
                    {live.status === 'ao_vivo' && '🔴 Ao Vivo'}
                    {live.status === 'finalizada' && '📼 Finalizada'}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {live.description}
                </p>
                
                <div className="text-sm space-y-1">
                  <p><strong>Apresentador:</strong> {live.presenter}</p>
                  <p><strong>Data:</strong> {format(new Date(live.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  <p><strong>Duração:</strong> {live.duration_minutes} min</p>
                  {live.is_free ? (
                    <Badge className="bg-green-500 text-white">GRÁTIS</Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-black">R$ {live.price?.toFixed(2)}</Badge>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-1 space-y-2">
                <div className="flex flex-col gap-2">
                  {live.status === 'agendada' && (
                    <Button
                      size="sm"
                      onClick={() => openStreamingStudio(live.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      📺 Abrir Estúdio
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditLive(live)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200"
                    onClick={() => handleDeleteLive(live.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )) : (
          <div className="text-center py-12 text-gray-500">
            <Wifi className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhuma live agendada ainda.</p>
            <p className="text-sm">Clique em "Criar Nova Live" para começar!</p>
          </div>
        )}
      </div>

      {/* Solicitações de Acesso Pendentes */}
      {accessRequests.filter(req => !req.payment_verified && lives.some(l => l.id === req.content_id && !l.is_free)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-500" />
              Comprovantes de Pagamento - Lives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accessRequests
                .filter(req => !req.payment_verified && lives.some(l => l.id === req.content_id && !l.is_free))
                .map(request => {
                  const live = lives.find(l => l.id === request.content_id);
                  return (
                    <div key={request.id} className="border rounded-lg p-4 bg-orange-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{request.customer_email}</p>
                          <p className="text-sm text-gray-600">Live: {live?.title}</p>
                          <p className="text-sm text-gray-600">
                            Valor: R$ {live?.price?.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {request.payment_proof_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(request.payment_proof_url, '_blank')}
                            >
                              👁️ Ver Comprovante
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleVerifyPayment(request.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            ✅ Liberar Acesso
                          </Button>
                        </div>
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

// PDFs Management Component (mantém estrutura existente)
function PDFsManagement() {
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPDFForm, setShowPDFForm] = useState(false);
  const [editingPDF, setEditingPDF] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');

  useEffect(() => {
    loadPDFs();
  }, []);

  useEffect(() => {
    filterPDFs();
  }, [pdfs, searchTerm, categoryFilter, accessFilter]);

  const loadPDFs = async () => {
    setIsLoading(true);
    try {
      const data = await LearnPDF.list('-created_date');
      setPdfs(data);
    } catch (error) {
      console.error('Erro ao carregar PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPDFs = () => {
    let filtered = pdfs;

    if (searchTerm) {
      filtered = filtered.filter(pdf =>
        pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pdf.description && pdf.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pdf.tags && pdf.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(pdf => pdf.category === categoryFilter);
    }

    if (accessFilter !== 'all') {
      filtered = filtered.filter(pdf => 
        accessFilter === 'free' ? pdf.is_free : !pdf.is_free
      );
    }

    setFilteredPdfs(filtered);
  };

  const handleSubmitPDF = async (pdfData) => {
    try {
      if (editingPDF) {
        await LearnPDF.update(editingPDF.id, pdfData);
      } else {
        await LearnPDF.create(pdfData);
      }

      setShowPDFForm(false);
      setEditingPDF(null);
      await loadPDFs();
      alert('PDF salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar PDF:', error);
      alert('Erro ao salvar PDF. Tente novamente.');
    }
  };

  const handleEditPDF = (pdf) => {
    setEditingPDF(pdf);
    setShowPDFForm(true);
  };

  const handleDeletePDF = async (pdfId) => {
    if (window.confirm('Tem certeza que deseja excluir este PDF? Esta ação não pode ser desfeita.')) {
      try {
        await LearnPDF.delete(pdfId);
        await loadPDFs();
        alert('PDF excluído com sucesso.');
      } catch (error) {
        console.error('Erro ao excluir PDF:', error);
        alert('Erro ao excluir PDF.');
      }
    }
  };

  const handleAddPDF = () => {
    setEditingPDF(null);
    setShowPDFForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Carregando PDFs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de PDFs</p>
                <p className="text-3xl font-bold text-blue-600">{pdfs.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PDFs Gratuitos</p>
                <p className="text-3xl font-bold text-green-600">
                  {pdfs.filter(pdf => pdf.is_free).length}
                </p>
              </div>
              <Download className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PDFs Pagos</p>
                <p className="text-3xl font-bold text-orange-600">
                  {pdfs.filter(pdf => !pdf.is_free).length}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Downloads Totais</p>
                <p className="text-3xl font-bold text-purple-600">
                  {pdfs.reduce((total, pdf) => total + (pdf.download_count || 0), 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1 flex-wrap">
          <div className="relative flex-1 max-w-md min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar PDFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              <SelectItem value="Receitas">Receitas</SelectItem>
              <SelectItem value="Guias de Técnicas">Guias de Técnicas</SelectItem>
              <SelectItem value="E-books">E-books</SelectItem>
              <SelectItem value="Listas de Ingredientes">Listas de Ingredientes</SelectItem>
              <SelectItem value="Tabelas de Conversão">Tabelas de Conversão</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>

          <Select value={accessFilter} onValueChange={setAccessFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Acesso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="free">Gratuitos</SelectItem>
              <SelectItem value="paid">Pagos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAddPDF} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar PDF
        </Button>
      </div>

      {/* Lista de PDFs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPdfs.map((pdf) => (
          <Card key={pdf.id} className="group hover:shadow-lg transition-all duration-300">
            <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden relative">
              {pdf.thumbnail_url ? (
                <img
                  src={pdf.thumbnail_url}
                  alt={pdf.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                  <FileText className="w-16 h-16 text-blue-400" />
                </div>
              )}
              
              <div className="absolute top-2 right-2">
                {pdf.is_free ? (
                  <Badge className="bg-green-500 text-white">GRÁTIS</Badge>
                ) : (
                  <Badge className="bg-orange-500 text-white">R$ {pdf.price?.toFixed(2)}</Badge>
                )}
              </div>

              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex justify-between">
                  <span>{pdf.pages_count || '?'} pág.</span>
                  <span>{pdf.file_size_mb ? pdf.file_size_mb.toFixed(1) + ' MB' : '? MB'}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate flex-1">{pdf.title}</h3>
                {pdf.category && (
                  <Badge variant="outline" className="text-xs ml-2">{pdf.category}</Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {pdf.description}
              </p>

              {pdf.tags && pdf.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {pdf.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {pdf.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{pdf.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {pdf.download_count || 0} downloads
                </span>
                {pdf.created_date && (
                  <span>
                    {new Date(pdf.created_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEditPDF(pdf)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                {pdf.pdf_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(pdf.pdf_url, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDeletePDF(pdf.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPdfs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm || categoryFilter !== 'all' || accessFilter !== 'all' 
              ? 'Nenhum PDF encontrado' 
              : 'Nenhum PDF adicionado ainda'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || categoryFilter !== 'all' || accessFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando seu primeiro material educacional em PDF'
            }
          </p>
          {(!searchTerm && categoryFilter === 'all' && accessFilter === 'all') && (
            <Button onClick={handleAddPDF} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro PDF
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Eventos Management Component
function EventosManagement() {
  const [eventos, setEventos] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventos();
    loadRegistrations();
  }, []);

  const loadEventos = async () => {
    setIsLoading(true);
    try {
      const data = await LearnEvent.list('-event_date');
      setEventos(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const data = await EventRegistration.list('-created_date');
      setRegistrations(data);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Carregando eventos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-12 text-gray-500">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Gestão de eventos presenciais em desenvolvimento...</p>
        <p className="text-sm">Em breve você poderá criar workshops e masterclasses presenciais!</p>
      </div>
    </div>
  );
}

// Acessos Management Component
function AcessosManagement() {
  const [accessRequests, setAccessRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAccessRequests();
  }, []);

  const loadAccessRequests = async () => {
    setIsLoading(true);
    try {
      const data = await LearnAccess.list('-created_date');
      setAccessRequests(data);
    } catch (error) {
      console.error('Erro ao carregar acessos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (accessId) => {
    try {
      await LearnAccess.update(accessId, { payment_verified: true });
      loadAccessRequests();
      alert('Pagamento verificado e acesso liberado!');
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2">Carregando acessos...</span>
      </div>
    );
  }

  const pendingRequests = accessRequests.filter(req => !req.payment_verified);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">🔑 Gestão de Acessos</h3>
          <p className="text-gray-600">Verifique pagamentos e libere acessos aos conteúdos</p>
        </div>
        <Badge className="bg-orange-100 text-orange-800">
          {pendingRequests.length} pendentes
        </Badge>
      </div>

      {pendingRequests.length > 0 ? (
        <div className="space-y-4">
          {pendingRequests.map(request => (
            <Card key={request.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {request.content_type === 'aula' && <Video className="w-3 h-3 mr-1" />}
                        {request.content_type === 'pdf' && <FileText className="w-3 h-3 mr-1" />}
                        {request.content_type === 'live' && <Wifi className="w-3 h-3 mr-1" />}
                        {request.content_type === 'evento' && <Calendar className="w-3 h-3 mr-1" />}
                        {request.content_type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(request.created_date), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{request.customer_email}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Conteúdo ID: {request.content_id}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {request.payment_proof_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(request.payment_proof_url, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Comprovante
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleVerifyPayment(request.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Liberar Acesso
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Todos os pagamentos verificados!
          </h3>
          <p className="text-gray-500">
            Não há solicitações de acesso pendentes no momento.
          </p>
        </div>
      )}

      {/* Histórico de Acessos Liberados */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Acessos Liberados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {accessRequests
              .filter(req => req.payment_verified)
              .slice(0, 10)
              .map(request => (
                <div key={request.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium">{request.customer_email}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {request.content_type}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(request.access_granted_date || request.created_date), 'dd/MM/yyyy')}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Aulas Individuais Management Component
function IndividualManagement() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await IndividualClassRequest.list('-created_date');
      setRequests(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-2">Carregando solicitações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-12 text-gray-500">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Gestão de aulas individuais em desenvolvimento...</p>
        <p className="text-sm">Em breve você poderá gerenciar solicitações de aulas personalizadas!</p>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function LearnDashboard({ stats, recentActivity, pendingItems }) {
  const chartColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  const contentTypeData = [
    { name: 'Aulas', value: stats.totalAulas || 0, color: '#f97316', icon: Video },
    { name: 'PDFs', value: stats.totalPDFs || 0, color: '#3b82f6', icon: FileText },
    { name: 'Eventos', value: stats.totalEventos || 0, color: '#10b981', icon: Calendar },
    { name: 'Lives', value: stats.totalLives || 0, color: '#8b5cf6', icon: Wifi }
  ];

  const totalContent = contentTypeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Receita Total Learn</p>
                <p className="text-3xl font-bold">R$ {stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p className="text-orange-100 text-sm">+{stats.revenueGrowth}% este mês</p>
              </div>
              <DollarSign className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Conteúdo Publicado</p>
                <p className="text-3xl font-bold">{stats.totalContent || 0}</p>
                <p className="text-blue-100 text-sm">{stats.newContentThisMonth} novos este mês</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Alunos Ativos</p>
                <p className="text-3xl font-bold">{stats.activeStudents || 0}</p>
                <p className="text-green-100 text-sm">{stats.newStudents} novos esta semana</p>
              </div>
              <Users className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Solicitações Pendentes</p>
                <p className="text-3xl font-bold">{pendingItems.total || 0}</p>
                <p className="text-purple-100 text-sm">Requer sua atenção</p>
              </div>
              <Bell className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingItems.total > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Ação Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {pendingItems.paymentVerifications > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-orange-800">{pendingItems.paymentVerifications} Pagamentos</p>
                  <p className="text-sm text-orange-600">Aguardando verificação</p>
                </div>
              )}
              {pendingItems.eventRegistrations > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-orange-800">{pendingItems.eventRegistrations} Inscrições</p>
                  <p className="text-sm text-orange-600">Eventos aguardando aprovação</p>
                </div>
              )}
              {pendingItems.individualRequests > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-orange-800">{pendingItems.individualRequests} Aulas Individuais</p>
                  <p className="text-sm text-orange-600">Solicitações recebidas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Distribuição do Conteúdo Educacional
            </CardTitle>
            <p className="text-sm text-gray-600">
              Total de {totalContent} itens de conteúdo publicados
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {contentTypeData.map((item, index) => {
                const percentage = totalContent > 0 ? ((item.value / totalContent) * 100).toFixed(1) : 0;
                const IconComponent = item.icon;
                
                return (
                  <div key={item.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <IconComponent 
                            className="w-5 h-5" 
                            style={{ color: item.color }} 
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            {item.name === 'Aulas' && 'Vídeos educacionais disponíveis'}
                            {item.name === 'PDFs' && 'Materiais de apoio para download'}
                            {item.name === 'Eventos' && 'Atividades presenciais e workshops'}
                            {item.name === 'Lives' && 'Transmissões ao vivo e webinars'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-baseline gap-2">
                          <span 
                            className="text-3xl font-bold"
                            style={{ color: item.color }}
                          >
                            {item.value}
                          </span>
                          <span className="text-lg text-gray-500">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {item.name === 'Aulas' && `${stats.totalAulasGratuitas || 0} gratuitas • ${stats.totalAulasPagas || 0} pagas`}
                        {item.name === 'PDFs' && `${stats.totalPDFsGratuitos || 0} gratuitos • ${stats.totalPDFsPagos || 0} pagos`}
                        {item.name === 'Eventos' && `${stats.eventosProximos || 0} próximos • ${stats.eventosRealizados || 0} realizados`}
                        {item.name === 'Lives' && `${stats.livesAgendadas || 0} agendadas • ${stats.livesRealizadas || 0} realizadas`}
                      </span>
                      <span style={{ color: item.color }} className="font-medium">
                        {percentage}% do total
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalContent === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum conteúdo publicado ainda</p>
                <p className="text-sm">Comece criando sua primeira aula ou PDF!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Mais Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topContent?.length > 0 ? stats.topContent?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-l-orange-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.type}
                        </Badge>
                        {item.type === 'aula' && <Video className="w-3 h-3 text-gray-400" />}
                        {item.type === 'pdf' && <FileText className="w-3 h-3 text-gray-400" />}
                        {item.type === 'evento' && <Calendar className="w-3 h-3 text-gray-400" />}
                        {item.type === 'live' && <Wifi className="w-3 h-3 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      {item.views || item.downloads || item.registrations}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.type === 'aula' && 'visualizações'}
                      {item.type === 'pdf' && 'downloads'}
                      {item.type === 'evento' && 'inscrições'}
                      {item.type === 'live' && 'visualizações'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Dados de popularidade em carregamento...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            Agenda de Eventos e Lives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {stats.upcomingEvents?.length > 0 ? stats.upcomingEvents?.map((event, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.type}</p>
                <p className="text-sm font-medium text-blue-600">
                  {format(new Date(event.date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
                {event.type === 'evento' && (
                  <p className="text-xs text-gray-500">{event.registered}/{event.maxParticipants} inscritos</p>
                )}
              </div>
            )) : <p className="text-gray-500 text-center py-4 md:col-span-3">Nenhum evento agendado.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced main component with all functionalities
export default function LearnManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [lives, setLives] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [showStreamingStudio, setShowStreamingStudio] = useState(false);
  const [currentLiveId, setCurrentLiveId] = useState(null);

  const loadLives = useCallback(async () => {
    setIsLoading(true);
    try {
      const livesData = await LearnLive.list('-scheduled_date');
      setLives(livesData);
    } catch (error) {
      console.error('Erro ao carregar lives:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPDFs = useCallback(async () => {
    setIsLoading(true);
    try {
      const pdfsData = await LearnPDF.list();
      setPdfs(pdfsData);
    } catch (error) {
      console.error('Erro ao carregar PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAulas = useCallback(async () => {
    setIsLoading(true);
    try {
      const aulasData = await Aula.list();
      setAulas(aulasData);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLives();
    loadPDFs();
    loadAulas();
  }, [loadLives, loadPDFs, loadAulas]);

  const openStreamingStudio = (liveId) => {
    setCurrentLiveId(liveId);
    setShowStreamingStudio(true);
  };

  // Statistics calculation
  const totalLives = lives.length;
  const livesAgendadas = lives.filter(l => l.status === 'agendada').length;
  const livesRealizadas = lives.filter(l => l.status === 'finalizada').length;

  const totalPDFs = pdfs.length;
  const totalPDFsGratuitos = pdfs.filter(p => p.is_free).length;
  const totalPDFsPagos = pdfs.filter(p => !p.is_free).length;

  const totalAulas = aulas.length;
  const totalAulasGratuitas = aulas.filter(a => a.is_free).length;
  const totalAulasPagas = aulas.filter(a => !a.is_free).length;

  const mockStats = {
    totalAulas: totalAulas,
    totalPDFs: totalPDFs,
    totalEventos: 0,
    totalLives: totalLives,
    totalContent: totalPDFs + totalLives + totalAulas,
    totalRevenue: 0,
    activeStudents: 0,
    newStudents: 0,
    revenueGrowth: 0,
    newContentThisMonth: 0,
    totalAulasGratuitas: totalAulasGratuitas,
    totalAulasPagas: totalAulasPagas,
    totalPDFsGratuitos: totalPDFsGratuitos,
    totalPDFsPagos: totalPDFsPagos,
    eventosProximos: 0,
    eventosRealizados: 0,
    livesAgendadas: livesAgendadas,
    livesRealizadas: livesRealizadas,
    topContent: [
      ...lives.map(l => ({
        id: l.id,
        title: l.title,
        type: 'live',
        views: l.max_viewers || 0
      })),
      ...pdfs.map(p => ({
        id: p.id,
        title: p.title,
        type: 'pdf',
        downloads: p.download_count || 0
      })),
      ...aulas.map(a => ({
        id: a.id,
        title: a.title,
        type: 'aula',
        views: a.views || 0
      }))
    ].sort((a,b) => (b.views || b.downloads) - (a.views || a.downloads)).slice(0, 5),
    upcomingEvents: lives.filter(l => l.status === 'agendada').map(l => ({
      id: l.id,
      title: l.title,
      date: l.scheduled_date,
      type: 'live',
      registered: 0,
      maxParticipants: 0
    }))
  };

  const mockPendingItems = {
    paymentVerifications: 0,
    eventRegistrations: 0,
    individualRequests: 0,
    total: 0
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-orange-500" />
            Central de Controle - Sala Learn
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie todo o conteúdo educacional e streaming nativo da sua plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Sistema Ativo
          </Badge>
          <Button 
            onClick={() => openStreamingStudio(null)}
            className="bg-red-500 hover:bg-red-600"
          >
            <Video className="w-4 h-4 mr-2" />
            Estúdio Nativo
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">
            <TrendingUp className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="aulas">
            <Video className="w-4 h-4 mr-2" />
            Aulas
          </TabsTrigger>
          <TabsTrigger value="lives">
            <Wifi className="w-4 h-4 mr-2" />
            Lives Nativas
          </TabsTrigger>
          <TabsTrigger value="pdfs">
            <FileText className="w-4 h-4 mr-2" />
            PDFs
          </TabsTrigger>
          <TabsTrigger value="eventos">
            <Calendar className="w-4 h-4 mr-2" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="acessos">
            <Key className="w-4 h-4 mr-2" />
            Acessos
          </TabsTrigger>
          <TabsTrigger value="individual">
            <MessageSquare className="w-4 h-4 mr-2" />
            Individuais
          </TabsTrigger>
          <TabsTrigger value="infrastructure">
            <Settings className="w-4 h-4 mr-2" />
            Infraestrutura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <LearnDashboard 
            stats={mockStats} 
            recentActivity={[]} 
            pendingItems={mockPendingItems}
          />
        </TabsContent>

        <TabsContent value="aulas">
          <AulasManagement />
        </TabsContent>

        <TabsContent value="lives">
          <LivesManagement 
            lives={lives} 
            onRefresh={loadLives} 
            openStreamingStudio={openStreamingStudio} 
          />
        </TabsContent>

        <TabsContent value="pdfs">
          <PDFsManagement />
        </TabsContent>

        <TabsContent value="eventos">
          <EventosManagement />
        </TabsContent>

        <TabsContent value="acessos">
          <AcessosManagement />
        </TabsContent>

        <TabsContent value="individual">
          <IndividualManagement />
        </TabsContent>

        <TabsContent value="infrastructure">
          <StreamingInfrastructure />
        </TabsContent>
      </Tabs>

      {/* Streaming Studio Modal */}
      {showStreamingStudio && (
        <StreamingStudio
          liveId={currentLiveId}
          onClose={() => {
            setShowStreamingStudio(false);
            setCurrentLiveId(null);
            loadLives();
          }}
        />
      )}
    </div>
  );
}