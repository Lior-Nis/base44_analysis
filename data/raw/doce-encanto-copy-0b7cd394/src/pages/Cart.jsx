
import React from 'react';
import { useCart } from '../components/contexts/CartContext'; // Updated path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4 flex items-center justify-center gap-3">
            <ShoppingCart className="w-8 h-8"/> Meu Carrinho
          </h1>
        </motion.div>

        {cartItems.length === 0 ? (
          <Card className="text-center p-8 glass-effect">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4"/>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Que tal adicionar alguns doces maravilhosos?</p>
            <Link to={createPageUrl("Menu")}>
              <Button className="bg-gradient-to-r from-pink-500 to-amber-500 text-white">
                Ir para o Cardápio
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                  >
                    <Card className="glass-effect overflow-hidden">
                      <CardContent className="p-4 flex gap-4 items-center">
                        <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-24 h-24 object-cover rounded-lg"/>
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <div className="text-sm text-gray-500">
                            {Object.entries(item.variations).map(([key, value]) => (
                              <span key={key} className="mr-2 capitalize">{key}: {value}</span>
                            ))}
                          </div>
                          <p className="font-semibold text-pink-600 mt-1">R$ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <div className="flex items-center border rounded-lg">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-4 h-4"/></Button>
                             <span className="px-2">{item.quantity}</span>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-4 h-4"/></Button>
                           </div>
                           <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                             <Trash2 className="w-4 h-4"/>
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="lg:col-span-1">
              <Card className="glass-effect sticky top-8">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Entrega</span>
                    <span>A calcular</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-4">
                    <span>Total</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={createPageUrl("Checkout")} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-amber-500 text-white">
                      Continuar <ArrowRight className="w-4 h-4 ml-2"/>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
