import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function ImageUploader({ onImageUploaded, currentImage }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadImage(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const result = await UploadFile({ file });
      onImageUploaded(result.file_url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  const removeImage = () => {
    onImageUploaded(null);
  };

  return (
    <Card className="bg-white border-yellow-500/30 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-2">Upload Your Design</h3>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Add your logo or inspiration image</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-medium mb-1">
                  📝 <strong>Not Required</strong> - This step is optional
                </p>
                <p className="text-blue-700 text-xs leading-relaxed">
                  Only upload an image if you have a specific logo, design, or reference photo. 
                  You can fully describe your jewelry design using the selection tools below.
                </p>
              </div>
            </div>
          </div>

          {!currentImage ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
                dragActive 
                  ? "border-yellow-500 bg-yellow-50" 
                  : "border-gray-300 hover:border-yellow-500 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-50 border border-yellow-200 rounded-full flex items-center justify-center">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-yellow-600" />
                  )}
                </div>
                
                {uploading ? (
                  <p className="text-black font-medium">Uploading...</p>
                ) : (
                  <>
                    <p className="text-black font-medium mb-2">Drop your image here</p>
                    <p className="text-gray-600 text-sm mb-4">or click to browse</p>
                    <Button 
                      variant="outline" 
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Select Image
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="aspect-video rounded-xl overflow-hidden border border-yellow-500/30">
                <img 
                  src={currentImage} 
                  alt="Uploaded design" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white border-red-500 text-red-600 hover:bg-red-50"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}