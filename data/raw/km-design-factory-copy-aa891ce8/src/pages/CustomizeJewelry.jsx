
import React, { useState, useEffect } from 'react';
import { CustomJewelry } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Sparkles, LogIn } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SendEmail } from '@/api/integrations';

import ImageUploader from '../components/customization/ImageUploader';
import JewelryTypeSelector from '../components/customization/JewelryTypeSelector';
import MetalSelector from '../components/customization/MetalSelector';
import GemstoneSelector from '../components/customization/GemstoneSelector';
import ChainCustomizer from '../components/customization/ChainCustomizer';
import JewelryVisualizer from '../components/customization/JewelryVisualizer';
import PriceCalculator from '../components/customization/PriceCalculator';

export default function CustomizeJewelry() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    preferred_contact_method: '',
    design_name: '',
    jewelry_types: [],
    metal_type: '',
    metal_karat: '',
    gemstone_type: '',
    gemstone_size: '',
    chain_style: '',
    chain_length: 18,
    chain_thickness: '',
    closure_type: '',
    logo_image_url: null,
    quantity: 1,
    special_instructions: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Pre-fill contact info if user is logged in
      if (currentUser) {
        setDesign(prev => ({
          ...prev,
          contact_name: currentUser.full_name || '',
          contact_email: currentUser.email || '',
        }));
      }
    } catch (error) {
      console.error('User not authenticated:', error);
      setUser(null);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const updateDesign = (field, value) => {
    const newDesign = { ...design, [field]: value };

    if (field === 'metal_type') {
        const nonKaratMetals = ['stainless_steel', 'gold_plated_stainless_steel', 'titanium'];
        if (nonKaratMetals.includes(value)) {
            newDesign.metal_karat = '';
        }
    }
    
    setDesign(newDesign);
  };

  const calculateEstimatedPrice = () => {
    const metalPrices = {
      yellow_gold: 180, white_gold: 190, rose_gold: 185,
      platinum: 320, sterling_silver: 85, titanium: 145,
      gold_plated_stainless_steel: 25, stainless_steel: 25
    };
    
    const jewelryTypePrices = {
      necklace: 80, pendant: 60, ring: 120,
      earrings: 140, bracelet: 90, brooch: 110
    };

    let unitPrice = 0; 
    
    // Metal cost
    if (design.metal_type) unitPrice += metalPrices[design.metal_type] || 0;
    
    // Jewelry types cost with pendant discount and steel discounts
    if (design.jewelry_types && design.jewelry_types.length > 0) {
      const hasNecklaceAndPendant = design.jewelry_types.includes('necklace') && design.jewelry_types.includes('pendant');
      const isSteelMetal = design.metal_type === 'gold_plated_stainless_steel' || design.metal_type === 'stainless_steel';
      
      design.jewelry_types.forEach(type => {
        let typePrice = jewelryTypePrices[type] || 0;
        
        // Apply 75% discount for steel metals
        if (isSteelMetal) {
          typePrice = Math.round(typePrice * 0.25); // 75% discount = pay 25% of original
        }
        
        // Apply 50% discount to pendant if both necklace and pendant are selected (applies after steel discount)
        if (type === 'pendant' && hasNecklaceAndPendant) {
          typePrice = Math.round(typePrice * 0.5);
        }
        
        unitPrice += typePrice;
      });
    }

    // Chain cost (if applicable) - only if not steel metal
    const needsChain = design.jewelry_types && (design.jewelry_types.includes('necklace') || design.jewelry_types.includes('bracelet'));
    const isSteelMetal = design.metal_type === 'gold_plated_stainless_steel' || design.metal_type === 'stainless_steel';
    
    if (needsChain && !isSteelMetal) {
      const chainPrices = { cable: 45, curb: 55, figaro: 65, rope: 75, box: 50, snake: 70, wheat: 80, byzantine: 95 };
      const thicknessMultipliers = { delicate: 0.8, medium: 1.0, bold: 1.3, statement: 1.6 };
      const closurePrices = { lobster_clasp: 15, spring_ring: 12, magnetic: 25, toggle: 30, box_clasp: 40, fishhook: 18 };
      
      if (design.chain_style) {
        const chainBase = chainPrices[design.chain_style] || 0;
        const thicknessMultiplier = design.chain_thickness ? thicknessMultipliers[design.chain_thickness] : 1;
        const lengthMultiplier = design.chain_length ? design.chain_length / 18 : 1;
        unitPrice += Math.round(chainBase * thicknessMultiplier * lengthMultiplier);
      }

      if (design.closure_type) {
        unitPrice += closurePrices[design.closure_type] || 0;
      }
    }
    
    // Custom design fee - waived for steel metals
    if (design.logo_image_url && !isSteelMetal) unitPrice += 150;
    
    return unitPrice;
  };

  const calculateTotalPrice = () => {
    const unitPrice = calculateEstimatedPrice();
    const quantity = design.quantity || 1;
    let total = unitPrice * quantity;
    
    // Apply bulk discount for orders of 25 or more
    if (quantity >= 25) {
      const discountRate = quantity >= 100 ? 0.35 : quantity >= 50 ? 0.30 : 0.25;
      total = total * (1 - discountRate);
    }
    
    return Math.round(total);
  };

  const getBulkDiscountInfo = () => {
    const quantity = design.quantity || 1;
    if (quantity >= 100) return { discount: 35, message: "35% bulk discount applied!" };
    if (quantity >= 50) return { discount: 30, message: "30% bulk discount applied!" };
    if (quantity >= 25) return { discount: 25, message: "25% bulk discount applied!" };
    return null;
  };

  const saveDesign = async () => {
    if (!user) {
      alert('Please log in to submit a design request.');
      return;
    }

    // Check required fields
    if (!design.contact_name || !design.contact_phone || !design.contact_email || !design.preferred_contact_method || !design.design_name || !design.jewelry_types || design.jewelry_types.length === 0 || !design.metal_type || !design.quantity || design.quantity <= 0) {
      alert('Please fill in all required fields including contact information, design details, and select at least one jewelry type.');
      return;
    }

    setSaving(true);
    try {
      const unitPrice = calculateEstimatedPrice(); 
      const totalPrice = calculateTotalPrice();
      
      // Build the core design data with required fields
      const designData = {
        contact_name: design.contact_name,
        contact_phone: design.contact_phone,
        contact_email: design.contact_email,
        preferred_contact_method: design.preferred_contact_method,
        design_name: design.design_name,
        jewelry_types: design.jewelry_types,
        metal_type: design.metal_type,
        quantity: design.quantity,
        estimated_price: unitPrice,
        total_estimated_price: totalPrice,
        chain_length: design.chain_length || 18,
      };

      // Add user_id to designData
      designData.user_id = user.id; 

      // Conditionally add optional fields ONLY if they have a value
      if (design.metal_karat) designData.metal_karat = design.metal_karat;
      if (design.gemstone_type) designData.gemstone_type = design.gemstone_type;
      if (design.gemstone_size) designData.gemstone_size = design.gemstone_size;
      if (design.chain_style) designData.chain_style = design.chain_style;
      if (design.chain_thickness) designData.chain_thickness = design.chain_thickness;
      if (design.closure_type) designData.closure_type = design.closure_type;
      if (design.logo_image_url) designData.logo_image_url = design.logo_image_url;
      if (design.special_instructions) designData.special_instructions = design.special_instructions;


      console.log('Submitting design data:', designData);
      
      await CustomJewelry.create(designData);

      // Send confirmation email to customer
      const emailBody = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #a88532;">Thank you for your submission, ${design.contact_name}!</h2>
          <p>We have received your custom jewelry design request for "<strong>${design.design_name}</strong>" and are excited to review it. Our team will contact you within 24-48 hours to discuss the next steps.</p>
          <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px;">Your Design Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Design Name:</td><td style="padding: 8px;">${design.design_name}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Jewelry Type(s):</td><td style="padding: 8px;">${(design.jewelry_types || []).map(t => t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')).join(', ')}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Metal:</td><td style="padding: 8px;">${design.metal_type.replace(/_/g, ' ')} ${design.metal_karat ? `(${design.metal_karat.replace(/_/g, ' ')})` : ''}</td></tr>
            ${design.gemstone_type && design.gemstone_type !== 'none' ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Gemstone:</td><td style="padding: 8px;">${design.gemstone_size.replace(/_/g, ' ')} ${design.gemstone_type.replace(/_/g, ' ')}</td></tr>` : ''}
            ${(design.jewelry_types || []).some(t => ['necklace', 'bracelet'].includes(t)) && design.chain_style ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Chain:</td><td style="padding: 8px;">${design.chain_style.replace(/_/g, ' ')} chain, ${design.chain_length}"</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Quantity:</td><td style="padding: 8px;">${design.quantity}</td></tr>
            ${design.special_instructions ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Instructions:</td><td style="padding: 8px;">${design.special_instructions}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #eee; background-color: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Total Estimated Price:</td><td style="padding: 8px; font-weight: bold;">$${totalPrice}</td></tr>
          </table>
          <p style="margin-top: 20px;">We look forward to creating something beautiful with you.</p>
          <p>Sincerely,<br><strong>The Kiss Moissanite Team</strong></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #777;">Explore more at <a href="https://www.kissmoissanite.com" style="color: #a88532;">www.kissmoissanite.com</a></p>
        </div>
      `;

      await SendEmail({
        to: design.contact_email,
        subject: `Your Kiss Moissanite Design Submission: ${design.design_name}`,
        body: emailBody,
        from_name: "Kiss Moissanite"
      });

      // Send notification email to Kiss Moissanite team
      const teamEmailBody = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #a88532;">New Custom Jewelry Design Submission</h2>
          <p>A new design request has been submitted through the Kiss Moissanite Design Studio.</p>
          
          <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${design.contact_name}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${design.contact_email}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${design.contact_phone}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Preferred Contact:</td><td style="padding: 8px;">${design.preferred_contact_method}</td></tr>
          </table>
          
          <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px;">Design Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Design Name:</td><td style="padding: 8px;">${design.design_name}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Jewelry Type(s):</td><td style="padding: 8px;">${(design.jewelry_types || []).map(t => t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')).join(', ')}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Metal:</td><td style="padding: 8px;">${design.metal_type.replace(/_/g, ' ')} ${design.metal_karat ? `(${design.metal_karat.replace(/_/g, ' ')})` : ''}</td></tr>
            ${design.gemstone_type && design.gemstone_type !== 'none' ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Gemstone:</td><td style="padding: 8px;">${design.gemstone_size ? design.gemstone_size.replace(/_/g, ' ') : ''} ${design.gemstone_type.replace(/_/g, ' ')}</td></tr>` : ''}
            ${(design.jewelry_types || []).some(t => ['necklace', 'bracelet'].includes(t)) && design.chain_style ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Chain:</td><td style="padding: 8px;">${design.chain_style.replace(/_/g, ' ')} chain, ${design.chain_length}"</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Quantity:</td><td style="padding: 8px;">${design.quantity}</td></tr>
            ${design.special_instructions ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Special Instructions:</td><td style="padding: 8px;">${design.special_instructions}</td></tr>` : ''}
            ${design.logo_image_url ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Custom Image:</td><td style="padding: 8px;"><a href="${design.logo_image_url}" target="_blank">View Uploaded Image</a></td></tr>` : ''}
            <tr style="border-bottom: 1px solid #eee; background-color: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Total Estimated Price:</td><td style="padding: 8px; font-weight: bold;">$${totalPrice}</td></tr>
          </table>
          
          <p style="margin-top: 20px;">Please follow up with ${design.contact_name} within 24-48 hours via their preferred contact method: <strong>${design.preferred_contact_method}</strong>.</p>
        </div>
      `;

      await SendEmail({
        to: "hello@kissmoissanite.com",
        subject: `New Design Submission: ${design.design_name} - ${design.contact_name}`,
        body: teamEmailBody,
        from_name: "Kiss Moissanite Design Studio"
      });
      
      alert('Design submitted successfully! Check your email for confirmation.');
      
      // Reset form
      setDesign({
        contact_name: user?.full_name || '',
        contact_phone: '',
        contact_email: user?.email || '',
        preferred_contact_method: '',
        design_name: '',
        jewelry_types: [],
        metal_type: '',
        metal_karat: '',
        gemstone_type: '',
        gemstone_size: '',
        chain_style: '',
        chain_length: 18,
        chain_thickness: '',
        closure_type: '',
        logo_image_url: null,
        quantity: 1,
        special_instructions: '',
      });
      
    } catch (error) {
      console.error('Error saving design:', error);
      alert(`Failed to save design: ${error.message || 'Please try again.'}`);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center kiss-gradient">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center kiss-gradient">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Please log in to access the Kiss Moissanite Design Studio and create your custom jewelry piece.
            </p>
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-3"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login with Google
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              Secure authentication powered by Google
            </p>
          </div>
        </div>
      </div>
    );
  }

  const needsChain = design.jewelry_types && (design.jewelry_types.includes('necklace') || design.jewelry_types.includes('bracelet'));
  const bulkInfo = getBulkDiscountInfo();

  return (
    <div className="min-h-screen p-6 kiss-gradient">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Kiss Moissanite Design Studio</h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-300 text-lg">Create your perfect custom moissanite jewelry piece</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm font-medium">Logged in as {user.full_name || user.email}</span>
          </div>
        </div>

        <div className="space-y-8">
            {/* Contact Information Card */}
            <Card className="bg-white border-yellow-500/30 shadow-lg">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-yellow-100">
                <CardTitle className="text-black flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-bold">1</span>
                  </div>
                  Contact Information
                  <span className="text-red-500 text-sm">*Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name" className="text-black font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-name"
                      value={design.contact_name}
                      onChange={(e) => updateDesign('contact_name', e.target.value)}
                      placeholder="Your full name"
                      className="border-gray-300 focus:border-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email" className="text-black font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={design.contact_email}
                      onChange={(e) => updateDesign('contact_email', e.target.value)}
                      placeholder="your@email.com"
                      className="border-gray-300 focus:border-yellow-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                  <div>
                    <Label htmlFor="contact-phone" className="text-black font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={design.contact_phone}
                      onChange={(e) => updateDesign('contact_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="border-gray-300 focus:border-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-method" className="text-black font-medium">
                      Preferred Contact <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="contact-method"
                      value={design.preferred_contact_method}
                      onChange={(e) => updateDesign('preferred_contact_method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-yellow-500 focus:outline-none"
                      required
                    >
                      <option value="">Select method</option>
                      <option value="phone">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="text">Text Message</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm leading-relaxed">
                    <strong>Privacy Notice:</strong> Your contact information is used solely for discussing your custom jewelry project. We'll reach out within 24-48 hours to review your design and provide a detailed quote.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Design Details Card */}
            <Card className="bg-white border-yellow-500/30 shadow-lg">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-yellow-100">
                <CardTitle className="text-black flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-bold">2</span>
                  </div>
                  Design Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="design-name" className="text-black font-medium">
                      Design Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="design-name"
                      value={design.design_name}
                      onChange={(e) => updateDesign('design_name', e.target.value)}
                      placeholder="My Custom Piece"
                      className="border-gray-300 focus:border-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-black font-medium">
                      Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={design.quantity}
                      onChange={(e) => updateDesign('quantity', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      className="border-gray-300 focus:border-yellow-500"
                      required
                    />
                    {design.quantity >= 25 && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        🎉 Bulk pricing eligible! Savings apply at 25+ pieces
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <ImageUploader 
              currentImage={design.logo_image_url}
              onImageUploaded={(url) => updateDesign('logo_image_url', url)}
            />

            <JewelryTypeSelector
              selectedTypes={design.jewelry_types} 
              onTypeChange={(types) => updateDesign('jewelry_types', types)} 
              metalType={design.metal_type}
            />

            {needsChain && (
              <ChainCustomizer
                selectedStyle={design.chain_style}
                selectedThickness={design.chain_thickness}
                selectedClosure={design.closure_type}
                chainLength={design.chain_length}
                onStyleChange={(style) => updateDesign('chain_style', style)}
                onThicknessChange={(thickness) => updateDesign('chain_thickness', thickness)}
                onClosureChange={(closure) => updateDesign('closure_type', closure)}
                onLengthChange={(length) => updateDesign('chain_length', length)}
              />
            )}

            <MetalSelector
              selectedMetal={design.metal_type}
              selectedKarat={design.metal_karat}
              onMetalChange={(metal) => updateDesign('metal_type', metal)}
              onKaratChange={(karat) => updateDesign('metal_karat', karat)}
            />

            <GemstoneSelector
              selectedGemstone={design.gemstone_type}
              selectedSize={design.gemstone_size}
              onGemstoneChange={(gem) => updateDesign('gemstone_type', gem)}
              onSizeChange={(size) => updateDesign('gemstone_size', size)}
            />

            <JewelryVisualizer 
              design={design} 
              uploadedImage={design.logo_image_url}
              description={design.special_instructions}
              onDescriptionChange={(value) => updateDesign('special_instructions', value)}
            />

            <PriceCalculator design={design} />

            <Card className="bg-white border-yellow-500/30 shadow-lg">
              <CardContent className="p-6">
                <Button 
                  onClick={saveDesign}
                  disabled={saving || !user || !design.contact_name || !design.contact_phone || !design.contact_email || !design.preferred_contact_method || !design.design_name || !design.jewelry_types || design.jewelry_types.length === 0 || !design.metal_type || !design.quantity || design.quantity <= 0} 
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-3 text-lg shadow-lg"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                      Saving Design...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Submit My Design Request
                    </>
                  )}
                </Button>
                
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                    Your design will be reviewed by our Kiss Moissanite master jewelers. 
                    We'll contact you within 24-48 hours with a detailed quote 
                    and production timeline.
                  </p>
                  <p className="text-xs text-gray-600 italic mb-3">
                    * Prices may vary based on materials used, timeframe, and quantity requested. 
                    Bulk orders of 25+ pieces receive automatic discounts of 25-35%.
                  </p>
                  
                  <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
                    <p className="text-gray-800 text-sm font-medium mb-2">
                      🌟 Explore Our Full Collection
                    </p>
                    <p className="text-gray-700 text-xs mb-2">
                      While we craft your custom piece, browse our stunning collection of jewelry and accessories.
                    </p>
                    <a 
                      href="https://www.kissmoissanite.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-semibold text-sm underline decoration-2 underline-offset-2 hover:decoration-yellow-700 transition-colors duration-200"
                    >
                      Visit www.kissmoissanite.com
                      <span className="ml-1">→</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
