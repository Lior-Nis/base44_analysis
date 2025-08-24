
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Aula, 
  LearnEvent, 
  LearnLive, 
  LearnPDF, 
  EventRegistration, 
  IndividualClassRequest, 
  LearnAccess,
  User 
} from '@/api/entities';
import { 
  PlayCircle, 
  Clock, 
  User as UserIcon, 
  Eye, 
  Star, 
  Calendar,
  MapPin,
  Users,
  FileText,
  Video,
  Wifi,
  Gift,
  Crown,
  Search,
  Filter,
  BookOpen,
  Download,
  Lock,
  Play,
  CheckCircle,
  ShoppingCart, // Added
  ExternalLink  // Added
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para carrossel de destaques
function FeaturedCarousel({ items, onItemClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="relative mb-8">
      <div className="overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="relative h-64 md:h-80 cursor-pointer"
            onClick={() => onItemClick(items[currentIndex])}
          >
            <img
              src={items[currentIndex].thumbnail_url}
              alt={items[currentIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                {items[currentIndex].is_free === false ? (
                  <Badge className="bg-yellow-500 text-black">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium - R$ {items[currentIndex].price?.toFixed(2)}
                  </Badge>
                ) : (
                  <Badge className="bg-green-500">
                    <Gift className="w-3 h-3 mr-1" />
                    Grátis
                  </Badge>
                )}
                {items[currentIndex].category && (
                  <Badge variant="outline" className="border-white text-white">
                    {items[currentIndex].category}
                  </Badge>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">{items[currentIndex].title}</h3>
              <p className="text-sm opacity-90 line-clamp-2">{items[currentIndex].description}</p>
            </div>
            <div className="absolute center-center">
              <PlayCircle className="w-16 h-16 text-white/80 hover:text-white transition-colors" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Indicadores */}
      <div className="flex justify-center mt-4 gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Componente para Lives em Destaque
function FeaturedLives({ lives, onJoinLive, userAccess }) {
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const newTimeRemaining = {};

      lives.forEach(live => {
        if (live.status === 'agendada') {
          const liveTime = new Date(live.scheduled_date);
          const diff = liveTime - now;
          
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            newTimeRemaining[live.id] = {
              hours,
              minutes,
              seconds,
              isLive: false
            };
          } else if (diff > -60 * 60 * 1000) { // Live por até 1 hora após o agendamento é considerada 'ao vivo' ou prestes a encerrar
            newTimeRemaining[live.id] = { isLive: true };
          }
        } else if (live.status === 'ao_vivo') {
          newTimeRemaining[live.id] = { isLive: true };
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [lives]);

  const hasAccess = (live) => {
    if (live.is_free) return true;
    return userAccess?.some(access => 
      access.content_type === 'live' && 
      access.content_id === live.id && 
      access.payment_verified
    );
  };

  if (lives.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Wifi className="w-6 h-6 text-red-500" />
        🔴 Próximas Lives Interativas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lives.map(live => {
          const countdown = timeRemaining[live.id];
          const hasLiveAccess = hasAccess(live);
          
          return (
            <motion.div
              key={live.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${
                countdown?.isLive ? 'ring-2 ring-red-500' : ''
              }`}>
                <div className="relative">
                  <img
                    src={live.thumbnail_url}
                    alt={live.title}
                    className="w-full h-40 object-cover"
                  />
                  
                  {/* Status da Live */}
                  <div className="absolute top-2 left-2">
                    {countdown?.isLive ? (
                      <Badge className="bg-red-500 text-white animate-pulse">
                        🔴 AO VIVO
                      </Badge>
                    ) : live.status === 'agendada' ? (
                      <Badge className="bg-blue-500 text-white">
                        📅 AGENDADA
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white">
                        📼 GRAVAÇÃO
                      </Badge>
                    )}
                  </div>

                  {/* Preço */}
                  <div className="absolute top-2 right-2">
                    {live.is_free ? (
                      <Badge className="bg-green-500 text-white">
                        GRÁTIS
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500 text-black">
                        R$ {live.price?.toFixed(2)}
                      </Badge>
                    )}
                  </div>

                  {/* Contador Regressivo */}
                  {countdown && !countdown.isLive && countdown.hours !== undefined && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-center">
                        <div className="text-xs">Começa em:</div>
                        <div className="font-mono font-bold">
                          {String(countdown.hours).padStart(2, '0')}:
                          {String(countdown.minutes).padStart(2, '0')}:
                          {String(countdown.seconds).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {live.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {live.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {format(new Date(live.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>Com {live.presenter}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Duração estimada: {live.duration_minutes || 60} min</span>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="space-y-2">
                    {countdown?.isLive ? (
                      hasLiveAccess ? (
                        <Button 
                          onClick={() => onJoinLive(live)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        >
                          🔴 ASSISTIR LIVE AGORA
                        </Button>
                      ) : (
                        <Button disabled className="w-full bg-gray-400">
                          🔒 Live paga - Acesso não liberado
                        </Button>
                      )
                    ) : live.status === 'agendada' ? (
                      hasLiveAccess ? (
                        <Button disabled className="w-full bg-green-500 hover:bg-green-600">
                          ✅ Inscrito - Aguarde o início
                        </Button>
                      ) : live.is_free ? (
                        <Button 
                          onClick={() => onJoinLive(live)}
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          📝 Inscrever-se Gratuitamente
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => onJoinLive(live)}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          💳 Comprar Acesso - R$ {live.price?.toFixed(2)}
                        </Button>
                      )
                    ) : live.status === 'finalizada' && live.recording_url ? (
                      hasLiveAccess ? (
                        <Button 
                          onClick={() => window.open(live.recording_url, '_blank')}
                          className="w-full bg-purple-500 hover:bg-purple-600"
                        >
                          📹 Assistir Gravação
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => onJoinLive(live)}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          💳 Comprar Acesso à Gravação
                        </Button>
                      )
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Componente para PDFs Educacionais
function PDFsSection({ pdfs, onAccessPDF, userAccess, user }) {
  const [filteredPDFs, setFilteredPDFs] = useState(pdfs);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = pdfs;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(pdf => pdf.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(pdf =>
        pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPDFs(filtered);
  }, [pdfs, categoryFilter, searchTerm]);

  const hasAccess = (pdf) => {
    if (pdf.is_free) return true;
    return userAccess?.some(access => 
      access.content_type === 'pdf' && 
      access.content_id === pdf.id && 
      access.payment_verified
    );
  };

  const getUniqueCategories = () => {
    const categories = pdfs.map(pdf => pdf.category).filter(Boolean);
    return [...new Set(categories)];
  };

  if (pdfs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          📚 Biblioteca de PDFs Educacionais
        </h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar PDFs, receitas, guias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="all">Todas as Categorias</option>
          {getUniqueCategories().map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Grid de PDFs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPDFs.map(pdf => {
          const pdfHasAccess = hasAccess(pdf);
          
          return (
            <motion.div
              key={pdf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-purple-50">
                  {pdf.thumbnail_url ? (
                    <img
                      src={pdf.thumbnail_url}
                      alt={pdf.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-blue-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {pdf.is_free ? (
                      <Badge className="bg-green-500 text-white">
                        <Gift className="w-3 h-3 mr-1" />
                        GRÁTIS
                      </Badge>
                    ) : pdfHasAccess ? (
                      <Badge className="bg-blue-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        ACESSÍVEL
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        R$ {pdf.price?.toFixed(2)}
                      </Badge>
                    )}
                  </div>

                  {/* Categoria */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-white/80">
                      {pdf.category}
                    </Badge>
                  </div>

                  {/* Informações do arquivo */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex justify-between">
                      <span>{pdf.pages_count || '?'} páginas</span>
                      <span>{pdf.file_size_mb ? `${pdf.file_size_mb.toFixed(1)} MB` : ''}</span>
                    </div>
                  </div>

                  {/* Overlay de ação */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 rounded-full p-3">
                      {pdfHasAccess ? (
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {pdf.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {pdf.description}
                  </p>

                  {/* Tags */}
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

                  {/* Estatísticas */}
                  <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {pdf.download_count || 0} downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Adicionado em {new Date(pdf.created_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Botões de Ação */}
                  <div className="space-y-2">
                    {pdfHasAccess ? (
                      <div className="space-y-2">
                        <Button 
                          onClick={() => onAccessPDF(pdf, 'view')}
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Ler PDF Online
                        </Button>
                        {pdf.enable_download && (
                          <Button 
                            onClick={() => onAccessPDF(pdf, 'download')}
                            variant="outline"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PDF
                          </Button>
                        )}
                      </div>
                    ) : pdf.is_free ? (
                      <Button 
                        onClick={() => onAccessPDF(pdf, 'access')}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Acessar Gratuitamente
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {pdf.preview_pages > 0 && (
                          <Button 
                            onClick={() => onAccessPDF(pdf, 'preview')}
                            variant="outline"
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Amostra ({pdf.preview_pages} pág.)
                          </Button>
                        )}
                        <Button 
                          onClick={() => onAccessPDF(pdf, 'purchase')}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar por R$ {pdf.price?.toFixed(2)}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredPDFs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Nenhum PDF encontrado' 
              : 'Nenhum PDF disponível ainda'
            }
          </h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Novos materiais educacionais serão adicionados em breve!'
            }
          </p>
        </div>
      )}
    </div>
  );
}

// Componente para cartão de conteúdo
function ContentCard({ item, type, onItemClick, userAccess }) {
  const hasAccess = userAccess?.some(access => 
    access.content_type === type && access.content_id === item.id && access.payment_verified
  );

  const getTypeIcon = () => {
    switch (type) {
      case 'aula': return Video;
      case 'pdf': return FileText;
      case 'live': return Wifi;
      case 'evento': return Calendar;
      default: return BookOpen;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <div className="relative">
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          
          {/* Overlay de status */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {item.is_free === false ? (
              hasAccess ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Acessível
                </Badge>
              ) : (
                <Badge className="bg-yellow-500 text-black">
                  <Crown className="w-3 h-3 mr-1" />
                  R$ {item.price?.toFixed(2)}
                </Badge>
              )
            ) : (
              <Badge className="bg-green-500">
                <Gift className="w-3 h-3 mr-1" />
                Grátis
              </Badge>
            )}
          </div>

          {/* Ícone de play/tipo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <CardContent className="p-4" onClick={() => onItemClick(item, type)}>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold line-clamp-2 flex-1">{item.title}</h4>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {item.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.duration_minutes} min
                </span>
              )}
              {item.author || item.instructor || item.presenter && (
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {item.author || item.instructor || item.presenter}
                </span>
              )}
              {item.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.views}
                </span>
              )}
            </div>
            
            {item.level && (
              <Badge variant="outline" className="text-xs">
                {item.level}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SalaLearn() {
  const [aulas, setAulas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [lives, setLives] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [userAccess, setUserAccess] = useState([]);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllContent();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Carregar acessos do usuário
      const access = await LearnAccess.filter({ customer_email: currentUser.email });
      setUserAccess(access);
    } catch (error) {
      console.log("Usuário não logado", error);
    }
  };

  const loadAllContent = async () => {
    try {
      const [aulasData, eventosData, livesData, pdfsData] = await Promise.all([
        Aula.list('-created_date'),
        LearnEvent.list('-event_date'),
        LearnLive.list('-scheduled_date'), // Ordenar por data da live
        LearnPDF.list('-created_date') // Carregar PDFs
      ]);
      
      setAulas(aulasData);
      setEventos(eventosData);
      
      // Filtrar lives para mostrar as próximas e as ao vivo, e gravações disponíveis
      const now = new Date();
      const relevantLives = livesData.filter(live => {
        if (live.status === 'ao_vivo') return true;
        if (live.status === 'agendada') {
          const liveTime = new Date(live.scheduled_date);
          // Show if scheduled for future, or if it started within the last 1 hour
          return liveTime > now || (now - liveTime) < 60 * 60 * 1000; 
        }
        if (live.status === 'finalizada' && live.recording_url) return true;
        return false;
      });
      
      setLives(relevantLives);
      setPdfs(pdfsData); // Definir PDFs
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Criar lista de itens em destaque para o carrossel
  const featuredItems = [
    ...aulas.filter(a => a.tags?.includes('Destaque')).slice(0, 2),
    ...lives.filter(l => l.status === 'agendada').slice(0, 2),
    ...eventos.slice(0, 1)
  ].map(item => ({
    ...item,
    type: item.video_url ? 'aula' : item.scheduled_date ? 'live' : 'evento'
  }));

  const handleItemClick = (item, type) => {
    // Implementar navegação baseada no tipo
    console.log('Clicked item:', item, 'Type:', type);
    // Aqui você redirecionaria para a página específica do conteúdo
  };

  const handleJoinLive = async (live) => {
    if (!user) {
      alert('Por favor, faça login para participar das lives ou comprar acesso.');
      return;
    }

    if (live.is_free) {
      if (live.status === 'ao_vivo' && live.live_url) {
        window.open(live.live_url, '_blank');
      } else {
        try {
          // Check if already registered
          const alreadyRegistered = userAccess.some(access => 
            access.content_type === 'live' && 
            access.content_id === live.id && 
            access.payment_verified
          );

          if (!alreadyRegistered) {
            await LearnAccess.create({
              customer_email: user.email,
              content_type: 'live',
              content_id: live.id,
              payment_verified: true // Grátis = já verificado
            });
            alert('✅ Inscrição realizada! Você receberá uma notificação quando a live começar.');
            loadUserData(); // Recarregar acessos
          } else {
            alert('Você já está inscrito para esta live. Aguarde o início!');
          }
        } catch (error) {
          console.error('Erro ao se inscrever:', error);
          alert('Houve um erro ao tentar se inscrever. Tente novamente mais tarde.');
        }
      }
    } else {
      // Live paga - redirecionar para WhatsApp
      const priceText = live.price ? `R$ ${live.price?.toFixed(2)}` : 'um valor';
      const message = `Olá! Gostaria de comprar acesso à live "${live.title}" por ${priceText}. Como posso fazer o pagamento?`;
      const whatsappNumber = "5511999999999"; // Replace with actual WhatsApp number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleAccessPDF = async (pdf, action) => {
    if (!user) {
      alert('Por favor, faça login para acessar os PDFs.');
      return;
    }

    // Check if the user has access *before* any action requiring it
    const hasPdfAccess = userAccess?.some(access => 
      access.content_type === 'pdf' && 
      access.content_id === pdf.id && 
      access.payment_verified
    );

    switch (action) {
      case 'view':
        if (hasPdfAccess) {
          window.open(pdf.pdf_url, '_blank');
        } else {
          alert('Você não tem acesso a este PDF. Por favor, compre-o ou solicite acesso.');
        }
        break;
        
      case 'download':
        if (hasPdfAccess && pdf.enable_download) {
          const link = document.createElement('a');
          link.href = pdf.pdf_url;
          link.download = `${pdf.title}.pdf`;
          document.body.appendChild(link); // Append to body to make it clickable in all browsers
          link.click();
          document.body.removeChild(link); // Clean up
        } else if (!hasPdfAccess) {
          alert('Você não tem acesso a este PDF para download. Por favor, compre-o ou solicite acesso.');
        } else {
          alert('O download deste PDF não está habilitado.');
        }
        break;
        
      case 'preview':
        // Ensure there's a preview_url or use pdf_url with #page parameters
        if (pdf.preview_url) {
            window.open(pdf.preview_url, '_blank');
        } else if (pdf.pdf_url) {
            // Attempt to open the main PDF with a limited page view if no specific preview URL
            window.open(`${pdf.pdf_url}#page=1&view=FitH`, '_blank'); // Opens page 1, fits height
        } else {
            alert('Não há amostra disponível para este PDF.');
        }
        break;
        
      case 'access': // For free PDFs only
        try {
          if (!hasPdfAccess) {
            await LearnAccess.create({
              customer_email: user.email,
              content_type: 'pdf',
              content_id: pdf.id,
              payment_verified: true // Grátis = já verificado
            });
            alert('✅ Acesso liberado! Você pode agora ler este PDF.');
            loadUserData(); // Recarregar acessos
          } else {
            alert('Você já tem acesso a este PDF.');
          }
        } catch (error) {
          console.error('Erro ao liberar acesso:', error);
          alert('Erro ao liberar acesso. Tente novamente.');
        }
        break;
        
      case 'purchase':
        const message = `Olá! Gostaria de comprar o PDF "${pdf.title}" por R$ ${pdf.price?.toFixed(2)}. Como posso fazer o pagamento?`;
        const whatsappNumber = "5511999999999"; // Substitua pelo número real
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        break;
      default:
        console.warn(`Unknown action for PDF: ${action}`);
    }
  };

  const getFilteredContent = () => {
    let allContent = [];
    
    if (activeFilter === 'todos' || activeFilter === 'aulas') {
      allContent.push(...aulas.map(a => ({ ...a, type: 'aula' })));
    }
    if (activeFilter === 'todos' || activeFilter === 'eventos') {
      allContent.push(...eventos.map(e => ({ ...e, type: 'evento' })));
    }
    // Lives are handled separately by FeaturedLives, but also included here for general filtering
    if (activeFilter === 'todos' || activeFilter === 'lives') {
      allContent.push(...lives.map(l => ({ ...l, type: 'live' })));
    }
    if (activeFilter === 'todos' || activeFilter === 'pdfs') {
      // For general display, filter PDFs already handled by PDFsSection if needed
      allContent.push(...pdfs.map(p => ({ ...p, type: 'pdf' })));
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      allContent = allContent.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por gratuito/pago
    if (activeFilter === 'gratis') {
      allContent = allContent.filter(item => item.is_free !== false);
    }
    if (activeFilter === 'pagos') {
      allContent = allContent.filter(item => item.is_free === false);
    }
    
    return allContent;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p>Carregando Sala Learn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            🎓 Sala Learn Premium
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Seu hub completo de aprendizado em confeitaria. Aulas, eventos, lives, PDFs e muito mais!
          </p>
        </motion.div>

        {/* Carrossel de Destaques */}
        {featuredItems.length > 0 && (
          <FeaturedCarousel items={featuredItems} onItemClick={handleItemClick} />
        )}

        {/* Lives em Destaque */}
        <FeaturedLives 
          lives={lives.filter(l => l.status === 'agendada' || l.status === 'ao_vivo' || (l.status === 'finalizada' && l.recording_url))} 
          onJoinLive={handleJoinLive}
          userAccess={userAccess}
        />

        {/* PDFs Educacionais */}
        <PDFsSection 
          pdfs={pdfs}
          onAccessPDF={handleAccessPDF}
          userAccess={user}
          user={user} // Pass the user object as well for authentication logic within PDFsSection if needed
        />

        {/* Filtros e Busca */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar aulas, eventos, lives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros Rápidos */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'todos', label: 'Todos', icon: BookOpen },
              { key: 'gratis', label: 'Grátis', icon: Gift },
              { key: 'pagos', label: 'Premium', icon: Crown },
              { key: 'aulas', label: 'Aulas', icon: Video },
              { key: 'eventos', label: 'Eventos', icon: Calendar },
              { key: 'lives', label: 'Lives', icon: Wifi },
              { key: 'pdfs', label: 'PDFs', icon: FileText }
            ].map(filter => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.key)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Grid de Conteúdos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getFilteredContent().map((item) => (
            <ContentCard
              key={`${item.type}-${item.id}`}
              item={item}
              type={item.type}
              onItemClick={handleItemClick}
              userAccess={userAccess}
            />
          ))}
        </div>

        {getFilteredContent().length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum conteúdo encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termo de busca
            </p>
          </div>
        )}

        {/* Seção de Solicitação de Aulas Individuais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">
                🎯 Aulas Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Precisa de algo específico? Solicite uma aula individual presencial ou online!
              </p>
              <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                Solicitar Aula Individual
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
