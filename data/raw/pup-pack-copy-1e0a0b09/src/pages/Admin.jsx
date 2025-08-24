
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { UserImage } from "@/api/entities";
import { PublicGalleryImage } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { sendOrderCompletionEmail } from "@/api/functions";
import { Link } from "react-router-dom"; // Added for navigation
import { createPageUrl } from "@/utils";
import { Shield, Users, Image, Upload, Eye, Check, X, Package, Mail, Calendar, Gift, Star, Trash2, Edit, Wrench, Copy } from "lucide-react";
import { useHapticFeedback } from "../components/useHapticFeedback.js";

export default function Admin() {
  const triggerHaptic = useHapticFeedback(); // Initialize haptic feedback
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allUserImages, setAllUserImages] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed uploadingFinal state as per new design (order details moved to separate page)
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ image: null, caption: "" });
  const [activeTab, setActiveTab] = useState("orders");
  const [galleryImages, setGalleryImages] = useState([]);
  
  // State for the new file uploader utility
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);
  
  useEffect(() => {
    if(user) {
        loadAdminData();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      if (userData.role !== 'admin') {
        throw new Error('Not authorized');
      }
      setUser(userData);
    } catch (error) {
      window.location.href = createPageUrl('Home');
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [allOrders, allImages, publicGallery] = await Promise.all([
        Order.list('-created_date'),
        UserImage.list('-created_date'),
        PublicGalleryImage.list('-featured_order')
      ]);
      setOrders(allOrders);
      setAllUserImages(allImages);
      setGalleryImages(publicGallery);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackageDetails = (packageType) => {
    const packages = {
      "5_images": { name: "Starter Pack", images: 5 },
      "10_images": { name: "Popular Pack", images: 10 },
      "15_images": { name: "Ultimate Pack", images: 15 }
    };
    return packages[packageType] || { name: packageType, images: 0 };
  };

  // handleUploadFinal function removed as its functionality is now intended for AdminOrderDetail page

  const handleAddToGallery = async (event) => {
    event.preventDefault();
    triggerHaptic(); // Haptic feedback on form submission
    if (!galleryForm.image || !galleryForm.caption.trim()) {
      alert('Please select an image and add a caption');
      return;
    }
    setUploadingGallery(true);
    try {
      const { file_url } = await UploadFile({ file: galleryForm.image });
      const currentGalleryImages = await PublicGalleryImage.list(); // Fetch current list to determine next order
      const nextOrder = currentGalleryImages.length + 1; // Simplistic approach for ordering, can be improved
      await PublicGalleryImage.create({
        image_url: file_url,
        caption: galleryForm.caption,
        featured_order: nextOrder
      });
      setGalleryForm({ image: null, caption: "" });
      alert('Image added to public gallery successfully!');
      loadAdminData(); // Refresh to show the change
    } catch (error) {
      console.error('Error adding to gallery:', error);
      alert('Error adding image to gallery');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveFromGallery = async (imageId) => {
    triggerHaptic(); // Haptic feedback on remove attempt
    if (confirm('Are you sure you want to remove this image from the public gallery?')) {
      try {
        await PublicGalleryImage.delete(imageId);
        loadAdminData(); // Refresh to show the change
      } catch (error) {
        console.error('Error removing from gallery:', error);
        alert('Error removing image from gallery');
      }
    }
  };

  const handleUtilityUpload = async () => {
    if (!fileToUpload) {
      alert("Please select a file to upload.");
      return;
    }
    triggerHaptic();
    setIsUploadingFile(true);
    setUploadedFileUrl('');
    try {
      const { file_url } = await UploadFile({ file: fileToUpload });
      setUploadedFileUrl(file_url);
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard!");
    triggerHaptic("success");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Admin Dashboard
            </h1>
            <p className="text-white/80">Manage orders, images, and public gallery</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-2 border border-white/20 shadow-xl inline-flex gap-2">
            <button
              onClick={() => {
                triggerHaptic(); // Haptic feedback on tab change
                setActiveTab("orders");
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === "orders" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
            >
              Order Fulfillment
            </button>
            <button
              onClick={() => {
                triggerHaptic(); // Haptic feedback on tab change
                setActiveTab("gallery");
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === "gallery" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}`}
            >
              Manage Gallery
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        ) : activeTab === 'orders' ? (
            orders.length > 0 ? (
                <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="p-4">Customer</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Package</th>
                          <th className="p-4">Status</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const orderImages = allUserImages.filter(img => img.order_id === order.id);
                          const packageDetails = getPackageDetails(order.package_type);
                          const completedCount = orderImages.filter(img => img.status === 'completed').length;
                          const totalImages = packageDetails.images;
                          const isComplete = completedCount === totalImages;

                          return (
                            <tr key={order.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="p-4">{order.created_by}</td>
                              <td className="p-4">{new Date(order.created_date).toLocaleDateString()}</td>
                              <td className="p-4">{packageDetails.name}</td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isComplete ? 'bg-green-500/30 text-green-300' : 'bg-orange-500/30 text-orange-300'
                                }`}>
                                  {completedCount} / {totalImages} Completed
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <Link
                                  to={createPageUrl("AdminOrderDetail") + `?orderId=${order.id}`}
                                  onClick={triggerHaptic} // Haptic feedback on navigation click
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 hover:bg-white/30 transition-all font-semibold"
                                >
                                  <Edit className="w-4 h-4" />
                                  Manage
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
            ) : (
                <div className="text-center py-20 backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
                    <h3 className="text-2xl font-bold text-white">No orders yet!</h3>
                    <p className="text-white/80 mt-2">Check back here when you get your first customer.</p>
                </div>
            )
        ) : ( // Gallery Tab
          <div className="space-y-8">
            {/* Add to Gallery Form */}
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Add to Public Gallery</h2>
              <form onSubmit={handleAddToGallery} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-white font-medium mb-3">Select Image</label>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setGalleryForm({ ...galleryForm, image: e.target.files[0] })}
                    className="block w-full text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/20 file:text-white file:cursor-pointer hover:file:bg-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-3">Caption</label>
                  <textarea
                    value={galleryForm.caption}
                    onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                    placeholder="Write a caption for this featured image..."
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="3" required
                  />
                </div>
                <button type="submit" disabled={uploadingGallery} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50">
                  {uploadingGallery ? 'Adding...' : 'Add to Gallery'}
                </button>
              </form>
            </div>

            {/* Current Gallery Images */}
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Current Public Gallery ({galleryImages.length} images)</h2>
              
              {galleryImages.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-white/60 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Gallery Images</h3>
                  <p className="text-white/80">Add some images to the public gallery to showcase your work!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="bg-white/10 rounded-xl overflow-hidden border border-white/20">
                      <div className="relative">
                        <img
                          src={image.image_url}
                          alt={image.caption}
                          className="w-full aspect-square object-cover"
                        />
                        <button
                          onClick={() => handleRemoveFromGallery(image.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all"
                          title="Remove from gallery"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-white/90 text-sm leading-relaxed">{image.caption}</p>
                        <p className="text-white/60 text-xs mt-2">
                          Order: {image.featured_order} • Added {new Date(image.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* File Uploader Utility */}
        <div className="mt-8">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Wrench className="w-6 h-6"/>
                File Uploader Utility
              </h2>
              <p className="text-white/80 mb-6 max-w-2xl">Use this tool to upload a single file and get its URL. This is useful for manually correcting image records in the database.</p>
              
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-white font-medium mb-3">1. Select File</label>
                  <input
                    type="file"
                    onChange={(e) => setFileToUpload(e.target.files[0])}
                    className="block w-full text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/20 file:text-white file:cursor-pointer hover:file:bg-white/30"
                  />
                </div>

                <button 
                  onClick={handleUtilityUpload} 
                  disabled={isUploadingFile || !fileToUpload}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50"
                >
                  {isUploadingFile ? 'Uploading...' : '2. Get File URL'}
                </button>

                {uploadedFileUrl && (
                  <div className="pt-4">
                    <label className="block text-white font-medium mb-3">3. Copy URL</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text"
                        value={uploadedFileUrl}
                        readOnly
                        className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white/90"
                      />
                      <button 
                        onClick={() => copyToClipboard(uploadedFileUrl)}
                        className="p-3 bg-white/20 rounded-lg text-white hover:bg-white/30"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-5 h-5"/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
