import React, { useState, useEffect } from 'react';
import { Order, Product } from '@/api/entities';
import { CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('orderId');
      if (orderId) {
        try {
          const orderData = await Order.filter({ id: orderId });
          const foundOrder = orderData[0];
          setOrder(foundOrder);

          if (foundOrder) {
            const productIds = foundOrder.items.map(item => item.product_id);
            const productDetails = await Product.list();
            const filteredProducts = productDetails.filter(p => productIds.includes(p.id));
            setProducts(filteredProducts);
          }
        } catch (error) {
          console.error("Error fetching order details:", error);
        }
      }
      setIsLoading(false);
    };
    fetchOrder();
  }, []);
  
  const getProductById = (id) => products.find(p => p.id === id);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
        <Link to={createPageUrl('Home')}>
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your order!</h1>
          <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
          <p className="font-semibold text-lg">Order Number: #{order.order_number}</p>
          
          {order.payment_method === 'bank_transfer' && (
            <div className="mt-6 text-left bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2">Bank Transfer Details</h3>
              <p>Please transfer <strong>{order.final_amount} MVR</strong> to the following account:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>Bank:</strong> Bank of Maldives</li>
                <li><strong>Account Number:</strong> 7730000123456</li>
                <li><strong>Account Name:</strong> TasteFinder Marketplace</li>
                <li><strong>Reference:</strong> #{order.order_number}</li>
              </ul>
              <p className="text-xs mt-3 text-blue-700">Your order will be processed once payment is confirmed.</p>
            </div>
          )}

          <div className="my-8 border-t" />

          <h2 className="text-xl font-bold text-left mb-4">Order Summary</h2>
          <div className="space-y-4 text-left">
            {order.items.map(item => {
              const product = getProductById(item.product_id);
              return (
                <div key={item.product_id} className="flex items-center gap-4">
                  <img src={product?.images?.[0] || '/api/placeholder/60/60'} alt={product?.name} className="w-16 h-16 rounded-md" />
                  <div className="flex-1">
                    <p className="font-medium">{product?.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{(item.price * item.quantity).toFixed(2)} MVR</p>
                </div>
              );
            })}
          </div>

          <div className="my-8 border-t" />

          <div className="text-left space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{order.total_amount.toFixed(2)} MVR</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>{order.delivery_fee.toFixed(2)} MVR</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{order.final_amount.toFixed(2)} MVR</span>
            </div>
          </div>
          
          <div className="mt-10">
            <Link to={createPageUrl('Marketplace')}>
              <Button size="lg" className="w-full bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90">Continue Shopping</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}