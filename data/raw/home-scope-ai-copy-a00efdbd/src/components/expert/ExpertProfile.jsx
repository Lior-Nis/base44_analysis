
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  User as UserIcon,
  Mail,
  Phone,
  Book,
  Save,
  Edit, // Changed from Settings
  Star, // New import
  Award // New import
} from "lucide-react";
import { User as UserEntity } from "@/api/entities";
import { ExpertReview } from "@/api/entities"; // New import

export default function ExpertProfile({ expert, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    expert_specialty: expert?.expert_specialty || '',
    expert_bio: expert?.expert_bio || '',
    is_available: expert?.is_available || true,
  });

  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });

  useEffect(() => {
    const fetchReviews = async () => {
      if (expert?.id) {
        try {
          const reviews = await ExpertReview.filter({ expert_id: expert.id });
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            setReviewStats({
              average: averageRating.toFixed(1),
              count: reviews.length,
            });
          }
        } catch (error) {
          console.error("Failed to fetch reviews for expert:", error);
        }
      }
    };
    fetchReviews();
  }, [expert]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await UserEntity.updateMyUserData({
        expert_specialty: formData.expert_specialty,
        expert_bio: formData.expert_bio,
        is_available: formData.is_available,
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating expert profile:', error);
      alert('Error updating profile. Please try again.');
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-green-600" />
              Your Expert Profile
            </CardTitle>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
             <div className="flex-1 text-center">
                <div className="flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-500 mr-1"/>
                    <p className="text-2xl font-bold">{reviewStats.average}</p>
                </div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
             </div>
             <div className="flex-1 text-center">
                <p className="text-2xl font-bold">{reviewStats.count}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
             </div>
             <div className="flex-1 text-center">
                <Award className="w-6 h-6 text-green-600 mx-auto mb-1"/>
                <p className="text-sm text-gray-600">Top Expert</p>
             </div>
          </div>
        
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={expert?.fullName || ''}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={expert?.email || ''}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="specialty">Your Specialty</Label>
              <Input
                id="specialty"
                value={formData.expert_specialty}
                onChange={(e) => handleInputChange('expert_specialty', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Plumbing, Electrical, Surveying"
              />
            </div>
            <div>
              <Label htmlFor="bio">Your Bio</Label>
              <Textarea
                id="bio"
                value={formData.expert_bio}
                onChange={(e) => handleInputChange('expert_bio', e.target.value)}
                disabled={!isEditing}
                placeholder="A short bio about your experience and qualifications."
                className="h-24"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isAvailable" className="font-medium">
                Available for Consultations
              </Label>
              <p className="text-sm text-gray-600">
                Turn this off if you are temporarily unavailable to take new calls.
              </p>
            </div>
            <Switch
              id="isAvailable"
              checked={formData.is_available}
              onCheckedChange={(checked) => handleInputChange('is_available', checked)}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
