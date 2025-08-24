
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2, Search, ShoppingCart, Star, Eye, CheckCircle } from 'lucide-react';
import { Product } from '@/api/entities';
import { useCart } from '../components/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Carrossel de Produtos em Destaque
function FeaturedCarousel({ products }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % products.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [products.length]);

    if (!products.length) return null;

    return (
        <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl mb-12 shadow-2xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${products[currentSlide].image_url})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Badge className="mb-4 bg-orange-500 text-white">
                                    {products[currentSlide].tags?.[0] || 'Destaque'}
                                </Badge>
                                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                    {products[currentSlide].name}
                                </h2>
                                <p className="text-lg md:text-xl mb-6 max-w-2xl opacity-90">
                                    {products[currentSlide].description}
                                </p>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl md:text-3xl font-bold text-orange-400">
                                        Kz {products[currentSlide].price.toFixed(2)}
                                    </span>
                                    <Link to={createPageUrl('ProductDetails') + `?id=${products[currentSlide].id}`}>
                                        <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                                            Ver Detalhes
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            
            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                            index === currentSlide ? 'bg-orange-500 w-8' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

// Navegação de Categorias Visual
function CategoryNavigation({ categories, activeCategory, setActiveCategory }) {
    const categoryIcons = {
        "Todos": "🏪",
        "Salgados": "🥟", 
        "Doces": "🧁",
        "Especiais": "⭐",
        "Bebidas": "🥤"
    };

    return (
        <div className="flex justify-center mb-12">
            <div className="flex gap-2 p-2 bg-gray-100 rounded-2xl overflow-x-auto">
                {categories.map(category => (
                    <motion.button
                        key={category}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveCategory(category)}
                        className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all whitespace-nowrap ${
                            activeCategory === category 
                                ? 'bg-orange-500 text-white shadow-lg' 
                                : 'text-gray-600 hover:bg-white hover:shadow-md'
                        }`}
                    >
                        <span className="text-lg">{categoryIcons[category]}</span>
                        {category}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

// Card de Produto Interativo
function ProductCard({ product, index }) {
    const { addToCart } = useCart();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Card className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl">
                <div className="relative overflow-hidden">
                    <motion.img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                    />
                    {product.tags && product.tags.length > 0 && (
                        <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                            {product.tags[0]}
                        </Badge>
                    )}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/20 flex items-center justify-center"
                            >
                                <Link to={createPageUrl('ProductDetails') + `?id=${product.id}`}>
                                    <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-100">
                                        <Eye className="w-5 h-5 mr-2" />
                                        Ver Detalhes
                                    </Button>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-orange-600 transition-colors">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm text-gray-600">4.8</span>
                        </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-orange-600">
                                Kz {product.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500">à vista</span>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                onClick={() => addToCart(product, 1, {})}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
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

// Card especial para Vitrine Diária com funcionalidade de eliminar para admin
function DailyShowcaseCard({ product, showStock = true, isAdmin = false, onDelete }) {
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

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover "${product.name}" da vitrine diária?`)) {
      onDelete(product.id);
    }
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

        {/* Botão de eliminar para admin */}
        {isAdmin && (
          <div className="absolute top-3 right-3 z-20">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
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
            
            {!isAdmin && (
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
            )}
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

// Seção Top Vendas
function TopSelling({ products }) {
    return (
        <section className="mb-16">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">🔥 Mais Vendidos</h2>
                <p className="text-gray-600">Os favoritos dos nossos clientes</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                ))}
            </div>
        </section>
    );
}

// Carrinho Lateral Otimizado
function OptimizedCart() {
    const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Botão Flutuante do Carrinho */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-orange-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                    >
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </motion.span>
                )}
            </motion.button>

            {/* Overlay do Carrinho */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex justify-end"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="bg-white w-full max-w-md h-full overflow-y-auto p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">Seu Pedido</h3>
                                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-4 mb-6">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-3 items-center border-b pb-4">
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-grow">
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p className="text-sm text-gray-500">Kz {item.price.toFixed(2)}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="font-medium">{item.quantity}</span>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="text-red-500 ml-2"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">Kz {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {cartItems.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between mb-2">
                                            <span>Subtotal</span>
                                            <span>Kz {cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Taxa de entrega</span>
                                            <span>Kz 500,00</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span>Kz {(cartTotal + 500).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Link to={createPageUrl('Checkout')}>
                                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3">
                                            Finalizar Pedido
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                                    <Button onClick={() => setIsOpen(false)}>
                                        Continuar Comprando
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default function Menu() {
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");

    const categories = ["Todos", "Salgados", "Doces", "Especiais", "Bebidas"];

    useEffect(() => {
        async function fetchData() {
            const [allProducts, featured, top] = await Promise.all([
                Product.list('-created_date'),
                Product.filter({ 'tags.contains': 'Destaque' }, '-created_date', 3),
                Product.filter({ 'tags.contains': 'Mais Vendido' }, '-created_date', 4)
            ]);
            
            setProducts(allProducts);
            setFeaturedProducts(featured);
            setTopProducts(top);
        }
        fetchData();
    }, []);

    const filteredProducts = products.filter(product => {
        const categoryMatch = activeCategory === "Todos" || product.category === activeCategory;
        const searchMatch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header com busca */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-6">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Faça seu Pedido Online</h1>
                        <p className="text-gray-600">Escolha seus pastéis favoritos e receba no conforto da sua casa</p>
                    </div>
                    
                    {/* Barra de Busca */}
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 py-3 rounded-xl border-gray-200 focus:border-orange-300"
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Carrossel de Produtos em Destaque */}
                <FeaturedCarousel products={featuredProducts} />

                {/* Seção Mais Vendidos */}
                <TopSelling products={topProducts} />

                {/* Navegação de Categorias */}
                <CategoryNavigation 
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                {/* Grid de Produtos */}
                <section>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {activeCategory === "Todos" ? "Todos os Produtos" : activeCategory}
                        </h2>
                        <p className="text-gray-600">
                            {filteredProducts.length} produtos encontrados
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg mb-4">Nenhum produto encontrado</p>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setSearchTerm("");
                                    setActiveCategory("Todos");
                                }}
                            >
                                Limpar Filtros
                            </Button>
                        </div>
                    )}
                </section>
            </div>

            {/* Carrinho Otimizado */}
            <OptimizedCart />
        </div>
    );
}
