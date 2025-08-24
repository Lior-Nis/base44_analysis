
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileImage, X } from "lucide-react"; // Removed Camera icon

export default function ImageUploadZone({ onFileUpload, isProcessing }) { // Added isProcessing prop
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/dicom')) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.dcm,.dicom" // Kept DICOM support as per description
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <FileImage className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upload X-ray Image</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Drag and drop your X-ray image here, or click to browse. Supports JPEG, PNG, and DICOM formats.
              </p>
              <div className="flex gap-3 justify-center"> {/* Kept flex container for consistency, though only one button remains */}
                <Button 
                  onClick={handleBrowseClick}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
                {/* Removed "Use Camera" button */}
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Maximum file size: 50MB • Supported: JPEG, PNG, DICOM
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <FileImage className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                onClick={handleUpload}
                disabled={isProcessing} // Disable button when processing
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                {isProcessing ? "Uploading..." : "Upload and Continue"} {/* Change button text when processing */}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
