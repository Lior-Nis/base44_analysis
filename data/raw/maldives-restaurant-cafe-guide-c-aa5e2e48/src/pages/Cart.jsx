import React, { useState, useEffect } from 'react';
import { useCart } from '../components/cart/CartProvider';
import { Product } from '@/api/entities';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, itemCount, isLoading: isCartLoading } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cartItems.length > 0) {
        setIsLoadingProducts(true);
        const productIds = cartItems.map(item => item.product_id);
        const uniqueProductIds = [...new Set(productIds)];
        
        try {
          const productDetails = await Product.list();
          const filteredProducts = productDetails.filter(p => uniqueProductIds.includes(p.id));
          setProducts(filteredProducts);
        } catch (error) {
          console.error("Error fetching product details:", error);
        } finally {
          setIsLoadingProducts(false);
        }
      } else {
        setProducts([]);
        setIsLoadingProducts(false);
      }
    };
    
    if (!isCartLoading) {
        fetchProductDetails();
    }
  }, [cartItems, isCartLoading]);

  const getProductById = (id) => products.find(p => p.id === id);

  const subtotal = cartItems.reduce((sum, item) => {
    const product = getProductById(item.product_id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  
  const isLoading = isCartLoading || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--primary-cta)]" />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-[60vh] text-center flex flex-col items-center justify-center">
        <ShoppingCart className="w-24 h-24 text-gray-300 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to={createPageUrl('Marketplace')}>
          <Button className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => {
              const product = getProductById(item.product_id);
              if (!product) return null;

              return (
                <Card key={item.id} className="flex items-center p-4">
                  <img
                    src={product.images?.[0] || '/api/placeholder/100/100'}
                    alt={product.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.seller_type}</p>
                    <p className="font-bold text-[var(--primary-cta)] mt-1">
                      {product.price} {product.currency}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="px-3">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)} MVR</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-medium">Calculated at next step</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{subtotal.toFixed(2)} MVR</span>
                </div>
                <Link to={createPageUrl('Checkout')} className="block">
                  <Button size="lg" className="w-full bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90">
                    Proceed to Checkout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}