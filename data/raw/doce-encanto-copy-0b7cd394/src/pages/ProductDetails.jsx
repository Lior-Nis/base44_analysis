
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
    Plus, 
    Minus, 
    ShoppingCart, 
    Star, 
    Heart, 
    Share2, 
    ArrowLeft,
    Check,
    AlertCircle
} from 'lucide-react';
import { Product } from '@/api/entities';
import { useCart } from '../components/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProductDetails() {
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedFlavor, setSelectedFlavor] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews] = useState([
        { id: 1, customer: "Maria Silva", rating: 5, comment: "Delicioso! Exatamente como eu esperava." },
        { id: 2, customer: "João Santos", rating: 5, comment: "Produto de qualidade excepcional." },
        { id: 3, customer: "Ana Costa", rating: 4, comment: "Muito bom, recomendo!" }
    ]);

    const { addToCart } = useCart();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            loadProductDetails(productId);
        }
    }, []);

    const loadProductDetails = async (productId) => {
        try {
            const productData = await Product.get(productId);
            setProduct(productData);
            
            // Carregar produtos relacionados
            const related = await Product.filter({ category: productData.category }, '-created_date', 4);
            setRelatedProducts(related.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculatePrice = () => {
        if (!product) return 0;
        let price = product.price;
        
        // Adicionar custos de personalização
        if (selectedSize === 'Grande') price += 500;
        if (selectedSize === 'Extra Grande') price += 1000;
        if (customMessage) price += 300;
        
        return price * quantity;
    };

    const handleAddToCart = () => {
        if (!product) return;
        
        const variations = {
            ...(selectedSize && { tamanho: selectedSize }),
            ...(selectedFlavor && { sabor: selectedFlavor }),
        };
        
        addToCart(product, quantity, variations, customMessage, specialInstructions);
        
        // Feedback visual
        alert('Produto adicionado ao carrinho!');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p>Carregando produto...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
                    <Link to={createPageUrl('Menu')}>
                        <Button>Voltar ao Menu</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const productImages = [
        product.image_url,
        product.image_url, // Simular múltiplas imagens
        product.image_url,
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Menu')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-semibold">{product.name}</h1>
                        <div className="ml-auto flex gap-2">
                            <Button variant="ghost" size="icon">
                                <Heart className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Galeria de Imagens */}
                    <motion.div 
                        className="relative overflow-hidden rounded-2xl shadow-2xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    >
                        <img 
                            src={productImages[currentImageIndex]} 
                            alt={product.name}
                            className="w-full h-96 object-cover"
                        />
                        {product.tags && product.tags.length > 0 && (
                            <Badge className="absolute top-4 left-4 bg-orange-500 text-white">
                                {product.tags[0]}
                            </Badge>
                        )}
                    </motion.div>
                    
                    {/* Miniaturas */}
                    <div className="flex gap-2">
                        {productImages.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                    index === currentImageIndex ? 'border-orange-500' : 'border-gray-200'
                                }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Informações do Produto */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-2">4.8 (247 avaliações)</span>
                                </div>
                                <Badge variant="outline">{product.category}</Badge>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                        </div>

                        <Separator />

                        {/* Opções de Personalização */}
                        <div className="space-y-6">
                            {/* Tamanho */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Tamanho</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Pequeno', 'Médio', 'Grande'].map((size) => (
                                        <motion.button
                                            key={size}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedSize(size)}
                                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                                                selectedSize === size 
                                                    ? 'border-orange-500 bg-orange-50 text-orange-600' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="font-medium">{size}</div>
                                            <div className="text-sm text-gray-500">
                                                {size === 'Grande' ? '+Kz 500,00' : size === 'Extra Grande' ? '+Kz 1.000,00' : 'Padrão'}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Sabor (se aplicável) */}
                            {product.category === 'Doces' && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Sabor</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Chocolate', 'Baunilha', 'Morango', 'Coco'].map((flavor) => (
                                            <motion.button
                                                key={flavor}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedFlavor(flavor)}
                                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                                    selectedFlavor === flavor 
                                                        ? 'border-orange-500 bg-orange-50 text-orange-600' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {flavor}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mensagem Personalizada */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Mensagem Personalizada (+Kz 300,00)</h3>
                                <Input
                                    placeholder="Ex: Parabéns João!"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    maxLength={30}
                                    className="rounded-xl"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {customMessage.length}/30 caracteres
                                </p>
                            </div>

                            {/* Instruções Especiais */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Instruções Especiais</h3>
                                <Textarea
                                    placeholder="Alguma observação especial sobre ingredientes ou preparo..."
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    rows={3}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Quantidade e Preço */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Quantidade</h3>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="rounded-full"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="rounded-full"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-gray-100 rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span>Preço unitário</span>
                                    <span>Kz {product.price.toFixed(2)}</span>
                                </div>
                                {selectedSize === 'Grande' && (
                                    <div className="flex justify-between items-center mb-2 text-sm">
                                        <span>Tamanho Grande</span>
                                        <span>+Kz 500,00</span>
                                    </div>
                                )}
                                {customMessage && (
                                    <div className="flex justify-between items-center mb-2 text-sm">
                                        <span>Mensagem personalizada</span>
                                        <span>+Kz 300,00</span>
                                    </div>
                                )}
                                <Separator className="my-3" />
                                <div className="flex justify-between items-center font-bold text-xl">
                                    <span>Total</span>
                                    <span className="text-orange-600">Kz {calculatePrice().toFixed(2)}</span>
                                </div>
                            </div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                    onClick={handleAddToCart}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Adicionar ao Carrinho
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Avaliações */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Avaliações dos Clientes</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {reviews.map((review) => (
                            <Card key={review.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <span className="font-semibold text-orange-600">
                                                {review.customer.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{review.customer}</h4>
                                            <div className="flex items-center">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">"{review.comment}"</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Produtos Relacionados */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Card key={relatedProduct.id} className="group cursor-pointer">
                                    <Link to={createPageUrl('ProductDetails') + `?id=${relatedProduct.id}`}>
                                        <div className="overflow-hidden rounded-t-lg">
                                            <img 
                                                src={relatedProduct.image_url} 
                                                alt={relatedProduct.name}
                                                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold mb-1">{relatedProduct.name}</h3>
                                            <p className="text-orange-600 font-bold">Kz {relatedProduct.price.toFixed(2)}</p>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
