import React, { useState, useEffect } from "react";
import { PublicGalleryImage } from "@/api/entities";
import { Heart, Eye, X } from "lucide-react";
import { useHapticFeedback } from "../components/useHapticFeedback.js";

export default function Gallery() {
  const triggerHaptic = useHapticFeedback();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  useEffect(() => {
    loadGalleryImages();
  }, []);

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

  const loadGalleryImages = async () => {
    try {
      const galleryImages = await PublicGalleryImage.list('-featured_order');
      setImages(galleryImages);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (imageId) => {
    setImageLoadErrors(prev => new Set(prev).add(imageId));
  };

  const LazyImage = ({ src, alt, className, onClick }) => {
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
            loading="lazy"
          />
        )}
        {!imageLoaded && (
          <div className="w-full h-full bg-white/10 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
            <h1 className="text-4xl font-bold text-white mb-4">Gallery Showcase</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Discover the amazing transformations our talented artists have created for our customers
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-4 md:gap-8">
            {Array(12).fill(0).map((_, index) => (
              <div
                key={index}
                className="aspect-[3/4] md:aspect-square bg-white/10 md:rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 shadow-xl">
              <Heart className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Gallery Coming Soon!</h3>
              <p className="text-white/80">
                We're working on featuring some amazing transformations. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {images.map((image) => (
              <div
                key={image.id}
                className="group backdrop-blur-md bg-white/10 md:rounded-2xl overflow-hidden md:border md:border-white/20 md:shadow-xl hover:bg-white/15 transition-all cursor-pointer"
                onClick={() => {
                  triggerHaptic();
                  setSelectedImage(image);
                }}
              >
                <div className="relative overflow-hidden">
                  <LazyImage
                    src={image.image_url}
                    alt={image.caption}
                    className="w-full aspect-[3/4] md:aspect-square relative"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center md:hidden">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 hidden md:flex items-center gap-2 text-white">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm font-medium">View Details</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block p-6">
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{image.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optimized Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              triggerHaptic();
              setSelectedImage(null);
            }}
          >
            <div
              className="max-w-4xl max-h-[90vh] backdrop-blur-md bg-white/10 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.caption}
                  className="w-full max-h-[70vh] object-contain"
                  loading="eager"
                />
                <button
                  onClick={() => {
                    triggerHaptic();
                    setSelectedImage(null);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-white/90 text-lg leading-relaxed">{selectedImage.caption}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}