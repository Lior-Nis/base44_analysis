
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SiteContent } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2, Loader2, UploadCloud, Video, FileImage } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";


export default function SectionEditor({ section, data, onUpdate }) {
  const [formData, setFormData] = useState(data || {});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null); // This ref is not explicitly used but kept as per outline for potential future use or debugging

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData((prev) => ({ ...prev, [fieldName]: file_url }));
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });
    } catch (error) {
      console.error(`Error uploading file for ${fieldName}:`, error);
      setUploadError(`Failed to upload ${file.name}. Please try again.`);
      toast({
        title: "Upload Failed",
        description: `Could not upload ${file.name}.`,
        variant: "destructive",
        icon: <AlertCircle className="h-5 w-5" />
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const dataToSave = { ...formData, section: section.toLowerCase() };
      if (!dataToSave.key && (section === "hero" || section === "join" || section === "footer")) {
        dataToSave.key = section; // Assign a default key for single-item sections if not present
      }


      if (formData.id) {
        await SiteContent.update(formData.id, dataToSave);
        toast({
          title: "Content updated",
          description: "Your changes have been saved successfully.",
          variant: "default",
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
        });
      } else {
        // For sections that should only have one item, try to find existing first
        if (section === "hero" || section === "join" || section === "footer") {
            const existing = await SiteContent.filter({ section: section.toLowerCase(), key: section });
            if (existing.length > 0) {
                await SiteContent.update(existing[0].id, dataToSave);
                 toast({
                    title: "Content updated",
                    description: `The ${section} section has been updated.`,
                    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
                });
            } else {
                await SiteContent.create(dataToSave);
                toast({
                    title: "Content created",
                    description: `New content for ${section} has been added.`,
                    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
                });
            }
        } else {
            await SiteContent.create(dataToSave);
            toast({
              title: "Content created",
              description: "New content has been added successfully.",
              variant: "default",
              icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
            });
        }
      }
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
        icon: <AlertCircle className="h-5 w-5" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">{formData.id ? "Edit" : "Add"} {section} Content</CardTitle>
        <CardDescription>
          Modify the content for the {section} section of your landing page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {section === "hero" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Headline</label>
                <Input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="Main headline"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hook Words</label>
                <Textarea
                  name="hook_words"
                  value={formData.hook_words || ""}
                  onChange={handleChange}
                  placeholder="Comma-separated words (e.g. Cleaner,Brighter,Smarter)"
                />
                <p className="text-xs text-gray-500">These are the changing words in your hero headline</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Hero description text"
                  rows={3}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Image URL (Fallback)</label>
                <div className="flex gap-2">
                    <Input
                    name="image_url"
                    value={formData.image_url || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="flex-grow"
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline"><FileImage className="h-4 w-4 mr-2" /> Upload Image</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Background Image</DialogTitle>
                                <DialogDescription>Select an image file to upload for the background.</DialogDescription>
                            </DialogHeader>
                            <Input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e.target.files[0], 'image_url')}
                                disabled={isUploading}
                            />
                            {isUploading && <div className="flex items-center space-x-2 mt-2"><Loader2 className="h-4 w-4 animate-spin" /> <span>Uploading...</span></div>}
                            {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                            {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-2 max-h-48 object-contain rounded" />}
                             <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" disabled={isUploading}>Done</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-xs text-gray-500">Image to display if the video doesn't load or as a poster.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Background Video URL</label>
                 <div className="flex gap-2">
                    <Input
                    name="background_video_url"
                    value={formData.background_video_url || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/video.mp4"
                    className="flex-grow"
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline"><Video className="h-4 w-4 mr-2" /> Upload Video</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Background Video</DialogTitle>
                                <DialogDescription>Select a video file (MP4 recommended) for the background.</DialogDescription>
                            </DialogHeader>
                            <Input 
                                type="file" 
                                accept="video/mp4,video/webm"
                                onChange={(e) => handleFileUpload(e.target.files[0], 'background_video_url')}
                                disabled={isUploading}
                            />
                            {isUploading && <div className="flex items-center space-x-2 mt-2"><Loader2 className="h-4 w-4 animate-spin" /> <span>Uploading...</span></div>}
                            {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                            {formData.background_video_url && (
                                <video src={formData.background_video_url} controls className="mt-2 max-h-48 w-full rounded" />
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" disabled={isUploading}>Done</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Video Poster Image URL</label>
                 <div className="flex gap-2">
                    <Input
                    name="video_poster_url"
                    value={formData.video_poster_url || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/video_poster.jpg"
                     className="flex-grow"
                    />
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline"><FileImage className="h-4 w-4 mr-2" /> Upload Poster</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Video Poster Image</DialogTitle>
                                <DialogDescription>This image will be shown while the video is loading.</DialogDescription>
                            </DialogHeader>
                            <Input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e.target.files[0], 'video_poster_url')}
                                disabled={isUploading}
                            />
                            {isUploading && <div className="flex items-center space-x-2 mt-2"><Loader2 className="h-4 w-4 animate-spin" /> <span>Uploading...</span></div>}
                            {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                            {formData.video_poster_url && <img src={formData.video_poster_url} alt="Poster Preview" className="mt-2 max-h-48 object-contain rounded" />}
                             <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" disabled={isUploading}>Done</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-xs text-gray-500">Optional: Image to display while the video loads. If empty, fallback image will be used.</p>
              </div>

              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Button Text</label>
                  <Input
                    name="button_text"
                    value={formData.button_text || ""}
                    onChange={handleChange}
                    placeholder="Join Our Mission"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Secondary Button Text</label>
                  <Input
                    name="secondary_button_text"
                    value={formData.secondary_button_text || ""}
                    onChange={handleChange}
                    placeholder="Learn More"
                  />
                </div>
              </div>
            </>
          )}

          {section === "impact" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Title</label>
                <Input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="Our Impact in Numbers"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Section description"
                  rows={3}
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <label className="text-sm font-medium">Stat Title</label>
                <Input
                  name="stat_title"
                  value={formData.stat_title || ""}
                  onChange={handleChange}
                  placeholder="250+"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stat Description</label>
                <Input
                  name="stat_description"
                  value={formData.stat_description || ""}
                  onChange={handleChange}
                  placeholder="Projects Completed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Input
                  name="icon"
                  value={formData.icon || ""}
                  onChange={handleChange}
                  placeholder="Icon name from Lucide (e.g. Zap, Sun, Leaf)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Image URL (for individual stat card)</label>
                <Input
                  name="image_url"
                  value={formData.image_url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  name="order"
                  value={formData.order || ""}
                  onChange={handleChange}
                  placeholder="1"
                />
              </div>
            </>
          )}

          {section === "projects" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Title (Shared)</label>
                <Input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="Our Projects"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Description (Shared)</label>
                <Textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Section description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Background Image URL (Shared)</label>
                <Input
                  name="image_url" // This is for the overall section background
                  value={formData.image_url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/section_bg.jpg"
                />
              </div>
              <Separator className="my-4" />
              <p className="font-medium text-gray-700">Individual Project Details:</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title</label>
                <Input
                  name="project_title"
                  value={formData.project_title || ""}
                  onChange={handleChange}
                  placeholder="Community Solar Programs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Description</label>
                <Textarea
                  name="project_description"
                  value={formData.project_description || ""}
                  onChange={handleChange}
                  placeholder="Project description"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Card Image URL</label>
                <Input
                  name="project_image_url" // This is for the individual project card
                  value={formData.project_image_url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/project_card_image.jpg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Input
                  name="icon"
                  value={formData.icon || ""}
                  onChange={handleChange}
                  placeholder="Icon name from Lucide (e.g. Sun, Wind, Leaf)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  name="order"
                  value={formData.order || ""}
                  onChange={handleChange}
                  placeholder="1"
                />
              </div>
            </>
          )}

          {section === "goals" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Title (Shared)</label>
                <Input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="Our Strategic Goals"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Description (Shared)</label>
                <Textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Section description"
                  rows={3}
                />
              </div>
              <Separator className="my-4" />
              <p className="font-medium text-gray-700">Individual Goal Details:</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Title</label>
                <Input
                  name="goal_title"
                  value={formData.goal_title || ""}
                  onChange={handleChange}
                  placeholder="Boost Renewables"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description (Card View)</label>
                <Input
                  name="short_description"
                  value={formData.short_description || ""}
                  onChange={handleChange}
                  placeholder="Brief description shown on card"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Long Description (Expanded View)</label>
                <Textarea
                  name="long_description"
                  value={formData.long_description || ""}
                  onChange={handleChange}
                  placeholder="Detailed description shown when expanded"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Input
                  name="icon"
                  value={formData.icon || ""}
                  onChange={handleChange}
                  placeholder="Icon name from Lucide (e.g. TrendingUp, ShieldCheck)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Image URL (Expanded View)</label>
                <Input
                  name="image_url"
                  value={formData.image_url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color Theme</label>
                <Select
                  value={formData.color || ""}
                  onValueChange={(value) => handleSelectChange("color", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color theme for card" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green-700">Green</SelectItem>
                    <SelectItem value="blue-700">Blue</SelectItem>
                    <SelectItem value="purple-700">Purple</SelectItem>
                    <SelectItem value="amber-700">Amber</SelectItem>
                    <SelectItem value="cyan-700">Cyan</SelectItem>
                    <SelectItem value="pink-700">Pink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  name="order"
                  value={formData.order || ""}
                  onChange={handleChange}
                  placeholder="1"
                />
              </div>
            </>
          )}

          {section === "join" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Title</label>
                <Input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="Join the Green Revolution"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Section description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Button Text (Form Submit)</label>
                <Input
                  name="button_text"
                  value={formData.button_text || ""}
                  onChange={handleChange}
                  placeholder="Submit Information"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Color</label>
                <Select
                  value={formData.color || "gray-100"} // Default to gray-100
                  onValueChange={(value) => handleSelectChange("color", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gray-100">Light Gray</SelectItem>
                    <SelectItem value="green-50">Light Green</SelectItem>
                    <SelectItem value="blue-50">Light Blue</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {section === "footer" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name</label>
                <Input
                  name="org_name"
                  value={formData.org_name || ""}
                  onChange={handleChange}
                  placeholder="Green Energy Alliance"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Organization description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="123 Green Street, New York, NY"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="info@greenenergyalliance.org"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Newsletter Button Text</label>
                <Input
                  name="newsletter_button_text"
                  value={formData.newsletter_button_text || ""}
                  onChange={handleChange}
                  placeholder="Subscribe"
                />
              </div>
            </>
          )}

          <Button 
            type="submit" 
            className="mt-8 w-full"
            disabled={isLoading || isUploading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save Changes</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
