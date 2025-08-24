
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Clock, ChefHat, TrendingUp, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, Testemunho, Order } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../components/contexts/CartContext';

function HeroSection() {
  return (
    <div 
      className="relative h-[500px] bg-cover bg-center" 
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1989&auto=format&fit=crop')" 
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-start justify-center h-full text-white px-8 md:px-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-4 max-w-2xl leading-tight">
          Saboreie a Tradição em Cada Mordida
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
          Descubra o sabor autêntico dos nossos pastéis artesanais, preparados com ingredientes frescos e receitas tradicionais que encantam paladares desde 1985.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4">
          <Link to={createPageUrl('Menu')}>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
              Ver Cardápio
            </Button>
          </Link>
          <Link to={createPageUrl('Menu')}>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-lg">
              Fazer Pedido
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function ProductCard({ product, showBadge = true }) {
  const { addToCart } = useCart();
  
  return (
    <Card className="group overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="overflow-hidden">
        <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <CardContent className="p-6">
        <div className="mb-3">
          {showBadge && product.tags?.[0] && (
            <Badge variant="secondary" className="mb-3 bg-orange-100 text-orange-700 text-xs font-medium">
              {product.tags[0]}
            </Badge>
          )}
          <h3 className="font-bold text-xl mb-2 text-gray-800">{product.name}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4 h-12 leading-relaxed">{product.description}</p>
        <div className="flex justify-between items-center">
          <p className="font-bold text-xl text-orange-600">Kz {product.price.toFixed(2)}</p>
          <Button 
            size="icon" 
            onClick={() => addToCart(product, 1, {})}
            className="bg-orange-500 hover:bg-orange-600 w-10 h-10 rounded-lg"
          >
            <ShoppingCart size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonyCard({ testimony }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mr-4">
            <span className="text-orange-600 font-bold text-xl">
              {testimony.customer_name.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-800">{testimony.customer_name}</h4>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < testimony.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-600 italic text-base leading-relaxed">"{testimony.comment}"</p>
      </CardContent>
    </Card>
  );
}

// Card de Destaque Premium com Dados de Vendas
function FeaturedProductCard({ product, salesData }) {
    const { addToCart } = useCart();
    const totalSold = salesData?.totalQuantity || 0;
    const salesRank = salesData?.rank || 0;
    
    const getRankBadge = (rank) => {
        if (rank === 1) return { text: "🏆 #1 Mais Vendido", color: "bg-yellow-500" };
        if (rank === 2) return { text: "🥈 #2 Favorito", color: "bg-gray-400" };
        if (rank === 3) return { text: "🥉 #3 Popular", color: "bg-amber-600" };
        return { text: `⭐ Top ${rank}`, color: "bg-orange-500" };
    };
    
    const rankBadge = getRankBadge(salesRank);
    
    return (
        <motion.div 
            className="w-[340px] md:w-[380px] flex-shrink-0"
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Card className="group overflow-hidden shadow-2xl rounded-2xl bg-white flex flex-col h-full relative">
                {/* Badge de Ranking */}
                <div className="absolute top-4 left-4 z-10">
                    <Badge className={`${rankBadge.color} text-white shadow-lg`}>
                        {rankBadge.text}
                    </Badge>
                </div>
                
                <div className="relative overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h3 className="font-bold text-2xl text-white mb-2">{product.name}</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center text-yellow-400">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-white text-sm opacity-90">
                                {totalSold > 0 ? `${totalSold} vendidos` : 'Novo!'}
                            </span>
                            {totalSold > 50 && (
                                <div className="flex items-center text-green-400">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    <span className="text-sm">Em alta!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <CardContent className="p-6 flex-grow flex flex-col">
                    <p className="text-sm text-gray-600 mb-4 flex-grow leading-relaxed">
                        {product.description}
                    </p>
                    
                    {/* Estatísticas de Vendas */}
                    {totalSold > 0 && (
                        <div className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                            <p className="text-xs text-orange-700 font-medium">
                                ⚡ {totalSold} clientes já escolheram este produto
                            </p>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                        <div>
                            <p className="font-bold text-2xl text-orange-600">Kz {product.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Preço especial</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                size="lg" 
                                onClick={() => addToCart(product, 1, {})}
                                className="bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </motion.div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Card especial para Vitrine Diária com stock e feedback visual
function DailyShowcaseCard({ product, showStock = true }) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  
  const handleAddToCart = () => {
    addToCart(product, 1, {}, 'vitrine_diaria');
    setJustAdded(true);
    
    // Reset do feedback visual após 2 segundos
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative">
        {/* Badge de "Fresquinho Hoje" */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-green-500 text-white shadow-lg">
            🔥 Fresquinho Hoje
          </Badge>
        </div>
        
        {/* Badge de estoque */}
        {showStock && product.daily_stock !== undefined && (
          <div className="absolute top-3 right-3 z-10">
            <Badge 
              className={`text-white shadow-lg ${
                product.daily_stock === 0 ? 'bg-red-500' : 
                product.daily_stock <= 3 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            >
              {product.daily_stock === 0 ? 'Esgotado' : `${product.daily_stock} restantes`}
            </Badge>
          </div>
        )}
        
        {/* Feedback visual de adição ao carrinho */}
        <AnimatePresence>
          {justAdded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-green-500/20 backdrop-blur-sm z-20 flex items-center justify-center"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Adicionado ao Carrinho!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
        
        <CardContent className="p-6">
          <div className="mb-3">
            <h3 className="font-bold text-xl mb-2 text-gray-800">{product.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 h-12 leading-relaxed">{product.description}</p>
          
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="font-bold text-xl text-orange-600">Kz {product.price.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Feito hoje</p>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="icon" 
                onClick={handleAddToCart}
                disabled={product.daily_stock === 0}
                className={`w-10 h-10 rounded-lg transition-all ${
                  product.daily_stock === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : justAdded 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {justAdded ? (
                  <CheckCircle size={18} />
                ) : (
                  <ShoppingCart size={18} />
                )}
              </Button>
            </motion.div>
          </div>
          
          {product.daily_stock === 0 && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Produto esgotado para hoje
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dailyShowcaseProducts, setDailyShowcaseProducts] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar todos os pedidos para calcular estatísticas de vendas
        const orders = await Order.list('-created_date');
        
        // Calcular vendas por produto
        const productSales = {};
        
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const productId = item.product_id;
              if (!productSales[productId]) {
                productSales[productId] = {
                  totalQuantity: 0,
                  totalRevenue: 0,
                  orderCount: 0
                };
              }
              productSales[productId].totalQuantity += item.quantity;
              productSales[productId].totalRevenue += item.total_price;
              productSales[productId].orderCount += 1;
            });
          }
        });
        
        // Ordenar produtos por quantidade vendida
        const sortedSales = Object.entries(productSales)
          .sort(([,a], [,b]) => b.totalQuantity - a.totalQuantity)
          .map(([productId, data], index) => ({
            productId,
            ...data,
            rank: index + 1
          }));
        
        // Criar mapa de dados de vendas
        const salesDataMap = {};
        sortedSales.forEach(sale => {
          salesDataMap[sale.productId] = sale;
        });
        
        setSalesData(salesDataMap);
        
        // Buscar todos os produtos
        const allProducts = await Product.list('-created_date');
        
        // Filtrar produtos mais vendidos (top 6 para destaques)
        const topSellingProductIds = sortedSales.slice(0, 6).map(sale => sale.productId);
        const topSellingProducts = allProducts.filter(product => 
          topSellingProductIds.includes(product.id)
        ).sort((a, b) => {
          const aRank = salesDataMap[a.id]?.rank || 999;
          const bRank = salesDataMap[b.id]?.rank || 999;
          return aRank - bRank;
        });
        
        // Se não tiver vendas suficientes, preencher com produtos da tag "Destaque"
        if (topSellingProducts.length < 4) {
          const taggedProducts = allProducts.filter(p => 
            p.tags?.includes('Destaque') && !topSellingProductIds.includes(p.id)
          );
          topSellingProducts.push(...taggedProducts.slice(0, 4 - topSellingProducts.length));
        }
        
        // Produtos da vitrine diária (publicados hoje)
        const today = new Date().toDateString();
        const dailyProducts = allProducts.filter(product => 
          product.published_today && 
          product.published_date &&
          new Date(product.published_date).toDateString() === today
        );
        
        // Testemunhos aprovados
        const testimoniesData = await Testemunho.filter({ is_approved: true }, '-created_date', 3);
        
        setFeaturedProducts(topSellingProducts);
        setDailyShowcaseProducts(dailyProducts);
        setTestimonies(testimoniesData);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Fallback: carregar produtos com tags
        const [featured, testimoniesData] = await Promise.all([
          Product.filter({ 'tags.contains': 'Destaque' }, '-created_date', 4),
          Testemunho.filter({ is_approved: true }, '-created_date', 3)
        ]);
        
        setFeaturedProducts(featured);
        setDailyShowcaseProducts([]);
        setTestimonies(testimoniesData);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Carregando os produtos mais amados...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>
      {`
        .horizontal-scroll {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .horizontal-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}
      </style>

      <HeroSection />

      {/* Seção Destaques Baseados em Vendas */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-16 px-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-10 h-10 text-orange-500" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800">Produtos Mais Vendidos</h2>
            </div>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Descubra os sabores que são sucesso de vendas. Estes são os produtos preferidos dos nossos clientes!
            </p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="relative w-full">
              <div 
                ref={scrollContainerRef}
                className="flex gap-8 pb-8 overflow-x-auto horizontal-scroll"
              >
                {featuredProducts.map((product, index) => (
                   <div key={`${product.id}-${index}`} className="flex-shrink-0">
                    <FeaturedProductCard 
                      product={product}
                      salesData={salesData[product.id]}
                    />
                  </div>
                ))}
              </div>
              
              {/* Botões de Navegação */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full h-10 w-10 z-10"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full h-10 w-10 z-10"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Ainda não temos dados de vendas suficientes.</p>
              <p className="text-gray-400">Os destaques aparecerão conforme os pedidos forem sendo realizados!</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to={createPageUrl('Menu')}>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 text-lg"
              >
                Ver Cardápio Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Seção Vitrine Diária */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-8 md:px-16">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-10 h-10 text-orange-500" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800">Vitrine Diária</h2>
            </div>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Fresquinhos e especiais! Confira nossa seleção de hoje, feita com ingredientes da estação e muito carinho.
            </p>
          </div>
          
          {dailyShowcaseProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dailyShowcaseProducts.map(product => (
                <DailyShowcaseCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Vitrine em Preparação</h3>
              <p className="text-gray-600 mb-4">Nossa equipe está preparando delícias fresquinhas para hoje!</p>
              <p className="text-sm text-gray-500">Volte em breve ou confira nosso cardápio completo</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to={createPageUrl('Menu')}>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
                <ChefHat className="w-6 h-6 mr-2" />
                Ver Todos os Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Seção Testemunhos */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">O Que Nossos Clientes Dizem</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Veja os depoimentos de quem já experimentou nossos deliciosos pastéis.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonies.map(testimony => (
              <TestimonyCard key={testimony.id} testimony={testimony} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to={createPageUrl('Testemunhos')}>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 text-lg"
              >
                Ver Todos os Depoimentos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
