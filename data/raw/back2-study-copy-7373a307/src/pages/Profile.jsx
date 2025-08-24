
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User as UserIcon, Globe, Phone, Mail, GraduationCap, Brain, Palette, Edit, Save, AlertTriangle, Settings, Trash2, LogOut, Bell, Shield } from "lucide-react"; // Added Trash2, LogOut, Bell, Shield
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useTheme } from '../components/ui/theme-provider';
import UserStats from '../components/profile/UserStats';
import AchievementList from '../components/profile/AchievementList';
import PermissionManager from '../components/permissions/PermissionManager';
import { useNavigate } from 'react-router-dom'; // Added useNavigate

// Removed Dialog imports as the complex delete dialog is replaced
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

const translations = {
  he: {
    profile: "פרופיל משתמש",
    personalInfo: "מידע אישי",
    fullName: "שם מלא",
    email: "אימייל",
    phone: "טלפון",
    academicInfo: "מידע אקדמי",
    gradeLevel: "רמת כיתה",
    learningStyle: "סגנון למידה",
    visual: "חזותי",
    auditory: "שמיעתי",
    kinesthetic: "קינסטטי",
    mixed: "מעורב",
    preferences: "העדפות",
    language: "שפה",
    hebrew: "עברית",
    english: "אנגלית",
    dailyStudyTime: "זמן לימוד יומי",
    minutes: "דקות",
    notifications: "התראות",
    smsNotifications: "התראות SMS",
    enableSMS: "קבל התראות SMS",
    phoneRequired: "נדרש מספר טלפון להתראות SMS",
    theme: "ערכת נושא",
    darkMode: "מצב כהה",
    lightMode: "מצב בהיר",
    saveChanges: "שמור שינויים",
    saving: "שומר...",
    saved: "נשמר בהצלחה!",
    edit: "ערוך",
    cancel: "בטל",
    achievements: "הישגים",
    deleteAccount: "מחק חשבון",
    // Removed specific dialog translations
    // deleteAccountWarning: "אזהרה: פעולה זו תמחק לצמיתות את החשבון ואת כל הנתונים",
    // deleteAccountTitle: "מחיקת חשבון",
    // deleteAccountDescription: "האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו אינה ניתנת לביטול ותמחק את כל הנתונים שלך לצמיתות.",
    // typeDeleteToConfirm: "הקלד 'מחק' כדי לאשר",
    // deleteConfirmationText: "מחק",
    // confirmDelete: "מחק סופית",
    accountDeleted: "החשבון נמחק בהצלחה",
    accountManagement: "ניהול חשבון",
    dangerZone: "אזור סכנה",
    deleteConfirm: "האם אתה בטוח שברצונך למחוק את חשבונך? פעולה זו אינה ניתנת לביטול.", // New
    deleteError: "שגיאה במחיקת החשבון. אנא נסה שוב.", // New
    logout: "התנתק", // New
  },
  en: {
    profile: "User Profile",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    academicInfo: "Academic Information",
    gradeLevel: "Grade Level",
    learningStyle: "Learning Style",
    visual: "Visual",
    auditory: "Auditory",
    kinesthetic: "Kinesthetic",
    mixed: "Mixed",
    preferences: "Preferences",
    language: "Language",
    hebrew: "Hebrew",
    english: "English",
    dailyStudyTime: "Daily Study Time",
    minutes: "minutes",
    notifications: "Notifications",
    smsNotifications: "SMS Notifications",
    enableSMS: "Receive SMS notifications",
    phoneRequired: "Phone number required for SMS notifications",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    saveChanges: "Save Changes",
    saving: "Saving...",
    saved: "Saved successfully!",
    edit: "Edit",
    cancel: "Cancel",
    achievements: "Achievements",
    deleteAccount: "Delete Account",
    // Removed specific dialog translations
    // deleteAccountWarning: "Warning: This action will permanently delete your account and all data",
    // deleteAccountTitle: "Delete Account",
    // deleteAccountDescription: "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.",
    // typeDeleteToConfirm: "Type 'DELETE' to confirm",
    // deleteConfirmationText: "DELETE",
    // confirmDelete: "Delete Forever",
    accountDeleted: "Account successfully deleted",
    accountManagement: "Account Management",
    dangerZone: "Danger Zone",
    deleteConfirm: "Are you sure you want to delete your account? This action is irreversible.", // New
    deleteError: "Error deleting account. Please try again.", // New
    logout: "Logout", // New
  }
};

// AccountManagement component is removed as its functionality is moved directly into Profile
// const AccountManagement = ({ user, onUpdate, language }) => { /* ... */ };


export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete
  const { theme, language, toggleTheme, changeLanguage, themeClasses } = useTheme();
  const navigate = useNavigate(); // Initialize useNavigate

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    grade_level: '',
    learning_style: 'mixed',
    daily_study_time: 60,
    sms_notifications: false,
    preferred_language: language || 'en'
  });

  const t = translations[language || 'en'];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        grade_level: userData.grade_level || '',
        learning_style: userData.learning_style || 'mixed',
        daily_study_time: userData.daily_study_time || 60,
        sms_notifications: userData.sms_notifications || false,
        preferred_language: userData.preferred_language || language || 'en'
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      // Handle error, e.g., redirect to login if unauthorized
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      await User.updateMyUserData(formData);

      // Update language in theme context if it changed
      if (formData.preferred_language !== language) {
        changeLanguage(formData.preferred_language);
      }

      setSaveMessage(t.saved);
      setIsEditing(false); // Exit edit mode after saving
      setTimeout(() => setSaveMessage(''), 3000);
      // Re-load user data to ensure UI is in sync with backend after save
      loadUserData();
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset formData to current user data
    if (user) {
        setFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            grade_level: user.grade_level || '',
            learning_style: user.learning_style || 'mixed',
            daily_study_time: user.daily_study_time || 60,
            sms_notifications: user.sms_notifications || false,
            preferred_language: user.preferred_language || language || 'en'
        });
    }
    setIsEditing(false);
  };

  const handlePermissionChange = (permissionId, status) => {
    console.log(`Permission ${permissionId} changed to ${status}`);
    // Can add additional logic here if needed
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      navigate('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Logout failed:', error);
      alert(language === 'he' ? 'שגיאה בהתנתקות. אנא נסה שוב.' : 'Logout failed. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t.deleteConfirm);
    if (confirmed) {
        setIsDeleting(true);
        try {
            await User.delete(user.id); // Assuming User.delete exists and takes user ID
            await User.logout(); // Clear session/token
            alert(t.accountDeleted); // Show success message
            navigate('/'); // Redirect to home or login page after successful deletion
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert(t.deleteError);
        } finally {
            setIsDeleting(false);
        }
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClasses.background}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Ensure user is not null before rendering dependent components that rely on user.id
  if (!user) {
    return <div className={`flex items-center justify-center min-h-screen ${themeClasses.background}`}>Error: User data not loaded.</div>;
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">

        {/* Profile Card (top section, full width) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl p-4 sm:p-6">
            <div className="absolute top-4 right-4 flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                  >
                    <Save className="w-4 h-4 mr-1" /> {t.saveChanges}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                  >
                    {t.cancel}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Edit className="w-4 h-4 mr-1" /> {t.edit}
                </Button>
              )}
            </div>

            <CardHeader className="flex flex-col items-center gap-4 text-center pt-8">
              <Avatar className="w-24 h-24 border-4 border-blue-500/50">
                <AvatarImage src={user.profile_picture_url || "/placeholder-avatar.png"} alt={formData.full_name || "User Avatar"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 text-3xl font-bold">
                  {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : <UserIcon className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className={`${themeClasses.textPrimary} text-3xl font-bold`}>
                  {formData.full_name || t.profile}
                </CardTitle>
                <p className={`${themeClasses.textMuted} text-lg flex items-center justify-center gap-2`}>
                  <Mail className="w-4 h-4" /> {formData.email}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <Label className={themeClasses.textSecondary}>{t.fullName}</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                    disabled={!isEditing}
                  />
                </div>
                {/* Phone Number */}
                <div>
                  <Label className={themeClasses.textSecondary}>{t.phone}</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="+1234567890"
                    className="bg-white/5 border-white/20 text-white"
                    disabled={!isEditing}
                  />
                </div>
                {/* Grade Level */}
                <div>
                  <Label className={themeClasses.textSecondary}>{t.gradeLevel}</Label>
                  <Input
                    value={formData.grade_level}
                    onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                    placeholder="12th Grade"
                    className="bg-white/5 border-white/20 text-white"
                    disabled={!isEditing}
                  />
                </div>
                {/* Learning Style */}
                <div>
                  <Label className={themeClasses.textSecondary}>{t.learningStyle}</Label>
                  <Select
                    value={formData.learning_style}
                    onValueChange={(value) => setFormData({...formData, learning_style: value})}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder={t.learningStyle} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="visual">{t.visual}</SelectItem>
                      <SelectItem value="auditory">{t.auditory}</SelectItem>
                      <SelectItem value="kinesthetic">{t.kinesthetic}</SelectItem>
                      <SelectItem value="mixed">{t.mixed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Daily Study Time */}
                <div className="md:col-span-2">
                  <Label className={themeClasses.textSecondary}>{t.dailyStudyTime}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="15"
                      max="480"
                      value={formData.daily_study_time}
                      onChange={(e) => setFormData({...formData, daily_study_time: parseInt(e.target.value)})}
                      className="bg-white/5 border-white/20 text-white"
                      disabled={!isEditing}
                    />
                    <span className={`text-sm ${themeClasses.textMuted}`}>{t.minutes}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid (1/3 for Stats/Achievements, 2/3 for other sections) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (1/3) for User Stats and Achievements */}
          <div className="lg:col-span-1 space-y-8">
            {/* User Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className={`${themeClasses.textPrimary} flex items-center gap-2`}>
                    <GraduationCap className="w-5 h-5" />
                    {language === 'he' ? 'סטטיסטיקות לימוד' : 'Study Statistics'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.id && <UserStats userId={user.id} language={language} />}
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className={`${themeClasses.textPrimary} flex items-center gap-2`}>
                    <Brain className="w-5 h-5" />
                    {t.achievements}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.id && <AchievementList userId={user.id} language={language} />}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column (2/3) for Permissions, Preferences, Notifications, and Account Management */}
          <div className="lg:col-span-2 space-y-8">
            {/* Permissions Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className={themeClasses.cardGlass}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${themeClasses.textPrimary}`}>
                    <Shield className="w-5 h-5" />
                    {language === 'he' ? 'הרשאות' : 'Permissions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PermissionManager
                    language={language}
                    onPermissionChange={handlePermissionChange}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Preferences and Notifications - Grouped into a grid for layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preferences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className={themeClasses.cardGlass}>
                  <CardHeader>
                    <CardTitle className={`${themeClasses.textPrimary} flex items-center gap-2`}>
                      <Globe className="w-5 h-5" />
                      {t.preferences}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className={themeClasses.textSecondary}>{t.language}</Label>
                      <Select
                        value={formData.preferred_language}
                        onValueChange={(value) => setFormData({...formData, preferred_language: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="he">{t.hebrew}</SelectItem>
                          <SelectItem value="en">{t.english}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className={themeClasses.textSecondary}>{t.theme}</Label>
                        <p className={`text-xs ${themeClasses.textMuted}`}>
                          {theme === 'dark' ? t.darkMode : t.lightMode}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        {theme === 'dark' ? t.lightMode : t.darkMode}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Card className={themeClasses.cardGlass}>
                  <CardHeader>
                    <CardTitle className={`${themeClasses.textPrimary} flex items-center gap-2`}>
                      <Bell className="w-5 h-5" />
                      {t.notifications}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className={themeClasses.textSecondary}>{t.enableSMS}</Label>
                        <p className={`text-xs ${themeClasses.textMuted}`}>
                          {!formData.phone_number ? t.phoneRequired : t.smsNotifications}
                        </p>
                      </div>
                      <Switch
                        checked={formData.sms_notifications && !!formData.phone_number}
                        onCheckedChange={(checked) => setFormData({...formData, sms_notifications: checked})}
                        disabled={!formData.phone_number || !isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Account Management Section (moved from separate component) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className={`${themeClasses.cardGlass} border-red-500/20 bg-red-500/5`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-red-400`}>
                    <Settings className="w-5 h-5" />
                    {t.accountManagement}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-red-400 mb-4">{t.dangerZone}</h4>
                  <p className="text-gray-400 mb-4 text-sm">
                    {language === 'he'
                      ? 'מחיקת החשבון תסיר לצמיתות את כל הנתונים שלך, כולל פרופיל, היסטוריית לימודים, הודעות וקבצים. פעולה זו אינה הפיכה.'
                      : 'Deleting your account will permanently remove all your data, including profile, study history, messages, and files. This action cannot be undone.'
                    }
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting
                        ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto"
                            />
                          )
                        : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t.deleteAccount}
                            </>
                          )
                      }
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t.logout}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Global Save Button (visible when not editing the profile card) */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              {isSaving ? t.saving : t.saveChanges}
            </Button>

            {saveMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 text-sm ${saveMessage === t.saved ? 'text-green-400' : 'text-red-400'}`}
              >
                {saveMessage}
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
