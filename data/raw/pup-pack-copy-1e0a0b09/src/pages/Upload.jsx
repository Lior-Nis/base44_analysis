import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { UserImage } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Upload, Camera, ArrowLeft, Send, X, Plus, Image as ImageIcon } from "lucide-react";

export default function UploadPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [imageUploads, setImageUploads] = useState([{ file: null, previewUrl: null, prompt: "" }]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAuth();
    loadUserOrders();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      User.loginWithRedirect(window.location.href);
    }
  };

  const loadUserOrders = async () => {
    try {
      const userOrders = await Order.filter({ created_by: (await User.me()).email }, '-created_date');
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const remainingImages = orders.reduce((sum, order) => sum + (order.images_remaining || 0), 0);

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

  const addImageUpload = () => {
    if (imageUploads.length < remainingImages) {
      setImageUploads([...imageUploads, { file: null, previewUrl: null, prompt: "" }]);
    }
  };

  const removeImageUpload = (index) => {
    if (imageUploads.length > 1) {
      const newUploads = imageUploads.filter((_, i) => i !== index);
      setImageUploads(newUploads);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validUploads = imageUploads.filter(upload => upload.file && upload.prompt.trim());
    
    if (validUploads.length === 0) {
      alert("Please add at least one image with a transformation prompt");
      return;
    }

    if (validUploads.length > remainingImages) {
      alert(`You can only upload ${remainingImages} more images`);
      return;
    }

    setUploading(true);

    try {
      // Find the order with remaining images
      const orderWithImages = orders.find(order => order.images_remaining > 0);
      
      if (!orderWithImages) {
        throw new Error("No order found with remaining images");
      }

      // Upload all images and create records
      for (const upload of validUploads) {
        const { file_url } = await UploadFile({ file: upload.file });
        
        await UserImage.create({
          original_image_url: file_url,
          transformation_request: upload.prompt,
          order_id: orderWithImages.id,
          status: "pending"
        });
      }

      // Update the order to reduce remaining images
      await Order.update(orderWithImages.id, {
        images_remaining: orderWithImages.images_remaining - validUploads.length
      });

      // Navigate back to dashboard
      navigate(createPageUrl("Dashboard"));
      
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

  if (remainingImages <= 0) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 shadow-xl">
            <Camera className="w-16 h-16 text-white/60 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">No Images Remaining</h2>
            <p className="text-white/80 mb-8">
              You've used all your available transformations. Purchase a new pack to continue!
            </p>
            <Link
              to={createPageUrl("Home")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
            >
              Purchase New Pack
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validUploads = imageUploads.filter(upload => upload.file && upload.prompt.trim());

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Upload Your Dog Photos</h1>
            <p className="text-white/80">
              You have {remainingImages} transformation{remainingImages !== 1 ? 's' : ''} remaining. 
              Upload multiple photos at once!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload Cards */}
            <div className="space-y-6">
              {imageUploads.map((upload, index) => (
                <div key={index} className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Photo #{index + 1}
                    </h3>
                    {imageUploads.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUpload(index)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* File Upload */}
                    <div>
                      <label className="block text-white font-medium mb-3">Select Dog Photo</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelect(index, e.target.files[0])}
                          className="hidden"
                          id={`file-upload-${index}`}
                        />
                        <label
                          htmlFor={`file-upload-${index}`}
                          className="block w-full p-6 border-2 border-dashed border-white/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                        >
                          {upload.previewUrl ? (
                            <div className="space-y-3">
                              <img
                                src={upload.previewUrl}
                                alt="Preview"
                                className="w-24 h-24 object-cover rounded-lg mx-auto"
                              />
                              <p className="text-white/80 text-sm text-center">Click to change</p>
                            </div>
                          ) : (
                            <div className="text-center space-y-3">
                              <ImageIcon className="w-10 h-10 text-white/60 mx-auto" />
                              <div>
                                <p className="text-white font-medium">Click to upload</p>
                                <p className="text-white/60 text-sm">JPG, PNG up to 10MB</p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Transformation Prompt */}
                    <div>
                      <label className="block text-white font-medium mb-3">
                        Transformation Details
                      </label>
                      <textarea
                        value={upload.prompt}
                        onChange={(e) => handlePromptChange(index, e.target.value)}
                        placeholder="Describe how you'd like this specific dog photo to be transformed... (e.g., 'Make my dog look like a superhero with a cape', 'Put my dog in a fantasy forest setting')"
                        className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows="6"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            {imageUploads.length < remainingImages && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={addImageUpload}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Photo ({imageUploads.length}/{remainingImages})
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={uploading || validUploads.length === 0}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading {validUploads.length} photo{validUploads.length !== 1 ? 's' : ''}...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Submit {validUploads.length} Photo{validUploads.length !== 1 ? 's' : ''} for Transformation
                  </div>
                )}
              </button>
              
              {validUploads.length > 0 && (
                <p className="text-white/70 text-sm mt-3">
                  Ready to submit {validUploads.length} of {imageUploads.length} photos
                </p>
              )}
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-white/70">
            <p>Our team will transform your images within 24-48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}