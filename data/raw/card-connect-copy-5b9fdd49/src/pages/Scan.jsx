
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Contact } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  Loader2, 
  ArrowLeft,
  MapPin,
  CalendarIcon,
  Tag,
  AlertCircle,
  UserPlus,
  FileText,
  Edit,
  QrCode,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Scan() {
  const navigate = useNavigate();
  const [step, setStep] = useState("upload"); // upload, review, success
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [contactData, setContactData] = useState({
    full_name: "",
    company: "",
    job_title: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    notes: "",
    location_met: "",
    event_met: "",
    date_met: new Date().toISOString().split('T')[0],
    tags: [],
    image_url: "",
    qr_code_data: ""
  });
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [eventInput, setEventInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);
  const [newContactId, setNewContactId] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [inputMethod, setInputMethod] = useState("scan"); // scan, manual
  const [uploadError, setUploadError] = useState(null);
  const [qrCodeScanning, setQrCodeScanning] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [keepImage, setKeepImage] = useState(true);
  const [commonTags, setCommonTags] = useState([
    "client", "prospect", "vendor", "partner", "investor", 
    "networking", "conference", "sales", "marketing", "engineering",
    "design", "management", "finance", "hr", "operations"
  ]);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Check if geolocation is available in the browser
    if (navigator.geolocation && useCurrentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address from coordinates
          // This is a simplified version - in a real app, you might use a geocoding service
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              if (data && data.address) {
                const place = data.address.city || data.address.town || data.address.village || data.address.suburb;
                if (place) {
                  setContactData(prev => ({
                    ...prev,
                    location_met: place
                  }));
                }
              }
            })
            .catch(error => {
              console.error("Error getting location name:", error);
            });
          
          setGeoLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          setUseCurrentLocation(false);
        }
      );
    }
  }, [useCurrentLocation]);
  
  // When camera dialog opens/closes
  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      // Cleanup function to stop camera when component unmounts
      stopCamera();
    };
  }, [showCamera]);
  
  // Import QR code scanning library dynamically when needed
  useEffect(() => {
    if (showCamera && qrCodeScanning && cameraActive) {
      const qrScanner = async () => {
        try {
          // Using dynamic import to load the QR scanner only when needed
          const jsQR = await import('jsqr');
          
          const scanQRCode = () => {
            if (!videoRef.current || !cameraActive) return;
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const video = videoRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR.default(imageData.data, imageData.width, imageData.height);
            
            if (code) {
              console.log("QR Code found:", code.data);
              setQrCodeData(code.data);
              setContactData(prev => ({
                ...prev,
                qr_code_data: code.data
              }));
              
              // Try to parse the QR code data for contact information
              try {
                // Common formats: vCard, meCard, or just a URL
                if (code.data.startsWith("BEGIN:VCARD")) {
                  parseVCard(code.data);
                } else if (code.data.startsWith("MECARD:")) {
                  parseMeCard(code.data);
                } else if (code.data.startsWith("http")) {
                  // It's just a URL, add it as a note or website
                  setContactData(prev => ({
                    ...prev,
                    website: code.data,
                    notes: `QR Code URL: ${code.data}\n${prev.notes || ''}`
                  }));
                }
              } catch (error) {
                console.error("Error parsing QR code:", error);
              }
            }
            
            if (showCamera && qrCodeScanning) {
              requestAnimationFrame(scanQRCode);
            }
          };
          
          scanQRCode();
        } catch (error) {
          console.error("Error loading QR scanner:", error);
        }
      };
      
      qrScanner();
    }
  }, [showCamera, qrCodeScanning, cameraActive]);
  
  // Parse vCard format
  const parseVCard = (vcard) => {
    const getName = () => {
      const match = vcard.match(/FN:(.*?)(?:\r?\n|$)/);
      return match ? match[1].trim() : '';
    };
    
    const getCompany = () => {
      const match = vcard.match(/ORG:(.*?)(?:\r?\n|$)/);
      return match ? match[1].trim() : '';
    };
    
    const getJobTitle = () => {
      const match = vcard.match(/TITLE:(.*?)(?:\r?\n|$)/);
      return match ? match[1].trim() : '';
    };
    
    const getEmail = () => {
      const match = vcard.match(/EMAIL[^:]*:(.*?)(?:\r?\n|$)/);
      return match ? match[1].trim() : '';
    };
    
    const getPhone = () => {
      const match = vcard.match(/TEL[^:]*:(.*?)(?:\r?\n|$)/);
      return match ? match[1].trim() : '';
    };
    
    const getAddress = () => {
      const match = vcard.match(/ADR[^:]*:(.*?)(?:\r?\n|$)/);
      return match ? match[1].trim().replace(/;/g, ', ') : '';
    };
    
    const getWebsite = () => {
      const match = vcard.match(/URL:(.*?)(?:\r?\n|$)/);
      return match ? match[1].trim() : '';
    };
    
    setContactData(prev => ({
      ...prev,
      full_name: getName() || prev.full_name,
      company: getCompany() || prev.company,
      job_title: getJobTitle() || prev.job_title,
      email: getEmail() || prev.email,
      phone: getPhone() || prev.phone,
      address: getAddress() || prev.address,
      website: getWebsite() || prev.website
    }));
  };
  
  // Parse meCard format (used by some QR generators)
  const parseMeCard = (mecard) => {
    const getField = (field) => {
      const regex = new RegExp(`${field}:([^;]+)`);
      const match = mecard.match(regex);
      return match ? match[1].trim() : '';
    };
    
    setContactData(prev => ({
      ...prev,
      full_name: getField('N') || prev.full_name,
      company: getField('ORG') || prev.company,
      job_title: getField('TITLE') || prev.job_title,
      email: getField('EMAIL') || prev.email,
      phone: getField('TEL') || prev.phone,
      address: getField('ADR') || prev.address,
      website: getField('URL') || prev.website
    }));
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageSelection(file);
    }
  };
  
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleImageSelection(file);
    }
  };
  
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleImageSelection = (file) => {
    setImage(file);
    setUploadError(null);
    
    // Create preview URL for image display
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    processImage(file);
  };
  
  const processImage = async (file) => {
    setLoading(true);
    
    try {
      // Upload the file
      const { file_url } = await UploadFile({ file });
      setImageUrl(file_url);
      
      // Extract data using OCR
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: Contact.schema()
      });
      
      if (result.status === "success" && result.output) {
        setExtractedData(result.output);
        
        // Pre-populate form with extracted data
        setContactData(prev => ({
          ...prev,
          ...result.output,
          image_url: keepImage ? file_url : ""
        }));
        
        // Move to review step
        setStep("review");
      } else {
        // If extraction failed, still allow manual entry
        setContactData(prev => ({
          ...prev,
          image_url: keepImage ? file_url : ""
        }));
        setStep("review");
        setUploadError("We couldn't read all the information from your card. Please verify and complete the details below.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setUploadError("There was a problem processing your image. Please try again or enter the information manually.");
    }
    
    setLoading(false);
  };
  
  const startCamera = async () => {
    setCameraError(null);
    
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser doesn't support camera access. Try uploading a file instead.");
        return;
      }
      
      console.log("Starting camera...");
      
      // Stop any existing stream first
      stopCamera();
      
      const constraints = { 
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log("Requesting media with constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("Stream obtained:", stream);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log("Setting video source");
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          videoRef.current.play()
            .then(() => {
              console.log("Video playing");
              setCameraActive(true);
            })
            .catch(err => {
              console.error("Error playing video:", err);
              setCameraError("Failed to start video: " + err.message);
            });
        };
      } else {
        console.error("Video ref is null");
        setCameraError("Camera initialization failed. Please try again.");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      
      let errorMessage = "Unable to access camera.";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Camera permission denied. Please enable camera access in your browser settings and try again.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "No camera found on your device.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = "Camera is already in use by another application.";
      } else {
        errorMessage = `Camera error: ${error.name} - ${error.message}`;
      }
      
      setCameraError(errorMessage);
      setCameraActive(false);
    }
  };
  
  const stopCamera = () => {
    console.log("Stopping camera...");
    
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      console.log(`Stopping ${tracks.length} tracks`);
      
      tracks.forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      console.log("Clearing video source");
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };
  
  const capturePhoto = () => {
    if (!videoRef.current || !cameraActive) {
      console.error("Video not ready for capture");
      setCameraError("Camera is not ready for capture. Please try again.");
      return;
    }
    
    try {
      console.log("Capturing photo...");
      
      const canvas = document.createElement('canvas');
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      console.log(`Video dimensions: ${videoWidth}x${videoHeight}`);
      
      if (videoWidth === 0 || videoHeight === 0) {
        setCameraError("Camera not ready yet. Please wait a moment and try again.");
        return;
      }
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to create image blob");
          setCameraError("Failed to capture image. Please try again.");
          return;
        }
        
        console.log(`Image captured: ${blob.size} bytes`);
        const file = new File([blob], `business-card-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setShowCamera(false);
        handleImageSelection(file);
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error("Error capturing photo:", error);
      setCameraError("Failed to capture photo: " + error.message);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateSelect = (date) => {
    setContactData(prev => ({
      ...prev,
      date_met: date.toISOString().split('T')[0]
    }));
  };
  
  const addTag = (tagToAdd = null) => {
    const tag = tagToAdd || tagInput.trim();
    
    if (tag && !contactData.tags.includes(tag)) {
      setContactData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove) => {
    setContactData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const exportVCard = () => {
    const { full_name, company, job_title, email, phone, website, address } = contactData;

    let vCardData = "BEGIN:VCARD\nVERSION:3.0\n";
    vCardData += `FN:${full_name}\n`;
    if (company) vCardData += `ORG:${company}\n`;
    if (job_title) vCardData += `TITLE:${job_title}\n`;
    if (email) vCardData += `EMAIL:${email}\n`;
    if (phone) vCardData += `TEL:${phone}\n`;
    if (website) vCardData += `URL:${website}\n`;
    if (address) vCardData += `ADR:${address}\n`;
    vCardData += "END:VCARD";

    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${full_name.replace(" ", "_") || "contact"}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const saveContact = async () => {
    setLoading(true);
    
    try {
      const result = await Contact.create(contactData);
      setNewContactId(result.id);
      setStep("success");
    } catch (error) {
      console.error("Error saving contact:", error);
    }
    
    setLoading(false);
  };
  
  const resetForm = () => {
    setImage(null);
    setImagePreview(null);
    setImageUrl(null);
    setExtractedData(null);
    setContactData({
      full_name: "",
      company: "",
      job_title: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      notes: "",
      location_met: "",
      event_met: "",
      date_met: new Date().toISOString().split('T')[0],
      tags: [],
      image_url: "",
      qr_code_data: ""
    });
    setStep("upload");
    setCameraError(null);
    setInputMethod("scan");
    setUploadError(null);
    setQrCodeData(null);
  };
  
  const createManualContact = () => {
    setInputMethod("manual");
    setStep("review");
  };
  
  if (step === "upload") {
    return (
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-6" 
          onClick={() => navigate(createPageUrl("Home"))}
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </Button>
        
        {cameraError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="scan" className="mb-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="scan" onClick={() => setInputMethod("scan")}>
              <Camera size={16} className="mr-2" /> Scan Card
            </TabsTrigger>
            <TabsTrigger value="manual" onClick={() => createManualContact()}>
              <UserPlus size={16} className="mr-2" /> Manual Entry
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Scan Business Card</CardTitle>
            <CardDescription>
              Upload or take a photo of a business card to add a new contact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed rounded-lg border-gray-300 p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Upload size={24} className="text-blue-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Upload Business Card
              </h3>
              <p className="text-gray-500 mb-4 text-sm">
                Drag & drop or click to browse your files
              </p>
              
              <Button variant="secondary" size="sm" className="mr-3">
                <Upload size={16} className="mr-2" /> Choose File
              </Button>
            </div>
            
            <div className="text-center mt-8">
              <div className="inline-flex items-center">
                <span className="text-gray-400 text-sm">or</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white" 
                onClick={() => setShowCamera(true)}
              >
                <Camera size={18} className="mr-2" /> Take a Photo
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-4 px-1">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="save-image"
                  checked={keepImage}
                  onCheckedChange={setKeepImage}
                />
                <Label htmlFor="save-image">Save card image</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="scan-qr"
                  checked={qrCodeScanning}
                  onCheckedChange={setQrCodeScanning}
                />
                <Label htmlFor="scan-qr">Detect QR codes</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Camera Dialog */}
        {showCamera && (
          <Dialog open={showCamera} onOpenChange={setShowCamera}>
            <DialogContent className="sm:max-w-xl p-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle className="flex items-center gap-2">
                  <Camera size={18} />
                  Take a Photo of the Business Card
                </DialogTitle>
                <DialogDescription>
                  Position the card within the frame and ensure good lighting
                  {qrCodeScanning && <span className="block mt-1">QR code detection is active</span>}
                </DialogDescription>
              </DialogHeader>
              
              <div className="relative aspect-video bg-black w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Video error:", e);
                    setCameraError(`Video error: ${e.target.error?.message || "Unknown error"}`);
                  }}
                />
                
                {!cameraActive && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span>Initializing camera...</span>
                    </div>
                  </div>
                )}
                
                {qrCodeData && qrCodeScanning && (
                  <div className="absolute top-4 left-4 right-4 bg-green-100/90 text-green-800 px-4 py-2 rounded-md flex items-center">
                    <QrCode className="mr-2 h-5 w-5" />
                    <div className="text-sm font-medium truncate">QR Code detected!</div>
                  </div>
                )}
                
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80 p-4">
                    <div className="flex flex-col items-center text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                      <span className="text-sm">{cameraError}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between p-4 border-t bg-gray-50">
                <Button variant="outline" onClick={() => setShowCamera(false)}>
                  <X size={18} className="mr-2" /> Cancel
                </Button>
                <Button 
                  className="bg-slate-800 hover:bg-slate-700 text-white" 
                  onClick={capturePhoto}
                  disabled={!cameraActive || !!cameraError}
                >
                  <ImageIcon size={18} className="mr-2" /> Capture Photo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <div className="flex flex-col items-center">
                <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Card</h3>
                <p className="text-gray-500 text-center">
                  We're extracting information from your business card. This may take a moment...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (step === "review") {
    return (
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-6" 
          onClick={() => setStep("upload")}
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">
              {inputMethod === "scan" ? "Review Contact Information" : "Add New Contact"}
            </CardTitle>
            <CardDescription>
              {inputMethod === "scan" 
                ? "Verify and complete the information extracted from the business card" 
                : "Enter the contact details manually"}
            </CardDescription>
            
            {uploadError && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            
            {contactData.qr_code_data && (
              <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                <QrCode className="h-4 w-4" />
                <AlertDescription>QR code information was detected and added to this contact</AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent className="grid gap-6">
            {inputMethod === "scan" && imagePreview && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img 
                      src={imagePreview} 
                      alt="Business card preview" 
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '220px' }}
                    />
                  </div>
                  {keepImage ? (
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <Check className="w-4 h-4 mr-1" /> Image will be saved with contact
                    </div>
                  ) : (
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <X className="w-4 h-4 mr-1" /> Image won't be saved with contact
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2 grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Full Name
                      </label>
                      <Input 
                        name="full_name"
                        value={contactData.full_name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Job Title
                      </label>
                      <Input 
                        name="job_title"
                        value={contactData.job_title}
                        onChange={handleInputChange}
                        placeholder="Marketing Director"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Company
                    </label>
                    <Input 
                      name="company"
                      value={contactData.company}
                      onChange={handleInputChange}
                      placeholder="Company name"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Email
                      </label>
                      <Input 
                        name="email"
                        value={contactData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Phone
                      </label>
                      <Input 
                        name="phone"
                        value={contactData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Manual entry form without image */}
            {inputMethod === "manual" && (
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block required">
                      Full Name
                    </label>
                    <Input 
                      name="full_name"
                      value={contactData.full_name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Job Title
                    </label>
                    <Input 
                      name="job_title"
                      value={contactData.job_title}
                      onChange={handleInputChange}
                      placeholder="Marketing Director"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Company
                  </label>
                  <Input 
                    name="company"
                    value={contactData.company}
                    onChange={handleInputChange}
                    placeholder="Company name"
                    className="w-full"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Email
                    </label>
                    <Input 
                      name="email"
                      value={contactData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Phone
                    </label>
                    <Input 
                      name="phone"
                      value={contactData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 8900"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Website
                </label>
                <Input 
                  name="website"
                  value={contactData.website || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Address
                </label>
                <Input 
                  name="address"
                  value={contactData.address || ''}
                  onChange={handleInputChange}
                  placeholder="123 Business St, City"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="border-t pt-6 mt-2">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Meeting Context
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                    <MapPin size={14} />
                    Where you met
                  </label>
                  <div className="relative">
                    <Input 
                      name="location_met"
                      value={contactData.location_met || ''}
                      onChange={handleInputChange}
                      placeholder="Location"
                      className="w-full pr-10"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                        >
                          <MapPin size={14} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Location</DialogTitle>
                          <DialogDescription>
                            Where did you meet this contact?
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="flex items-center gap-4">
                            <Input
                              value={locationInput}
                              onChange={(e) => setLocationInput(e.target.value)}
                              placeholder="Enter location"
                              className="flex-1"
                            />
                            <Button 
                              onClick={() => {
                                if (locationInput.trim()) {
                                  setContactData(prev => ({
                                    ...prev,
                                    location_met: locationInput.trim()
                                  }));
                                  setLocationInput("");
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className="flex items-center justify-center gap-2"
                            onClick={() => setUseCurrentLocation(true)}
                          >
                            <MapPin size={14} />
                            Use Current Location
                          </Button>
                          
                          {geoLocation && (
                            <div className="text-sm text-gray-500">
                              Location detected: {contactData.location_met}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                    <CalendarIcon size={14} />
                    Event Name
                  </label>
                  <div className="relative">
                    <Input 
                      name="event_met"
                      value={contactData.event_met || ''}
                      onChange={handleInputChange}
                      placeholder="Event or conference"
                      className="w-full pr-10"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                        >
                          <CalendarIcon size={14} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Event</DialogTitle>
                          <DialogDescription>
                            At what event did you meet this contact?
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="flex items-center gap-4">
                            <Input
                              value={eventInput}
                              onChange={(e) => setEventInput(e.target.value)}
                              placeholder="Enter event name"
                              className="flex-1"
                            />
                            <Button 
                              onClick={() => {
                                if (eventInput.trim()) {
                                  setContactData(prev => ({
                                    ...prev,
                                    event_met: eventInput.trim()
                                  }));
                                  setEventInput("");
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Recent Events</h4>
                            <div className="flex flex-wrap gap-2">
                              {["Tech Conference 2023", "Networking Lunch", "Industry Meetup"].map(event => (
                                <Badge 
                                  key={event}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setContactData(prev => ({
                                      ...prev,
                                      event_met: event
                                    }));
                                  }}
                                >
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                    <CalendarIcon size={14} />
                    Date Met
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {contactData.date_met ? (
                          <span>{format(new Date(contactData.date_met), "PPP")}</span>
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={contactData.date_met ? new Date(contactData.date_met) : new Date()}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                <Tag size={14} />
                Tags
              </label>
              
              {/* Tag selection dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  onValueChange={(value) => addTag(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Common Tags</SelectLabel>
                      {commonTags.map(tag => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Custom tag"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button onClick={() => addTag()}>Add</Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {contactData.tags && contactData.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X 
                      size={14} 
                      className="cursor-pointer opacity-70 hover:opacity-100"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Notes
              </label>
              <Textarea
                name="notes"
                value={contactData.notes || ''}
                onChange={handleInputChange}
                placeholder="Add notes about this contact"
                className="w-full min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={exportVCard}>
                <Download size={16} className="mr-2" />
                Export vCard
              </Button>
              <Button
                className="bg-slate-800 text-white hover:bg-slate-700"
                onClick={saveContact}
                disabled={loading || !contactData.full_name}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Save Contact
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (step === "success") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg border-0 text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Contact Saved Successfully!
            </h2>
            <p className="text-gray-500 mb-6">
              The contact information has been added to your database.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white" 
                onClick={resetForm}
              >
                <UserPlus size={16} className="mr-2" />
                Add Another Contact
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate(createPageUrl("Home"))}
              >
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
