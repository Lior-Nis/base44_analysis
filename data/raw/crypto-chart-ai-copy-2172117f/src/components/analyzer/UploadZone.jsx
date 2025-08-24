import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Image as ImageIcon, Loader2 } from "lucide-react";

export default function UploadZone({ onFileUpload, isAnalyzing, uploadedFile }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = React.useState(false);

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
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onFileUpload(file);
      }
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardContent className="p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <div
          className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
            dragActive 
              ? "border-blue-400 bg-blue-400/10" 
              : "border-slate-600 hover:border-slate-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isAnalyzing ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Analyseren...</h3>
              <p className="text-slate-400 mb-4">
                Onze AI analyseert je chart met professionele precisie
              </p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Chart Screenshot</h3>
              <p className="text-slate-400 mb-6">
                Sleep je bestand hierheen of klik om te uploaden
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={openFileDialog}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Kies Bestand
                </Button>
                <Button
                  variant="outline"
                  onClick={openFileDialog}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Van Camera
                </Button>
              </div>

              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-400">
                  Ondersteunde formaten: PNG, JPG, JPEG
                  <br />
                  Max bestandsgrootte: 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}