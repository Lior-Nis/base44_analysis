
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gecko, UserActivity } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from "date-fns";
import { Upload, X, Save, Trash2, DollarSign, Award, GitBranch, Loader2 } from "lucide-react";
import { Switch } from '@/components/ui/switch';
import { generateLineageCertificate } from '@/api/functions';

// Helper function for Gecko ID generation
const generateNextGeckoId = async (user, allGeckos, sire = null, dam = null) => {
    if (sire && dam) {
        // ID for hatched geckos
        const sireCode = (sire.gecko_id_code || sire.name.substring(0, 3)).toUpperCase().replace(/[^A-Z0-9]/g, '');
        const damCode = (dam.gecko_id_code || dam.name.substring(0, 3)).toUpperCase().replace(/[^A-Z0-9]/g, '');
        const prefix = `${sireCode}x${damCode}-`;
        
        // Find siblings that have this sire and dam
        const siblings = allGeckos.filter(g => g.sire_id === sire.id && g.dam_id === dam.id);
        const nextId = siblings.length + 1;
        return `${prefix}${String(nextId).padStart(2, '0')}`;
    } else {
        // ID for manually added geckos (founders)
        const userPrefix = (user?.breeder_name || user?.email?.split('@')[0] || 'GECK')
            .substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Find existing founder geckos that match the user's prefix and have no parents
        const founderGeckos = allGeckos.filter(g => !g.sire_id && !g.dam_id && g.gecko_id_code?.startsWith(userPrefix));
        const nextId = founderGeckos.length + 1;
        return `${userPrefix}-${String(nextId).padStart(3, '0')}`;
    }
};

const MONTHS = [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" }
];

const initialFormData = {
    name: '',
    gecko_id_code: '',
    hatch_date: null,
    sex: 'Unsexed',
    sire_id: '',
    dam_id: '',
    morphs_traits: '',
    notes: '',
    status: 'Pet',
    image_urls: [],
    custom_category: '',
    weight_grams: '',
    asking_price: '',
    image_crop_data: {}
};

export default function GeckoForm({ gecko, userGeckos, currentUser, onSubmit, onCancel, categories = [], isHatching = false, onDelete, breedingPlan = null }) {
    const [formData, setFormData] = useState(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [sires, setSires] = useState([]);
    const [dams, setDams] = useState([]);
    // New state for individual date parts
    const [hatchYear, setHatchYear] = useState('');
    const [hatchMonth, setHatchMonth] = useState('');
    const [hatchDay, setHatchDay] = useState('');

    // Image cropping states
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [cropData, setCropData] = useState({}); // Local state for crop data before saving
    
    // New state for "For Sale" toggle
    const [isForSale, setIsForSale] = useState(false);
    
    // New states for certificate generation
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);
    const [certType, setCertType] = useState('');

    // Effect 1: Initialize form data when gecko changes or new gecko is created
    useEffect(() => {
        if (gecko) {
            // We are editing an existing gecko or initializing a new hatched one (with pre-filled parents).
            const formDataToSet = {
                ...initialFormData, // Start with default values
                ...gecko,     // Overlay gecko data
                image_urls: gecko.image_urls || [], // Ensure image_urls is always an array
                // Ensure number fields are string for input type="number"
                weight_grams: gecko.weight_grams !== undefined && gecko.weight_grams !== null ? gecko.weight_grams.toString() : '',
                asking_price: gecko.asking_price !== undefined && gecko.asking_price !== null ? gecko.asking_price.toString() : '',
                // Ensure parent IDs are properly set for Select components
                sire_id: gecko.sire_id || '', 
                dam_id: gecko.dam_id || '',   
                // Set defaults for other fields if null/undefined
                name: gecko.name || '',
                gecko_id_code: gecko.gecko_id_code || '',
                hatch_date: gecko.hatch_date ? new Date(gecko.hatch_date) : null,
                sex: gecko.sex || 'Unsexed',
                morphs_traits: gecko.morphs_traits || '',
                notes: gecko.notes || '',
                status: gecko.status || 'Pet',
                custom_category: gecko.custom_category || '',
                image_crop_data: gecko.image_crop_data || {}
            };

            // For new hatched geckos, auto-populate name and parents
            if (isHatching && breedingPlan) {
                const sire = userGeckos.find(g => g.id === breedingPlan.sire_id);
                const dam = userGeckos.find(g => g.id === breedingPlan.dam_id);
                
                // Generate name based on parents
                const siblings = userGeckos.filter(g => 
                    g.sire_id === breedingPlan.sire_id && g.dam_id === breedingPlan.dam_id
                );
                const hatchNumber = siblings.length + 1; // Correctly count existing siblings to get the next number
                
                const autoName = `${sire?.name || 'Sire'} x ${dam?.name || 'Dam'} #${hatchNumber}`;
                
                formDataToSet.name = autoName;
                formDataToSet.sire_id = breedingPlan.sire_id;
                formDataToSet.dam_id = breedingPlan.dam_id;
            }
            
            setFormData(formDataToSet);
            setCropData(gecko.image_crop_data || {}); // Set local crop data state

            // Also, parse the date parts for the UI inputs.
            const date = gecko.hatch_date ? new Date(gecko.hatch_date) : null;
            if (date && !isNaN(date.getTime())) {
                setHatchYear(date.getFullYear().toString());
                setHatchMonth((date.getMonth() + 1).toString());
                setHatchDay(date.getDate().toString());
            } else {
                setHatchYear('');
                setHatchMonth('');
                setHatchDay('');
            }
            setIsForSale(gecko.status === 'For Sale');
        } else {
            // We are creating a new gecko from scratch. Generate ID and set initial state.
            const generateIdAndSet = async () => {
                const newId = await generateNextGeckoId(currentUser, userGeckos);
                setFormData({
                    ...initialFormData,
                    gecko_id_code: newId
                });
            };
            generateIdAndSet();
            setIsForSale(false); // New geckos are not for sale by default
            setHatchYear('');
            setHatchMonth('');
            setHatchDay('');
            setCropData({}); // Reset crop data for new gecko
        }
    }, [gecko, currentUser, userGeckos, isHatching, breedingPlan]); // Dependencies for initial setup and ID generation for new founder geckos.

    // Effect 2: Generate gecko_id_code specifically for NEW hatched geckos (if not already set)
    useEffect(() => {
        const generateIdForHatched = async () => {
            // Only generate if gecko_id_code is currently empty AND it's a new hatched gecko and a breeding plan is available
            if (isHatching && gecko && !gecko.id && !formData.gecko_id_code && breedingPlan) {
                const sire = userGeckos.find(g => g.id === breedingPlan.sire_id);
                const dam = userGeckos.find(g => g.id === breedingPlan.dam_id);
                const newId = await generateNextGeckoId(currentUser, userGeckos, sire, dam);
                setFormData(prev => ({ ...prev, gecko_id_code: newId }));
            }
        };
        generateIdForHatched();
    }, [gecko, currentUser, userGeckos, isHatching, formData.gecko_id_code, breedingPlan]);

    // Effect 3: Populate sire and dam dropdowns
    useEffect(() => {
        // Exclude the gecko being edited from its own potential parents
        const potentialSires = userGeckos.filter(g => g.sex === 'Male' && g.id !== gecko?.id);
        const potentialDams = userGeckos.filter(g => g.sex === 'Female' && g.id !== gecko?.id);
        setSires(potentialSires);
        setDams(potentialDams);
    }, [userGeckos, gecko]);
    
    // Effect 4: Construct date from parts
    useEffect(() => {
        if (hatchYear && hatchYear.length === 4 && hatchMonth && hatchDay) {
            // Use T00:00:00 to avoid timezone issues converting the date string
            const dateStr = `${hatchYear}-${String(hatchMonth).padStart(2, '0')}-${String(hatchDay).padStart(2, '0')}T00:00:00`;
            const newDate = new Date(dateStr);

            // Robust validation
            const isValidDate = !isNaN(newDate.getTime()) && 
                                newDate.getFullYear() === parseInt(hatchYear, 10) &&
                                newDate.getMonth() + 1 === parseInt(hatchMonth, 10) &&
                                newDate.getDate() === parseInt(hatchDay, 10);

            if (isValidDate) {
                handleChange('hatch_date', newDate);
            } else {
                handleChange('hatch_date', null);
            }
        } else {
            handleChange('hatch_date', null);
        }
    }, [hatchYear, hatchMonth, hatchDay]);

    const handleForSaleToggle = (checked) => {
        setIsForSale(checked);
        if (checked) {
            handleChange('status', 'For Sale');
        } else {
            // Revert to a default status if it was "For Sale"
            if (formData.status === 'For Sale') {
                handleChange('status', 'Pet'); // or whatever default you prefer
            }
        }
    };

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);
    
    // Enhanced image upload with cropping capability
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        setIsSaving(true);
        const urls = [...formData.image_urls];
        const newCropData = { ...cropData };

        try {
            for (const file of files) {
                const { file_url } = await UploadFile({ file });
                urls.push(file_url);
                // Initialize crop data for new image (centered by default)
                newCropData[file_url] = { x: 50, y: 50 };
            }
            setFormData(prev => ({ ...prev, image_urls: urls }));
            setCropData(newCropData);
        } catch (err) {
            console.error("Image upload failed", err);
        }
        
        setIsSaving(false);
    };

    const handleImageCrop = (imageUrl) => {
        setCurrentImage(imageUrl);
        setCropDialogOpen(true);
    };

    const saveCropData = (url, cropInfo) => {
        setCropData(prev => ({
            ...prev,
            [url]: cropInfo
        }));
        setCropDialogOpen(false);
    };

    const removeImage = (urlToRemove) => {
        setFormData(prev => ({ ...prev, image_urls: prev.image_urls.filter(url => url !== urlToRemove)}));
        setCropData(prev => {
            const newCropData = { ...prev };
            delete newCropData[urlToRemove];
            return newCropData;
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            // Construct the payload directly from the most recent form state.
            // Using `null` for empty parent fields for better database consistency.
            const dataToSave = {
                name: formData.name,
                gecko_id_code: formData.gecko_id_code,
                hatch_date: formData.hatch_date ? format(formData.hatch_date, 'yyyy-MM-dd') : null,
                sex: formData.sex,
                sire_id: formData.sire_id || null, // Ensure it's null if empty string
                dam_id: formData.dam_id || null,   // Ensure it's null if empty string
                morphs_traits: formData.morphs_traits,
                notes: formData.notes,
                status: formData.status,
                image_urls: formData.image_urls,
                custom_category: formData.custom_category,
                weight_grams: formData.weight_grams !== '' ? parseFloat(formData.weight_grams) : null,
                asking_price: formData.asking_price !== '' ? parseFloat(formData.asking_price) : null,
                image_crop_data: cropData // Save the crop data
            };

            let savedGecko;
            const isNew = !gecko?.id || isHatching; // isHatching implies new even if gecko has some data
            if (isNew) {
                savedGecko = await Gecko.create(dataToSave);
                // Award points for new gecko
                // Using currentUser prop as it's already passed to the component
                if (currentUser) {
                    await UserActivity.create({
                        user_email: currentUser.email,
                        activity_type: 'new_gecko',
                        points: 5,
                        related_entity_id: savedGecko.id
                    });
                }
            } else {
                savedGecko = await Gecko.update(gecko.id, dataToSave);
            }
            
            if (onSubmit) {
                onSubmit(savedGecko, isNew);
            }
        } catch (error) {
            console.error('Failed to save gecko:', error);
        }
        setIsSaving(false);
    };

    const handleDeleteGecko = async () => {
        // Add a guard to ensure gecko and its ID are valid before calling the onDelete prop
        if (onDelete && gecko && gecko.id) {
            try {
                await onDelete(gecko.id);
            } catch (error) {
                console.error('Failed to delete gecko from form:', error);
            }
        } else {
            console.error('Cannot delete: invalid gecko data or onDelete handler in form.');
        }
    };
    
    const handleGenerateCertificate = async (type) => {
        if (!gecko || !gecko.id) return;
        
        setIsGeneratingCert(true);
        setCertType(type);
        
        try {
            const { data: htmlContent } = await generateLineageCertificate({
                geckoId: gecko.id,
                certificateType: type,
            });
    
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const certWindow = window.open(url, '_blank', 'noopener,noreferrer');
            if (certWindow) {
                certWindow.onload = () => {
                    URL.revokeObjectURL(url);
                }
            }
            
        } catch (error) {
            console.error("Failed to generate certificate:", error);
            // Consider adding a user-facing error message here, e.g., using a toast.
        } finally {
            setIsGeneratingCert(false);
            setCertType('');
        }
    };


    return (
        <div className="relative">
            {/* DELETE BUTTON - Top Left Corner */}
            {gecko && gecko.id && onDelete && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-4 left-4 z-50 opacity-90 hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Gecko</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{formData.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDeleteGecko}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete Gecko
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-4 pt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="gecko_id_code">ID Code</Label>
                        <Input id="gecko_id_code" value={formData.gecko_id_code} onChange={(e) => handleChange('gecko_id_code', e.target.value)} />
                    </div>
                </div>

                {/* Category Selection */}
                <div>
                    <Label htmlFor="custom_category">Category</Label>
                    <Select value={formData.custom_category} onValueChange={(v) => handleChange('custom_category', v === 'none' ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Select category (optional)" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Hatch Date</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Input
                                placeholder="YYYY"
                                maxLength={4}
                                value={hatchYear}
                                onChange={(e) => setHatchYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                            />
                            <Select value={hatchMonth} onValueChange={setHatchMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem> {/* Option to clear month */}
                                    {MONTHS.map(m => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="DD"
                                maxLength={2}
                                value={hatchDay}
                                onChange={(e) => setHatchDay(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="sex">Sex *</Label>
                        <Select value={formData.sex} onValueChange={(v) => handleChange('sex', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Unsexed">Unsexed</SelectItem>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="sire_id">Sire (Father)</Label>
                        <Select value={formData.sire_id} onValueChange={(v) => handleChange('sire_id', v === 'none' ? '' : v)}>
                            <SelectTrigger><SelectValue placeholder="Select sire" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {sires.map(sire => <SelectItem key={sire.id} value={sire.id}>{sire.name} ({sire.gecko_id_code || 'No ID'})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="dam_id">Dam (Mother)</Label>
                        <Select value={formData.dam_id} onValueChange={(v) => handleChange('dam_id', v === 'none' ? '' : v)}>
                            <SelectTrigger><SelectValue placeholder="Select dam" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {dams.map(dam => <SelectItem key={dam.id} value={dam.id}>{dam.name} ({dam.gecko_id_code || 'No ID'})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* For Sale Toggle */}
                <div className="flex items-center justify-between p-4 border border-sage-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex-1">
                        <Label className="text-base font-medium flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-yellow-600" />
                            List for Sale
                        </Label>
                        <p className="text-sm text-sage-600 dark:text-sage-300 mt-1">Makes the gecko visible on the marketplace.</p>
                    </div>
                    <Switch
                        checked={isForSale}
                        onCheckedChange={handleForSaleToggle}
                        className="data-[state=checked]:bg-green-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(v) => handleChange('status', v)} disabled={isForSale}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pet">Pet</SelectItem>
                                <SelectItem value="Future Breeder">Future Breeder</SelectItem>
                                <SelectItem value="Holdback">Holdback</SelectItem>
                                <SelectItem value="Ready to Breed">Ready to Breed</SelectItem>
                                <SelectItem value="Proven">Proven</SelectItem>
                                <SelectItem value="For Sale">For Sale</SelectItem>
                                <SelectItem value="Sold">Sold</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="asking_price">Asking Price ($)</Label>
                        <Input 
                            id="asking_price" 
                            type="number" 
                            step="0.01" 
                            value={formData.asking_price} 
                            onChange={(e) => handleChange('asking_price', e.target.value)} 
                            placeholder="e.g., 250.00"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="weight_grams">Current Weight (grams)</Label>
                    <Input 
                        id="weight_grams" 
                        type="number" 
                        step="0.1" 
                        value={formData.weight_grams} 
                        onChange={(e) => handleChange('weight_grams', e.target.value)} 
                        placeholder="e.g., 50.3"
                    />
                </div>

                <div>
                    <Label htmlFor="morphs_traits">Morphs & Traits</Label>
                    <Textarea id="morphs_traits" value={formData.morphs_traits} onChange={(e) => handleChange('morphs_traits', e.target.value)} />
                </div>

                <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
                </div>
                
                {/* Enhanced Images Section */}
                <div>
                    <Label>Images</Label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {formData.image_urls.map((url, index) => (
                            <div key={url} className="relative group">
                                <div 
                                    className="w-full h-24 rounded overflow-hidden cursor-pointer border-2 border-transparent hover:border-sage-300"
                                    onClick={() => handleImageCrop(url)}
                                >
                                    <img 
                                        src={url} 
                                        alt={`gecko ${index + 1}`} 
                                        className="w-full h-full object-cover"
                                        style={{
                                            objectPosition: cropData[url] 
                                                ? `${cropData[url].x}% ${cropData[url].y}%`
                                                : '50% 50%' // Default to center if no crop data
                                        }}
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    size="icon" 
                                    variant="destructive" 
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" 
                                    onClick={() => removeImage(url)}
                                >
                                    <X className="h-4 w-4"/>
                                </Button>
                                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100">
                                    Click to adjust
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button asChild variant="outline" className="w-full">
                        <label className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2"/> Upload Images
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload}/>
                        </label>
                    </Button>
                </div>

                {/* Certificate Generation Section */}
                {gecko && gecko.id && (
                    <div className="p-4 border border-dashed border-slate-600 rounded-lg mt-6 bg-slate-800/50">
                        <h3 className="text-lg font-medium mb-2 text-slate-200">Generate Certificate</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Create a professional, printable certificate for your records or for new owners.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-slate-500 hover:bg-slate-700"
                                onClick={() => handleGenerateCertificate('ownership')}
                                disabled={isGeneratingCert}
                            >
                                {isGeneratingCert && certType === 'ownership' 
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                    : <><Award className="w-4 h-4 mr-2" /> Ownership Certificate</>
                                }
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-slate-500 hover:bg-slate-700"
                                onClick={() => handleGenerateCertificate('lineage')}
                                disabled={isGeneratingCert}
                            >
                                {isGeneratingCert && certType === 'lineage' 
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                    : <><GitBranch className="w-4 h-4 mr-2" /> Lineage Certificate</>
                                }
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button type="submit" disabled={isSaving} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                        <Save className="w-4 h-4 mr-2"/>
                        {isSaving ? 'Saving...' : 'Save Gecko'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-slate-600 hover:bg-slate-800">
                        Cancel
                    </Button>
                </div>
            </form>

            {/* Image Crop Dialog */}
            {cropDialogOpen && currentImage && (
                <ImageCropDialog
                    imageUrl={currentImage}
                    initialCrop={cropData[currentImage]}
                    onSave={(cropInfo) => saveCropData(currentImage, cropInfo)}
                    onClose={() => setCropDialogOpen(false)}
                />
            )}
        </div>
    );
}

// Click-and-drag Image Crop Dialog Component
function ImageCropDialog({ imageUrl, initialCrop, onSave, onClose }) {
    const [cropPosition, setCropPosition] = useState(initialCrop || { x: 50, y: 50 });
    const imageContainerRef = useRef(null);
    const isDragging = useRef(false);

    const handleInteractionStart = (e) => {
        e.preventDefault();
        isDragging.current = true;
        updatePosition(e);
    };

    const handleInteractionEnd = (e) => {
        e.preventDefault();
        isDragging.current = false;
    };

    const handleInteractionMove = (e) => {
        e.preventDefault();
        if (isDragging.current) {
            updatePosition(e);
        }
    };
    
    const updatePosition = (e) => {
        if (!imageContainerRef.current) return;
        
        const rect = imageContainerRef.current.getBoundingClientRect();
        
        // Handle both touch and mouse events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

        setCropPosition({ x, y });
    };

    const handleSave = () => {
        onSave(cropPosition);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Adjust Thumbnail Position</DialogTitle>
                     <p className="text-sm text-muted-foreground">Click and drag on the image to set the thumbnail's focus point.</p>
                </DialogHeader>
                <div className="space-y-4">
                    <div 
                        ref={imageContainerRef}
                        className="w-full h-64 rounded overflow-hidden border border-input relative cursor-move"
                        onMouseDown={handleInteractionStart}
                        onMouseMove={handleInteractionMove}
                        onMouseUp={handleInteractionEnd}
                        onMouseLeave={handleInteractionEnd}
                        onTouchStart={handleInteractionStart}
                        onTouchMove={handleInteractionMove}
                        onTouchEnd={handleInteractionEnd}
                    >
                        <img 
                            src={imageUrl} 
                            alt="Crop preview" 
                            className="w-full h-full object-cover pointer-events-none"
                            style={{
                                objectPosition: `${cropPosition.x}% ${cropPosition.y}%`
                            }}
                        />
                         <div 
                            className="absolute w-4 h-4 bg-white/50 rounded-full border-2 border-white pointer-events-none"
                            style={{ 
                                left: `calc(${cropPosition.x}% - 8px)`, 
                                top: `calc(${cropPosition.y}% - 8px)`
                            }}
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <Button onClick={handleSave} className="flex-1">Save Position</Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
