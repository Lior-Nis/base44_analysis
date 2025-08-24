
import React, { useState, useEffect } from "react";
import { User, Post } from "@/api/entities";
import { Edit, Phone, Mail, MapPin, Calendar, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AppHeader from "../components/common/AppHeader";
import PostCard from "../components/posts/PostCard";
import LoginScreen from "../components/auth/LoginScreen";
import { useLocalization } from "@/components/common/Localization";
import { UploadFile } from "@/api/integrations";

export default function Profile() {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    title: '',
    bio: '',
    location: '',
    phone: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setIsAuthenticated(true);
      setProfileData({
        full_name: user.full_name || '',
        title: user.title || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || ''
      });
      
      const posts = await Post.filter({ author_email: user.email }, "-created_date", 20);
      setUserPosts(posts);
    } catch (error) {
      console.error("Error loading user data:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await User.updateMyUserData(profileData);
      await loadUserData();
      setEditingProfile(false);
      alert(t('profileUpdated'));
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t('errorUpdatingProfile'));
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5 MB limit
        alert(t('fileTooLarge', { size: '5MB' }));
        return;
    }
    if (!file.type.startsWith('image/')) {
        alert(t('selectImageFile'));
        return;
    }

    setUploadingAvatar(true);
    try {
      const uploadResponse = await UploadFile({ file });
      if (uploadResponse && uploadResponse.file_url) {
        await User.updateMyUserData({ avatar_url: uploadResponse.file_url });
        await loadUserData();
        alert(t('profilePhotoUpdated'));
      } else {
        throw new Error("File upload did not return a URL.");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert(t('errorUploadingPhoto'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleMessage = (post) => {
    console.log("Message from own post - not applicable");
  };

  const handleEdit = (post) => {
    sessionStorage.setItem('editingPost', JSON.stringify(post));
    navigate(createPageUrl("CreatePost"));
  };

  const handleDelete = async (postId) => {
    if (window.confirm(t('confirmDelete'))) {
        try {
            await Post.delete(postId);
            loadUserData();
            alert(t('postDeleted'));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert(t('failedToDeletePost'));
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-sm animate-pulse p-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="w-48 h-6 bg-gray-200 rounded mx-auto mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="p-4 pb-24">
        <Card className="shadow-sm border-gray-100 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-600 relative">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute top-4 right-4 cursor-pointer"
            >
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </Button>
            </label>
          </div>

          <CardContent className="px-6 pb-6">
            <div className="flex flex-col items-center -mt-16 mb-6">
              <div className="relative">
                <Avatar key={currentUser.avatar_url || currentUser.id} className="w-24 h-24 border-4 border-white shadow-lg mb-4">
                  <AvatarImage src={currentUser.avatar_url} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">
                    {currentUser.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 cursor-pointer"
                >
                  <Button
                    size="icon"
                    className="bg-orange-500 hover:bg-orange-600 rounded-full h-8 w-8"
                    disabled={uploadingAvatar}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </label>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                {currentUser.full_name || 'User'}
              </h1>
              <p className="text-lg text-gray-600 text-center">{currentUser.title || 'Professional'}</p>
              
              <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
                <DialogTrigger asChild>
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600 rounded-full">
                    <Edit className="w-4 h-4 mr-2" />
                    {t('editProfile')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('editProfile')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('fullName')}</label>
                      <Input
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                        placeholder={t('yourFullName')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('title')}</label>
                      <Input
                        value={profileData.title}
                        onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                        placeholder={t('yourTitle')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('bio')}</label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder={t('yourBio')}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('location')}</label>
                      <Input
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        placeholder={t('yourLocation')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('phone')}</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder={t('yourPhone')}
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingProfile(false)}
                        className="flex-1"
                      >
                        {t('cancel')}
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                      >
                        {t('saveChanges')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {currentUser.bio && (
                <p className="text-gray-700 text-center">{currentUser.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                {currentUser.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{currentUser.location}</span>
                  </div>
                )}
                {currentUser.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{currentUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{t('joined', { timeAgo: formatDistanceToNow(new Date(currentUser.created_date), { addSuffix: true }) })}</span>
                </div>
              </div>

              <div className="flex justify-center gap-8 text-center pt-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{userPosts.length}</div>
                  <div className="text-sm text-gray-500">{t('posts')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {userPosts.filter(p => p.post_type === 'job').length}
                  </div>
                  <div className="text-sm text-gray-500">{t('jobsPosted')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {userPosts.filter(p => p.post_type === 'service').length}
                  </div>
                  <div className="text-sm text-gray-500">{t('services')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 mb-6 w-full">
            <TabsTrigger value="posts" className="flex-1 rounded-lg">{t('myPosts')}</TabsTrigger>
            <TabsTrigger value="about" className="flex-1 rounded-lg">{t('about')}</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onMessage={handleMessage}
                  currentUser={currentUser}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Edit className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noPostsProfile')}</h3>
                <p className="text-gray-500 mb-4">{t('shareFirstPost')}</p>
                <Button 
                  onClick={() => navigate(createPageUrl("CreatePost"))}
                  className="bg-orange-500 hover:bg-orange-600 rounded-full"
                >
                  {t('createFirstPost')}
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>{t('about')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('contactInfo')}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {currentUser.email}
                    </p>
                    {currentUser.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {currentUser.phone}
                      </p>
                    )}
                    {currentUser.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {currentUser.location}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('bio')}</h4>
                  <p className="text-gray-700">
                    {currentUser.bio || t('noBio')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
