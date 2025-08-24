import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadFile } from "@/api/integrations";
import { Loader2, Image as ImageIcon, Check } from "lucide-react";

export default function ImageUploader({ onImageUploaded, currentImageUrl }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      onImageUploaded(file_url);
      setPreviewUrl(file_url);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Upload New Image</label>
          <div className="mt-2 flex items-center gap-3">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="whitespace-nowrap"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  {file ? "Upload" : "Select File"}
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Image URL</label>
          <Input
            value={previewUrl}
            onChange={(e) => {
              setPreviewUrl(e.target.value);
              onImageUploaded(e.target.value);
            }}
            placeholder="https://example.com/image.jpg"
            className="mt-2"
          />
        </div>
      </div>

      {previewUrl && (
        <div className="border rounded-md p-2 max-w-md">
          <div className="text-sm font-medium mb-2 flex items-center">
            <ImageIcon className="h-4 w-4 mr-2" />
            Image Preview
          </div>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-36 object-contain"
          />
        </div>
      )}
    </div>
  );
}