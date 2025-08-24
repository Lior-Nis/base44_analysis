
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { PendingOrder } from "@/api/entities";
import { PendingImage } from "@/api/entities";
import { createCheckoutSession } from "@/api/functions";
import { checkPaymentStatus } from "@/api/functions";
import { Check, CreditCard, Shield, ArrowLeft, Image } from "lucide-react";
import { useHapticFeedback } from "../components/useHapticFeedback.js";

export default function Checkout() {
  const navigate = useNavigate();
  const triggerHaptic = useHapticFeedback();
  const [user, setUser] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const packages = {
    "5_images": { name: "Starter Pack", images: 5, price: 5 }, // Changed price to 5
    "10_images": { name: "Popular Pack", images: 10, price: 10 },
    "15_images": { name: "Ultimate Pack", images: 15, price: 15 }
  };

  useEffect(() => {
    checkAuth();
    loadPendingOrder();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      User.loginWithRedirect(window.location.href);
    }
  };

  const loadPendingOrder = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pendingOrderId = urlParams.get('pending_order');
      
      if (!pendingOrderId) {
        navigate(createPageUrl("Home"));
        return;
      }

      const [order, images] = await Promise.all([
        PendingOrder.filter({ id: pendingOrderId }, '-created_date', 1),
        PendingImage.filter({ pending_order_id: pendingOrderId }, '-created_date')
      ]);

      if (order.length === 0) {
        navigate(createPageUrl("Home"));
        return;
      }

      setPendingOrder(order[0]);
      setPendingImages(images);
    } catch (error) {
      console.error('Error loading pending order:', error);
      navigate(createPageUrl("Home"));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!pendingOrder || !user) return;

    setProcessing(true);
    
    // Ensure pkg is available within this scope. It's defined globally in the component, so it's accessible.
    const pkg = packages[pendingOrder.package_type]; 

    try {
      // Store pending order ID for later use
      localStorage.setItem('pendingOrderId', pendingOrder.id);
      
      // If it's a free package, skip Stripe and directly create the order
      if (pkg.price === 0) {
        const response = await checkPaymentStatus({
          sessionId: 'free_order', // Special identifier for free orders
          pendingOrderId: pendingOrder.id
        });

        if (response.data.success) {
          // Navigate directly to success page
          window.location.href = createPageUrl("PaymentSuccess") + "?session_id=free_order";
        } else {
          throw new Error(response.data.message || 'Order creation failed');
        }
      } else {
        // Regular Stripe checkout for paid packages
        const response = await createCheckoutSession({
          packageType: pendingOrder.package_type,
          publicGalleryConsent: pendingOrder.public_gallery_consent,
          pendingOrderId: pendingOrder.id,
        });

        if (response.data.url) {
          window.location.href = response.data.url;
        } else {
          throw new Error("Failed to create Stripe session.");
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Could not process your order. Please try again.');
      setProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-center">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!pendingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <p className="text-white text-center">Order not found</p>
        </div>
      </div>
    );
  }

  const pkg = packages[pendingOrder.package_type];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => {
              triggerHaptic();
              navigate(createPageUrl("CreateOrder") + `?package=${pendingOrder.package_type}`);
            }}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Edit Order
          </button>
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Review & Pay</h1>
            <p className="text-white/80">Review your transformations and complete your order</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Preview */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Your Transformations</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingImages.map((image, index) => (
                  <div key={image.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <div className="flex gap-4">
                      <img
                        src={image.original_image_url}
                        alt={`Dog ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-2">Photo #{index + 1}</h4>
                        <p className="text-white/80 text-sm leading-relaxed">
                          {image.transformation_request}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">{pkg.name}</span>
                    <span className="text-white font-semibold">${pkg.price}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">Images uploaded:</span>
                    <span className="text-white">{pendingImages.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">Gallery consent:</span>
                    <span className="text-white">
                      {pendingOrder.public_gallery_consent ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4 mb-6">
                  <div className="flex justify-between items-center text-xl font-bold text-white">
                    <span>Total</span>
                    <span>${pkg.price}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic();
                    handleCheckout();
                  }}
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {pkg.price === 0 ? 'Creating your order...' : 'Redirecting to payment...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {pkg.price === 0 ? 'Complete Free Order' : `Pay $${pkg.price}`}
                    </div>
                  )}
                </button>

                <div className="mt-4 text-center text-sm text-white/70">
                  <p>Secure payment • Our team will transform your images within 24-48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
