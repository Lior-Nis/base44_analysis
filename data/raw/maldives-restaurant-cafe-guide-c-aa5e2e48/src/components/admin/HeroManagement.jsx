
import React, { useState, useEffect } from 'react';
import { HeroMedia } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Plus, Edit3, Trash2, Image as ImageIcon, Video, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HeroManagement() {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formState, setFormState] = useState({
    file_url: '',
    media_type: 'image',
    headline: '',
    subheadline: '',
    cta_text: '',
    cta_link: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const items = await HeroMedia.list('sort_order');
      setMediaItems(items);
    } catch (error) {
      console.error("Failed to load hero media:", error);
    }
    setIsLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormState({
      file_url: '', media_type: 'image', headline: '', subheadline: '',
      cta_text: '', cta_link: '', is_active: true, sort_order: mediaItems.length,
    });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormState(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hero item?")) {
      await HeroMedia.delete(id);
      loadMedia();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormState(prev => ({ ...prev, file_url }));
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed.");
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dataToSave = {
      ...formState,
      sort_order: Number(formState.sort_order)
    };

    try {
      if (editingItem) {
        await HeroMedia.update(editingItem.id, dataToSave);
      } else {
        await HeroMedia.create(dataToSave);
      }
      setShowForm(false);
      loadMedia();
    } catch (error) {
      console.error("Failed to save hero media:", error);
      alert("Failed to save item.");
    }
    setIsSubmitting(false);
  };

  const MediaPreview = ({ item }) => {
    if (item.media_type === 'video') {
      return <video src={item.file_url} className="w-32 h-20 rounded-lg object-cover bg-black" muted loop playsInline />;
    }
    return <img src={item.file_url} alt={item.headline} className="w-32 h-20 rounded-lg object-cover" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Homepage Hero Management</h2>
          <p className="text-gray-600">Manage rotating media on the homepage hero section.</p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-900 text-sm">Recommended Media Sizes:</h4>
            <ul className="text-xs text-blue-800 mt-1 space-y-1">
              <li>• Desktop: 1920x1080px (16:9 ratio)</li>
              <li>• Mobile: 1080x1350px (4:5 ratio)</li>
              <li>• File size: Max 5MB for images, Max 20MB for videos</li>
              <li>• Formats: JPG, PNG for images; MP4 for videos</li>
            </ul>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add Hero Item
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {mediaItems.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <MediaPreview item={item} />
                  <div>
                    <h3 className="font-semibold">{item.headline || 'Untitled'}</h3>
                    <p className="text-sm text-gray-500">{item.subheadline || 'No subheadline'}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`px-2 py-1 text-xs rounded-full ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                       </span>
                       <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">{item.media_type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(item)}><Edit3 className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit' : 'Add'} Hero Item</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Media File</Label>
              {formState.file_url ? (
                <div className="relative mt-2">
                  {formState.media_type === 'image' && <img src={formState.file_url} className="w-full h-48 object-cover rounded-md" />}
                  {formState.media_type === 'video' && <video src={formState.file_url} className="w-full h-48 object-cover rounded-md bg-black" controls />}
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setFormState(prev => ({ ...prev, file_url: '' }))}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="mt-2">
                  <Input type="file" onChange={handleFileChange} disabled={uploading} accept="image/*,video/*" />
                  {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                </div>
              )}
            </div>
            
            <Select value={formState.media_type} onValueChange={(value) => setFormState(prev => ({ ...prev, media_type: value }))}>
              <SelectTrigger><SelectValue placeholder="Select media type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            
            <div><Label>Headline</Label><Input value={formState.headline} onChange={(e) => setFormState({...formState, headline: e.target.value})} /></div>
            <div><Label>Subheadline</Label><Textarea value={formState.subheadline} onChange={(e) => setFormState({...formState, subheadline: e.target.value})} /></div>
            <div><Label>CTA Button Text</Label><Input value={formState.cta_text} onChange={(e) => setFormState({...formState, cta_text: e.target.value})} /></div>
            <div><Label>CTA Button Link</Label><Input value={formState.cta_link} onChange={(e) => setFormState({...formState, cta_link: e.target.value})} placeholder="/AllRestaurants" /></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Switch checked={formState.is_active} onCheckedChange={(checked) => setFormState({...formState, is_active: checked})} /><Label>Active</Label></div>
              <div><Label>Sort Order</Label><Input type="number" value={formState.sort_order} onChange={(e) => setFormState({...formState, sort_order: e.target.value})} className="w-24" /></div>
            </div>

            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting || !formState.file_url}>{isSubmitting ? 'Saving...' : 'Save'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
