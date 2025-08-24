
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { UserImage } from "@/api/entities";
import { Link } from "react-router-dom"; 
import { createPageUrl } from "@/utils";
import { Camera, Upload, Image, Package, Clock, CheckCircle, Plus, Eye, X, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHapticFeedback } from "../components/useHapticFeedback.js";

export default function Dashboard() {
  const triggerHaptic = useHapticFeedback();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      User.loginWithRedirect(window.location.href);
    }
  };

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      const [userOrders, images] = await Promise.all([
        Order.filter({ created_by: currentUser.email }, '-created_date'),
        UserImage.filter({ created_by: currentUser.email }, '-created_date')
      ]);
      
      setOrders(userOrders);
      setUserImages(images);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownload = async (imageUrl) => {
    triggerHaptic();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `puppack-transformation-${selectedImage.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  const handleShare = async (imageUrl) => {
    triggerHaptic();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(imageUrl);
        alert("Image URL copied to clipboard! You can now paste it anywhere to share.");
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: 'My PupPack Transformation!',
          text: 'Check out this amazing AI-powered transformation from PupPack!',
          url: imageUrl,
        });
        return;
      }

      prompt("Copy this URL to share your image:", imageUrl);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Share failed:", error);
        try {
          await navigator.clipboard.writeText(imageUrl);
          alert("Sharing failed, but the image URL has been copied to your clipboard!");
        } catch (clipboardError) {
          prompt("Copy this URL to share your image:", imageUrl);
        }
      }
    }
  };

  const handleImageError = (imageId) => {
    setImageLoadErrors(prev => new Set(prev).add(imageId));
  };

  const LazyImage = ({ src, alt, className, onClick, status }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const imgRef = React.useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, [src]);

    return (
      <div ref={imgRef} className={className} onClick={onClick}>
        {imageSrc && (
          <img
            src={imageSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => handleImageError(imageSrc)}
            loading="lazy"
          />
        )}
        {!imageLoaded && (
          <div className="w-full h-full bg-white/10 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        {status && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              status === 'completed' 
                ? 'bg-green-500/80 text-white' 
                : status === 'in_progress'
                ? 'bg-yellow-500/80 text-white'
                : 'bg-gray-500/80 text-white'
            }`}>
              {status === 'completed' ? 'Done' : status === 'in_progress' ? 'In Progress' : 'Pending'}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.full_name}!</h1>
            <p className="text-white/80">View your transformations and manage your orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          /* No Orders State */
          <div className="text-center py-20">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 shadow-xl">
              <Package className="w-16 h-16 text-white/60 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Orders Yet</h3>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Start your journey by purchasing a transformation package and upload your dog photos!
              </p>
              <Link
                to={createPageUrl("Home")}
                onClick={triggerHaptic}
                className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  color: 'white'
                }}
              >
                <Plus className="w-5 h-5" />
                Purchase Your First Pack
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{orders.length}</p>
                    <p className="text-white/80">Total Orders</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{userImages.filter(img => img.status === 'completed').length}</p>
                    <p className="text-white/80">Completed</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{userImages.filter(img => img.status !== 'completed').length}</p>
                    <p className="text-white/80">In Progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Gallery */}
            <div className="backdrop-blur-md bg-white/10 rounded-2xl pt-8 md:p-8 border border-white/20 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-8 md:px-0">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Image className="w-6 h-6" />
                  Your Personal Gallery
                </h2>
                <Link
                  to={createPageUrl("Home")}
                  onClick={triggerHaptic}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 text-white rounded-xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: 'white'
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span className="sm:hidden">Order More</span>
                  <span className="hidden sm:inline">Order More Transformations</span>
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-2 md:gap-6">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="animate-pulse aspect-[3/4] md:aspect-square bg-white/20 md:rounded-xl"></div>
                  ))}
                </div>
              ) : userImages.length === 0 ? (
                <div className="text-center py-12 px-8 md:px-0">
                  <Camera className="w-16 h-16 text-white/60 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Images Yet</h3>
                  <p className="text-white/80">Purchase a transformation package to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                  {userImages.map((image) => (
                    <div 
                      key={image.id} 
                      className="group bg-white/10 md:rounded-xl overflow-hidden md:border md:border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                      onClick={() => {
                        if (image.status === 'completed') {
                          triggerHaptic();
                          setSelectedImage(image);
                        }
                      }}
                    >
                      <div className="relative">
                        <LazyImage
                          src={image.transformed_image_url || image.original_image_url}
                          alt="Dog transformation"
                          className="w-full aspect-[3/4] md:aspect-square relative"
                          status={image.status}
                        />
                        {image.status === 'completed' && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex items-center gap-2 text-white">
                              <Eye className="w-5 h-5" />
                              <span className="hidden md:inline text-sm font-medium">View</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="hidden md:block p-4">
                        <p className="text-white/90 text-sm truncate">{image.transformation_request}</p>
                        <p className="text-white/60 text-xs mt-2">
                          Uploaded {new Date(image.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Optimized Image Comparison Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              triggerHaptic();
              setSelectedImage(null);
            }}
          >
            <div
              className="max-w-6xl w-full max-h-[90vh] backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-white/20">
                <h3 className="text-xl font-bold text-white">Before & After Comparison</h3>
                <button
                  onClick={() => {
                    triggerHaptic();
                    setSelectedImage(null);
                  }}
                  className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-grow p-6 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Original Photo</h4>
                    <img
                      src={selectedImage.original_image_url}
                      alt="Original"
                      className="w-full aspect-square object-cover rounded-xl"
                      loading="eager"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-3">Transformed Photo</h4>
                    <img
                      src={selectedImage.transformed_image_url}
                      alt="Transformed"
                      className="w-full aspect-square object-cover rounded-xl"
                      loading="eager"
                    />
                    <div className="flex gap-4 mt-4">
                      <Button
                        onClick={() => handleDownload(selectedImage.transformed_image_url)}
                        className="flex-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleShare(selectedImage.transformed_image_url)}
                        className="flex-1 text-white"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                          color: 'white'
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <h4 className="text-white font-semibold mb-2">Transformation Request</h4>
                  <p className="text-white/80 text-sm">{selectedImage.transformation_request}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
