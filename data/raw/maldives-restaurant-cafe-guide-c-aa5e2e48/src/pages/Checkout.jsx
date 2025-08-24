import React, { useState, useEffect } from 'react';
import { useCart } from '../components/cart/CartProvider';
import { Product, Order, User as UserEntity } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    island: '',
    atoll: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState('local_delivery');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    const fetchUserAndProducts = async () => {
      try {
        const user = await UserEntity.me();
        setDeliveryAddress(prev => ({
          ...prev,
          full_name: user.full_name,
          phone: user.phone || ''
        }));

        if (cartItems.length > 0) {
          const productIds = cartItems.map(item => item.product_id);
          const uniqueProductIds = [...new Set(productIds)];
          const productDetails = await Product.list();
          const filteredProducts = productDetails.filter(p => uniqueProductIds.includes(p.id));
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndProducts();
  }, [cartItems]);

  const getProductById = (id) => products.find(p => p.id === id);

  const subtotal = cartItems.reduce((sum, item) => {
    const product = getProductById(item.product_id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const deliveryFee = deliveryMethod === 'local_delivery' ? 25 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const user = await UserEntity.me();
      
      const orderItems = cartItems.map(item => {
        const product = getProductById(item.product_id);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: product?.price || 0,
          seller_id: product?.seller_id || null,
        };
      });

      const newOrder = {
        order_number: `TF-${Date.now()}`,
        customer_id: user.id,
        items: orderItems,
        total_amount: subtotal,
        delivery_fee: deliveryFee,
        tax_amount: 0,
        final_amount: total,
        currency: 'MVR',
        delivery_method: deliveryMethod,
        delivery_address: deliveryAddress,
        special_instructions: specialInstructions,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending'
      };

      const createdOrder = await Order.create(newOrder);
      await clearCart();
      
      window.location.href = createPageUrl(`OrderConfirmation?orderId=${createdOrder.id}`);

    } catch (error) {
      console.error("Error placing order:", error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--primary-cta)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping and Payment */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={deliveryAddress.full_name} onChange={e => setDeliveryAddress({...deliveryAddress, full_name: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={deliveryAddress.phone} onChange={e => setDeliveryAddress({...deliveryAddress, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address_line1">Address</Label>
                  <Input id="address_line1" placeholder="Street name and house number" value={deliveryAddress.address_line1} onChange={e => setDeliveryAddress({...deliveryAddress, address_line1: e.target.value})} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="island">Island</Label>
                    <Input id="island" value={deliveryAddress.island} onChange={e => setDeliveryAddress({...deliveryAddress, island: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="atoll">Atoll</Label>
                    <Input id="atoll" value={deliveryAddress.atoll} onChange={e => setDeliveryAddress({...deliveryAddress, atoll: e.target.value})} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local_delivery" id="local_delivery" />
                    <Label htmlFor="local_delivery">Local Delivery (25 MVR)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup">Pickup (Free)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer">Bank Transfer (Details on next page)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                    <Label htmlFor="cash_on_delivery">Cash on Delivery</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special notes for your delivery?"
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => {
                    const product = getProductById(item.product_id);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <img src={product?.images?.[0] || '/api/placeholder/50/50'} alt={product?.name} className="w-10 h-10 rounded-md" />
                          <div>
                            <p className="font-medium line-clamp-1">{product?.name}</p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p>{(product?.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} MVR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee.toFixed(2)} MVR</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{total.toFixed(2)} MVR</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-6 bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}