
import React, { useState, useEffect } from "react";
import { MapPin, ToggleLeft, ToggleRight, IndianRupee, Briefcase, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Post, User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AppHeader from "../components/common/AppHeader";
import LoginScreen from "../components/auth/LoginScreen";
import { useLocalization } from "@/components/common/Localization";

export default function CreatePost() {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // New state for editing post

  const [postType, setPostType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
    
    // Check session storage for a post to edit
    const postToEditJson = sessionStorage.getItem('editingPost');
    if (postToEditJson) {
        try {
            const postToEdit = JSON.parse(postToEditJson);
            setEditingPost(postToEdit);
            setPostType(postToEdit.post_type);
            setTitle(postToEdit.title);
            setDescription(postToEdit.description);
            setCategory(postToEdit.category);
            setBudget(postToEdit.budget.toString()); // Convert number to string for input field
            setLocationEnabled(postToEdit.location_enabled);
        } catch (e) {
            console.error("Failed to parse editing post from session storage:", e);
        } finally {
            sessionStorage.removeItem('editingPost'); // Clear the item after reading it
        }
    }
  }, []);

  const postTypes = [
    { value: "job", label: t('postAJob') },
    { value: "service", label: t('offerAService') }
  ];

  const categories = [
    "Plumber", "Electrician", "Carpenter", "Painter", 
    "Cleaner", "Tutor", "Driver", "Cook", "Gardener", "Other"
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!postType) newErrors.postType = t('errorPostType');
    if (!title.trim()) newErrors.title = t('errorTitle');
    if (!description.trim()) newErrors.description = t('errorDescription');
    if (!category) newErrors.category = t('errorCategory');
    // Budget validation: check if it's a number, greater than 0, and not empty
    if (!budget || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) {
      newErrors.budget = t('errorBudget');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      alert("You must be logged in to post.");
      setIsAuthenticated(false); // Force re-render to LoginScreen if not authenticated
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = {
        post_type: postType,
        title,
        description,
        category,
        budget: parseFloat(budget),
        location_enabled: locationEnabled,
        author_name: currentUser.full_name,
        author_email: currentUser.email,
        author_avatar: currentUser.avatar_url,
        status: "active", // Assuming posts are active upon creation/update
      };
      
      if (editingPost) {
        // If editing an existing post, call update
        await Post.update(editingPost.id, postData);
        alert(t('postUpdated')); // Assumes 'postUpdated' is defined in localization
      } else {
        // Otherwise, create a new post
        await Post.create(postData);
        alert(t('postSuccess'));
      }

      navigate(createPageUrl("Profile")); // Navigate to Profile page after success
      
    } catch (error) {
      console.error("Error submitting post:", error);
      alert(editingPost ? t('failedToUpdatePost') : t('postError')); // Assumes 'failedToUpdatePost' is defined
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="p-4 pb-24">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {editingPost ? t('editPostTitle') : t('createPostTitle')} {/* Dynamically change title */}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('iWantTo')} <span className="text-red-500">*</span>
            </label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger className={`w-full ${errors.postType ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:ring-orange-500`}>
                <SelectValue placeholder={t('selectOption')} />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.value === 'job' ? <Briefcase className="w-4 h-4" /> : <Handshake className="w-4 h-4" />}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.postType && <p className="mt-1 text-sm text-red-500">{errors.postType}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('title')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              className={`w-full ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:ring-orange-500`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')} <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={5}
              className={`w-full ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:ring-orange-500`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('category')} <span className="text-red-500">*</span>
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={`w-full ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:ring-orange-500`}>
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Budget/Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('budgetPrice')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={t('budgetPlaceholder')}
                className={`w-full pl-8 ${errors.budget ? 'border-red-500' : 'border-gray-300'} focus:border-orange-500 focus:ring-orange-500`}
              />
            </div>
            {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
          </div>

          {/* Location Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{t('enableLocation')}</h3>
                    <p className="text-sm text-gray-500">{t('locationDescription')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLocationEnabled(!locationEnabled)}
                  className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {locationEnabled ? (
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              </div>
              {locationEnabled && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {t('locationEnabled')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-semibold rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? t('submitting') : (editingPost ? t('updatePost') : t('submitPost'))} {/* Dynamically change button text */}
          </Button>
        </form>
      </div>
    </div>
  );
}
