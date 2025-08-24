
import React, { useState, useEffect } from 'react';
import { User, Gecko, GeckoImage, ForumPost, ForumComment, DirectMessage, Notification, MorphReferenceImage } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MapPin, Link as LinkIcon, Calendar, Users, MessageSquare, Image as ImageIcon, Heart, Edit, Save, X, Loader2, Upload } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { useToast } from "@/components/ui/use-toast";

export default function MyProfile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    
    // User stats with fallbacks
    const [userStats, setUserStats] = useState({
        geckos: 0,
        images: 0,
        forumPosts: 0,
        comments: 0,
        messages: 0,
        notifications: 0,
        morphSubmissions: 0
    });
    
    const [editData, setEditData] = useState({});

    const syncEditData = (currentUser) => {
        if (!currentUser) return;
        setEditData({
            bio: currentUser.bio || '',
            location: currentUser.location || '',
            website_url: currentUser.website_url || '',
            instagram_handle: currentUser.instagram_handle || '',
            breeder_name: currentUser.breeder_name || '',
            years_experience: currentUser.years_experience || 0
        });
    };

    useEffect(() => {
        const loadUserData = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                syncEditData(currentUser);

                // Load stats with heavy rate limit protection
                const loadStatsWithFallback = async () => {
                    const stats = { geckos: 0, images: 0, forumPosts: 0, comments: 0, messages: 0, notifications: 0, morphSubmissions: 0 };
                    
                    try {
                        // Use Promise.allSettled to prevent one failure from breaking everything
                        const results = await Promise.allSettled([
                            Gecko.filter({ created_by: currentUser.email }),
                            GeckoImage.filter({ created_by: currentUser.email }),
                            ForumPost.filter({ created_by: currentUser.email }),
                            ForumComment.filter({ created_by: currentUser.email }),
                            DirectMessage.filter({ sender_email: currentUser.email }),
                            Notification.filter({ user_email: currentUser.email }),
                            MorphReferenceImage.filter({ submitted_by_email: currentUser.email })
                        ]);

                        // Safely extract results
                        if (results[0].status === 'fulfilled') stats.geckos = results[0].value.length;
                        if (results[1].status === 'fulfilled') stats.images = results[1].value.length;
                        if (results[2].status === 'fulfilled') stats.forumPosts = results[2].value.length;
                        if (results[3].status === 'fulfilled') stats.comments = results[3].value.length;
                        if (results[4].status === 'fulfilled') stats.messages = results[4].value.length;
                        if (results[5].status === 'fulfilled') stats.notifications = results[5].value.length;
                        if (results[6].status === 'fulfilled') stats.morphSubmissions = results[6].value.length;

                        setUserStats(stats);
                    } catch (error) {
                        console.error("Failed to load user stats:", error);
                        // Use fallback stats if everything fails
                        setUserStats(stats);
                    }
                };

                // Delay stats loading to spread out API calls
                setTimeout(loadStatsWithFallback, 1000);

            } catch (error) {
                console.error("Failed to load user data:", error);
                setUser(null);
            }
            setIsLoading(false);
        };
        loadUserData();
    }, []);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await User.updateMyUserData(editData);
            const updatedUser = { ...user, ...editData };
            setUser(updatedUser);
            
            // Update the global cache if it exists
            if (window.dataCache) {
                window.dataCache.set('current_user', updatedUser);
            }

            toast({ title: "Success", description: "Profile updated successfully." });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        }
        setIsSaving(false);
    };

    const handleCancelEdit = () => {
        syncEditData(user); // Reset edit data to match current user state
        setIsEditing(false);
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            const updateData = type === 'profile' ? { profile_image_url: file_url } : { cover_image_url: file_url };
            await User.updateMyUserData(updateData);
            setUser(prevUser => ({ ...prevUser, ...updateData }));
            toast({
                title: "Success!",
                description: `${type === 'profile' ? 'Profile' : 'Cover'} image updated successfully.`,
            });
        } catch (error) {
            console.error("Failed to upload image:", error);
            toast({
                title: "Upload Failed",
                description: "There was an error uploading your image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100 mb-4">Access Denied</h2>
                    <p className="text-slate-400">You need to be logged in to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 bg-slate-800">
                {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                )}
                {user.cover_image_url && (
                    <img src={user.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute bottom-4 right-4">
                    <Button asChild size="sm" className="bg-black/50 hover:bg-black/70 cursor-pointer">
                         <label>
                            <Camera className="w-4 h-4 mr-2" />
                            Update Cover
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </label>
                    </Button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5 relative z-10">
                    {/* Profile Image */}
                    <div className="relative group">
                        <img
                            className="h-24 w-24 rounded-full ring-4 ring-slate-950 sm:h-32 sm:w-32 object-cover"
                            src={user.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=84A98C&color=fff`}
                            alt={user.full_name}
                        />
                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                    
                    <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                        <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                            <h1 className="text-2xl font-bold text-slate-100 truncate">{user.full_name}</h1>
                            {user.location && (
                                <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {user.location}
                                </p>
                            )}
                            {user.bio && !isEditing && (
                                <p className="text-sm text-slate-300 mt-2">{user.bio}</p>
                            )}
                        </div>
                        <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)} variant="outline" className="border-slate-600 hover:bg-slate-800">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save
                                    </Button>
                                    <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="block sm:hidden mt-6 min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-slate-100 truncate">{user.full_name}</h1>
                    {(user.location || editData.location) && !isEditing && (
                        <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4" />
                            {user.location || editData.location}
                        </p>
                    )}
                    {user.bio && !isEditing && (
                        <p className="text-sm text-slate-300 mt-2">{user.bio}</p>
                    )}
                </div>

                {/* Tabs */}
                <div className="mt-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">Overview</TabsTrigger>
                            <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700">Activity</TabsTrigger>
                            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {isEditing && (
                                <Card className="bg-slate-900 border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-slate-100">Edit Profile Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                                            <Textarea
                                                value={editData.bio}
                                                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                                                placeholder="Tell us about yourself..."
                                                className="bg-slate-800 border-slate-600 text-slate-100"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                                                <Input
                                                    value={editData.location}
                                                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                                                    placeholder="City, Country"
                                                    className="bg-slate-800 border-slate-600 text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
                                                <Input
                                                    value={editData.website_url}
                                                    onChange={(e) => setEditData({...editData, website_url: e.target.value})}
                                                    placeholder="https://yourwebsite.com"
                                                    className="bg-slate-800 border-slate-600 text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Instagram</label>
                                                <Input
                                                    value={editData.instagram_handle}
                                                    onChange={(e) => setEditData({...editData, instagram_handle: e.target.value})}
                                                    placeholder="@yourusername"
                                                    className="bg-slate-800 border-slate-600 text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Breeder Name</label>
                                                <Input
                                                    value={editData.breeder_name}
                                                    onChange={(e) => setEditData({...editData, breeder_name: e.target.value})}
                                                    placeholder="Your breeding business name"
                                                    className="bg-slate-800 border-slate-600 text-slate-100"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <Card className="bg-slate-900 border-slate-700">
                                    <CardContent className="p-6 text-center">
                                        <Users className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-slate-100">{userStats.geckos}</div>
                                        <p className="text-xs text-slate-400">Geckos</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-900 border-slate-700">
                                    <CardContent className="p-6 text-center">
                                        <ImageIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-slate-100">{userStats.images}</div>
                                        <p className="text-xs text-slate-400">Images</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-900 border-slate-700">
                                    <CardContent className="p-6 text-center">
                                        <MessageSquare className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-slate-100">{userStats.forumPosts}</div>
                                        <p className="text-xs text-slate-400">Posts</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-900 border-slate-700">
                                    <CardContent className="p-6 text-center">
                                        <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-slate-100">{userStats.morphSubmissions}</div>
                                        <p className="text-xs text-slate-400">Contributions</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-6">
                            <Card className="bg-slate-900 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-slate-100">Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-sm text-slate-400">
                                            Activity tracking will be implemented in a future update.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-6">
                            <Card className="bg-slate-900 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-slate-100">Account Settings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-slate-200 font-medium">Profile Visibility</h4>
                                                <p className="text-sm text-slate-400">Make your profile visible to other users</p>
                                            </div>
                                            <Badge className={user.profile_public ? "bg-green-600" : "bg-red-600"}>
                                                {user.profile_public ? "Public" : "Private"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-slate-200 font-medium">Expert Status</h4>
                                                <p className="text-sm text-slate-400">Verified expert for morph identification</p>
                                            </div>
                                            <Badge className={user.is_expert ? "bg-purple-600" : "bg-gray-600"}>
                                                {user.is_expert ? "Expert" : "Standard"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
