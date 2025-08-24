
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { PendingOrder } from "@/api/entities";
import { PendingImage } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Upload, Camera, ArrowLeft, Send, X, Plus, Image as ImageIcon, CreditCard } from "lucide-react";
import { useHapticFeedback } from "../components/useHapticFeedback.js"; // Changed import path

export default function CreateOrder() {
  const navigate = useNavigate();
  const triggerHaptic = useHapticFeedback();
  const [user, setUser] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [imageUploads, setImageUploads] = useState([{ file: null, previewUrl: null, prompt: "" }]);
  const [publicGalleryConsent, setPublicGalleryConsent] = useState(false);
  const [uploading, setUploading] = useState(false);

  const packages = {
    "5_images": { name: "Starter Pack", images: 5, price: 5 }, // Price changed back to 5 for Starter Pack
    "10_images": { name: "Popular Pack", images: 10, price: 10 },
    "15_images": { name: "Ultimate Pack", images: 15, price: 15 }
  };

  useEffect(() => {
    checkAuth();
    parseUrlParams();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      User.loginWithRedirect(window.location.href);
    }
  };

  const parseUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const packageParam = urlParams.get('package');
    if (packageParam && packages[packageParam]) {
      setSelectedPackage(packageParam);
      // Initialize the correct number of image upload slots
      const packageImages = packages[packageParam].images;
      setImageUploads(Array(packageImages).fill(null).map(() => ({ file: null, previewUrl: null, prompt: "" })));
    } else {
      navigate(createPageUrl("Home"));
    }
  };

  const handleFileSelect = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newUploads = [...imageUploads];
        newUploads[index] = {
          ...newUploads[index],
          file,
          previewUrl: e.target.result
        };
        setImageUploads(newUploads);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptChange = (index, prompt) => {
    const newUploads = [...imageUploads];
    newUploads[index] = {
      ...newUploads[index],
      prompt
    };
    setImageUploads(newUploads);
  };

  const removeImage = (index) => {
    triggerHaptic();
    const newUploads = [...imageUploads];
    newUploads[index] = { file: null, previewUrl: null, prompt: "" };
    setImageUploads(newUploads);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validUploads = imageUploads.filter(upload => upload.file && upload.prompt.trim());
    const pkg = packages[selectedPackage];
    
    if (validUploads.length !== pkg.images) {
      alert(`Please upload all ${pkg.images} images with transformation prompts`);
      return;
    }

    setUploading(true);

    try {
      // Create pending order
      const pendingOrder = await PendingOrder.create({
        package_type: selectedPackage,
        public_gallery_consent: publicGalleryConsent,
        status: "pending"
      });

      // Upload all images and create pending image records
      for (const upload of validUploads) {
        const { file_url } = await UploadFile({ file: upload.file });
        
        await PendingImage.create({
          original_image_url: file_url,
          transformation_request: upload.prompt,
          pending_order_id: pendingOrder.id
        });
      }

      // Navigate to checkout with pending order ID
      navigate(createPageUrl("Checkout") + `?pending_order=${pendingOrder.id}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert("Error uploading images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!selectedPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <p className="text-white text-center">Invalid package selection</p>
        </div>
      </div>
    );
  }

  const pkg = packages[selectedPackage];
  const validUploads = imageUploads.filter(upload => upload.file && upload.prompt.trim());

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => {
              triggerHaptic();
              navigate(createPageUrl("Home"));
            }}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Packages
          </button>
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Setup Your {pkg.name}</h1>
            <p className="text-white/80">Upload your {pkg.images} dog photos and describe how you'd like each transformed</p>
            <div className="mt-4 inline-block bg-white/10 rounded-lg px-4 py-2 border border-white/20">
              <span className="text-white font-semibold">Total: ${pkg.price}</span>
              <span className="text-white/80 ml-2">• {pkg.images} transformations</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Progress indicator */}
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Upload Progress</span>
                <span className="text-white">{validUploads.length}/{pkg.images} completed</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${(validUploads.length / pkg.images) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Image Upload Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {imageUploads.map((upload, index) => (
                <div key={index} className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Photo #{index + 1}
                    </h3>
                    {upload.file && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        triggerHaptic();
                        handleFileSelect(index, e.target.files[0]);
                      }}
                      className="hidden"
                      id={`file-upload-${index}`}
                    />
                    <label
                      htmlFor={`file-upload-${index}`}
                      className="block w-full p-4 border-2 border-dashed border-white/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {upload.previewUrl ? (
                        <div className="space-y-2">
                          <img
                            src={upload.previewUrl}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg mx-auto"
                          />
                          <p className="text-white/80 text-sm text-center">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <ImageIcon className="w-8 h-8 text-white/60 mx-auto" />
                          <div>
                            <p className="text-white font-medium">Upload dog photo</p>
                            <p className="text-white/60 text-sm">JPG, PNG up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Transformation Prompt */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      How should we transform this photo?
                    </label>
                    <textarea
                      value={upload.prompt}
                      onChange={(e) => handlePromptChange(index, e.target.value)}
                      placeholder="Describe your vision... (e.g., 'Make my dog look like a superhero with a cape', 'Put my dog in a fantasy forest setting')"
                      className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery Consent */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Gallery Showcase Permission</h3>
              <p className="text-white/80 mb-4">
                Would you like to give us permission to potentially feature your completed transformations 
                in our public gallery? This helps inspire other dog owners and showcases our work.
              </p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="consent"
                    value="true"
                    checked={publicGalleryConsent === true}
                    onChange={() => setPublicGalleryConsent(true)}
                    className="w-5 h-5 text-purple-500 mt-0.5"
                  />
                  <span className="text-white">Yes, you may feature my dog's transformations in the public gallery</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="consent"
                    value="false"
                    checked={publicGalleryConsent === false}
                    onChange={() => setPublicGalleryConsent(false)}
                    className="w-5 h-5 text-purple-500 mt-0.5"
                  />
                  <span className="text-white">No, please keep my images private</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                onClick={triggerHaptic}
                disabled={uploading || validUploads.length !== pkg.images}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Preparing your order...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment (${pkg.price})
                  </div>
                )}
              </button>
              
              {validUploads.length !== pkg.images && (
                <p className="text-white/70 text-sm mt-3">
                  Please upload all {pkg.images} photos with descriptions to continue
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
