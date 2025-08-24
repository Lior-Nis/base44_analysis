
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { UserImage } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { sendOrderCompletionEmail } from "@/api/functions";
import { ArrowLeft, Image, Upload, Mail, Calendar, Gift, Eye, User as UserIcon } from "lucide-react";
import { useHapticFeedback } from "../components/useHapticFeedback.js";

export default function AdminOrderDetail() {
  const navigate = useNavigate();
  const triggerHaptic = useHapticFeedback();
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [orderImages, setOrderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFinal, setUploadingFinal] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      if (userData.role !== 'admin') throw new Error('Not authorized');
      setUser(userData);
    } catch (error) {
      navigate(createPageUrl('Home'));
    }
  };

  useEffect(() => {
    if (user) {
      loadOrderData();
    }
  }, [user]);

  const getPackageDetails = (packageType) => {
    const packages = {
      "5_images": { name: "Starter Pack", images: 5 },
      "10_images": { name: "Popular Pack", images: 10 },
      "15_images": { name: "Ultimate Pack", images: 15 }
    };
    return packages[packageType] || { name: packageType, images: 0 };
  };
  
  const loadOrderData = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('orderId');
      if (!orderId) {
        navigate(createPageUrl('Admin'));
        return;
      }
      
      const [orderResult, imagesResult] = await Promise.all([
        Order.filter({ id: orderId }),
        UserImage.filter({ order_id: orderId }, '-created_date')
      ]);

      if (orderResult.length === 0) {
        throw new Error('Order not found');
      }

      setOrder(orderResult[0]);
      setOrderImages(imagesResult);
    } catch (error) {
      console.error('Error loading order details:', error);
      navigate(createPageUrl('Admin'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadFinal = async (imageId, file) => {
    const imageToUpdate = orderImages.find(img => img.id === imageId);
    if (!imageToUpdate) return;

    setUploadingFinal(imageId);
    try {
      const { file_url } = await UploadFile({ file });
      await UserImage.update(imageId, {
        transformed_image_url: file_url,
        status: 'completed'
      });
      
      const updatedImages = orderImages.map(img => 
        img.id === imageId ? { ...img, transformed_image_url: file_url, status: 'completed' } : img
      );
      setOrderImages(updatedImages);

      const packageDetails = getPackageDetails(order.package_type);
      const totalImagesInPackage = packageDetails.images;
      const completedImagesCount = updatedImages.filter(img => img.status === 'completed').length;

      if (completedImagesCount === totalImagesInPackage) {
        console.log(`Order ${order.id} is complete! Sending completion email.`);
        await sendOrderCompletionEmail({ orderId: order.id });
        alert(`Order complete! A confirmation email has been sent to the customer.`);
      }
      triggerHaptic("success"); // Optional: Add success haptic feedback on successful upload
    } catch (error) {
      console.error('Error uploading final image:', error);
      alert('Error uploading final image');
      triggerHaptic("error"); // Optional: Add error haptic feedback on upload failure
    } finally {
      setUploadingFinal(null);
    }
  };

  if (loading || !user || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const packageDetails = getPackageDetails(order.package_type);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button onClick={() => { triggerHaptic("light"); navigate(createPageUrl('Admin')); }} className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to All Orders
          </button>
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Manage Order</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
            <div className="space-y-1">
              <p className="text-sm text-white/70 flex items-center gap-2"><UserIcon className="w-4 h-4"/> Customer</p>
              <p className="font-semibold">{order.created_by}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-white/70 flex items-center gap-2"><Calendar className="w-4 h-4"/> Order Date</p>
              <p className="font-semibold">{new Date(order.created_date).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-white/70 flex items-center gap-2"><Gift className="w-4 h-4"/> Package</p>
              <p className="font-semibold">{packageDetails.name} (${order.amount})</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-white/70 flex items-center gap-2"><Eye className="w-4 h-4"/> Gallery Consent</p>
              <p className={`font-semibold ${order.public_gallery_consent ? 'text-green-400' : 'text-red-400'}`}>
                {order.public_gallery_consent ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Image className="w-6 h-6"/> Customer Images</h2>
          {orderImages.map((image, index) => (
            <div key={image.id} className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl grid md:grid-cols-2 gap-6 items-start">
              {/* Original Image & Prompt */}
              <div className="space-y-4">
                <h3 className="font-bold text-white">Photo #{index + 1} - Original</h3>
                <img src={image.original_image_url} alt="Original" className="rounded-lg w-full aspect-square object-cover border-2 border-white/20"/>
                <div>
                  <p className="text-white font-medium mb-2">Transformation Request:</p>
                  <p className="text-white/80 text-sm bg-black/20 p-3 rounded-md min-h-[80px]">{image.transformation_request}</p>
                </div>
              </div>

              {/* Transformed Image Upload/Display */}
              <div className="space-y-4">
                 <h3 className="font-bold text-white">Photo #{index + 1} - Transformed</h3>
                {image.status === 'pending' ? (
                  <div className="p-4 bg-black/20 rounded-lg border border-dashed border-white/30 h-full flex flex-col justify-center items-center">
                    <label className="block text-white font-medium mb-3 text-center">Upload Final Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        triggerHaptic("selection"); // Optional: Add haptic feedback on file input interaction
                        e.target.files[0] && handleUploadFinal(image.id, e.target.files[0]);
                      }}
                      className="block w-full max-w-xs text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/20 file:text-white file:cursor-pointer hover:file:bg-white/30"
                      disabled={uploadingFinal === image.id}
                    />
                    {uploadingFinal === image.id && <p className="text-sm text-white/70 mt-2 animate-pulse">Uploading...</p>}
                  </div>
                ) : (
                  <div>
                    <img src={image.transformed_image_url} alt="Transformed" className="rounded-lg w-full aspect-square object-cover border-2 border-green-500/50"/>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
