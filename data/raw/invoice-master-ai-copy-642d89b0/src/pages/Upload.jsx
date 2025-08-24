
import React, { useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Upload as UploadIcon, FileText, Camera, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Progress } from "@/components/ui/progress";

import InvoicePreview from "../components/upload/InvoicePreview";

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (droppedFiles.length === 0) {
      setError("Please upload PDF or image files only");
      return;
    }

    processFiles(droppedFiles);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      file => file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (selectedFiles.length === 0) {
      setError("Please upload PDF or image files only");
      return;
    }

    processFiles(selectedFiles);
  };

  const processFiles = async (newFiles) => {
    if (newFiles.length === 0) return;
    
    setFiles(newFiles);
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const file = newFiles[0];
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(95, prev + 10));
      }, 200);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: await base44.entities.Invoice.schema()
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.status === "success" && result.output) {
        setCurrentPreview({
          ...result.output,
          file_url,
          file_name: file.name
        });
      } else {
        throw new Error("Couldn't extract data from the invoice");
      }
    } catch (error) {
      setError(`Error processing invoice. Please try again.`);
      console.error("Error processing invoice:", error);
    }

    setProcessing(false);
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      await base44.entities.Invoice.create(invoiceData);
      setUploadComplete(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);
    } catch (error) {
      setError("Error saving invoice. Please try again.");
    }
  };

  const cancelPreview = () => {
    setCurrentPreview(null);
    setFiles([]);
    setProgress(0);
  };

  return (
    <div className="p-10">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="glass-light hover:glass-hover text-white rounded-xl w-10 h-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-light text-glass">Upload Invoice</h1>
          <p className="text-glass-muted text-sm mt-1">Process and store your business expenses</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500/30 text-white">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadComplete && (
        <div className="glass-light rounded-2xl p-8 mb-6 text-center">
          <div className="glass-light w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-glass text-xl font-medium mb-2">Invoice Saved Successfully!</h3>
          <p className="text-glass-muted">Redirecting to dashboard...</p>
        </div>
      )}

      {!currentPreview && !uploadComplete && (
        <Card className="glass-light border-0 rounded-2xl">
          <CardContent className="p-0">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`transition-all duration-300 rounded-2xl ${
                dragActive ? "glass-hover" : ""
              }`}
            >
              <div className="p-12 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {processing ? (
                  <div className="space-y-6">
                    <div className="glass-light w-20 h-20 rounded-2xl mx-auto flex items-center justify-center">
                      <FileText className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-glass text-xl font-medium">Processing Invoice...</h3>
                      <div className="w-full max-w-xs mx-auto">
                        <Progress value={progress} className="h-2" />
                      </div>
                      <p className="text-glass-muted text-sm">Extracting data from your invoice</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="glass-light w-20 h-20 rounded-2xl mx-auto flex items-center justify-center">
                      <UploadIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-glass text-xl font-medium">Drop your invoice here</h3>
                      <p className="text-glass-muted">Or click to browse files</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="glass-darker hover:glass-hover text-white border-0 rounded-xl px-8"
                      >
                        Choose Files
                      </Button>
                    </div>
                    <p className="text-glass-muted text-xs">Supports PDF, PNG, JPEG files</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentPreview && !uploadComplete && (
        <InvoicePreview
          extractedData={currentPreview}
          onSave={handleSaveInvoice}
          onCancel={cancelPreview}
        />
      )}
    </div>
  );
}
