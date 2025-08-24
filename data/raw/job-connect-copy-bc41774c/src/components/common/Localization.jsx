
import { useState, useEffect } from 'react';

export const translations = {
  en: {
    // General
    appName: "WorkerMeet",
    madeInAssam: "Made in Assam",
    search: "Search",
    all: "All",
    jobs: "Jobs",
    services: "Services",
    category: "Category",
    allCategories: "All Categories",
    filters: "Filters",
    message: "Message",
    loading: "Loading...",

    // Login
    welcomeTo: "Welcome to",
    signInToContinue: "Sign in to continue",
    continueWithGoogle: "Continue with Google",
    or: "OR",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    forgotPassword: "Forgot password?",
    needAnAccount: "Need an account?",
    signUp: "Sign up",

    // Header & Nav
    navHome: "Home",
    navExplore: "Explore",
    navPost: "Post",
    navMessages: "Messages",
    navProfile: "Profile",
    notifications: "Notifications",
    logout: "Logout",
    myProfile: "My Profile",

    // Home Page
    whatService: "What service do you need today, {name}?",
    noPostsYet: "No posts yet",
    beTheFirstPost: "Be the first to post a job or offer a service!",
    createFirstPost: "Create First Post",

    // Post Card
    jobAvailable: "Job Available",
    serviceOffered: "Service Offered",
    budget: "Budget",
    like: "Like",
    share: "Share",

    // Search Page
    exploreJobsServices: "Explore Jobs & Services",
    searchPlaceholder: "Search jobs, services, people...",
    resultsFound: "{count} result found",
    resultsFoundPlural: "{count} results found",
    noResultsFound: "No results found",
    noPostsMatchQuery: 'No posts match "{query}"',
    noPostsAvailable: "No posts available",

    // Create Post
    createPostTitle: "Post a Job or Offer a Service",
    iWantTo: "I want to:",
    selectOption: "Select an option",
    postAJob: "Post a Job (I need a worker)",
    offerAService: "Offer a Service (I am a worker)",
    title: "Title",
    titlePlaceholder: "e.g., Need Electrician for Wiring Job",
    description: "Description",
    descriptionPlaceholder: "Provide details about the job or service offered...",
    selectCategory: "Select Category",
    budgetPrice: "Budget/Price",
    budgetPlaceholder: "Enter amount",
    enableLocation: "Enable Location Access",
    locationDescription: "Allow location for better service matching",
    locationEnabled: "Location access enabled",
    submitPost: "Submit Post",
    submitting: "Submitting...",
    // Form Errors
    errorPostType: "Please select post type",
    errorTitle: "Title is required",
    errorDescription: "Description is required",
    errorCategory: "Please select a category",
    errorBudget: "Please enter a valid budget",
    // Alerts
    postSuccess: "Your post has been submitted successfully!",
    postError: "There was an error submitting your post. Please try again.",
    postUpdated: "Post updated successfully!",
    editPostTitle: "Edit Post",
    updatePost: "Update Post",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this post?",
    postDeleted: "Post deleted successfully.",

    // Messages
    searchConversations: "Search conversations...",
    activeNow: "Active now",
    typeAMessage: "Type a message...",
    noConversations: "No conversations found",
    startMessaging: "Start messaging someone to see your conversations here.",

    // Profile
    editProfile: "Edit Profile",
    fullName: "Full Name",
    yourFullName: "Your full name",
    yourTitle: "e.g., Experienced Electrician",
    bio: "Bio",
    yourBio: "Tell people about yourself...",
    location: "Location",
    yourLocation: "Your location",
    phone: "Phone",
    yourPhone: "Your phone number",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    joined: "Joined {timeAgo}",
    posts: "Posts",
    jobsPosted: "Jobs Posted",
    myPosts: "My Posts",
    about: "About",
    noPostsProfile: "No posts yet",
    shareFirstPost: "Share your first job or service post",
    contactInfo: "Contact Information",
    noBio: "No bio added yet. Edit your profile to add one!",

    // Notifications
    unread: "{count} unread",
    markAllRead: "Mark all read",
    new: "New",
    markRead: "Mark read",
    noNotifications: "No notifications yet",
    notificationsHint: "You'll see notifications about messages, job requests, and other updates here.",

    contact: "Contact",
    online: "Online",
    offline: "Offline",
    lastSeen: "Last seen",
    profileUpdated: "Profile updated successfully!",
    errorUpdatingProfile: "Error updating profile. Please try again.",
    profilePhotoUpdated: "Profile photo updated successfully!",
    errorUploadingPhoto: "Error uploading photo. Please try again.",
    failedToDeletePost: "Failed to delete post.",
    posted: "Posted",
  },
  hi: {
    // General
    appName: "वर्कर मीट",
    madeInAssam: "असम में निर्मित",
    search: "खोजें",
    all: "सभी",
    jobs: "नौकरियाँ",
    services: "सेवाएं",
    category: "श्रेणी",
    allCategories: "सभी श्रेणियां",
    filters: "फ़िल्टर",
    message: "संदेश",
    loading: "लोड हो रहा है...",

    // Login
    welcomeTo: "आपका स्वागत है",
    signInToContinue: "जारी रखने के लिए साइन इन करें",
    continueWithGoogle: "Google के साथ जारी रखें",
    or: "या",
    email: "ईमेल",
    password: "पासवर्ड",
    signIn: "साइन इन करें",
    forgotPassword: "पासवर्ड भूल गए?",
    needAnAccount: "खाता नहीं है?",
    signUp: "साइन अप करें",

    // Header & Nav
    navHome: "होम",
    navExplore: "खोजें",
    navPost: "पोस्ट",
    navMessages: "संदेश",
    navProfile: "प्रोफ़ाइल",
    notifications: "सूचनाएं",
    logout: "लॉग आउट",
    myProfile: "मेरी प्रोफ़ाइल",

    // Home Page
    whatService: "आज आपको किस सेवा की आवश्यकता है, {name}?",
    noPostsYet: "अभी तक कोई पोस्ट नहीं है",
    beTheFirstPost: "नौकरी पोस्ट करने या सेवा प्रदान करने वाले पहले व्यक्ति बनें!",
    createFirstPost: "पहली पोस्ट बनाएं",

    // Post Card
    jobAvailable: "नौकरी उपलब्ध है",
    serviceOffered: "सेवा की पेशकश",
    budget: "बजट",
    like: "पसंद करें",
    share: "शेयर करें",

    // Search Page
    exploreJobsServices: "नौकरियां और सेवाएं खोजें",
    searchPlaceholder: "नौकरियां, सेवाएं, लोग खोजें...",
    resultsFound: "{count} परिणाम मिला",
    resultsFoundPlural: "{count} परिणाम मिले",
    noResultsFound: "कोई परिणाम नहीं मिला",
    noPostsMatchQuery: '"{query}" से कोई पोस्ट मेल नहीं खाती',
    noPostsAvailable: "कोई पोस्ट उपलब्ध नहीं है",

    // Create Post
    createPostTitle: "नौकरी पोस्ट करें या सेवा प्रदान करें",
    iWantTo: "मैं चाहता हूँ:",
    selectOption: "एक विकल्प चुनें",
    postAJob: "नौकरी पोस्ट करें (मुझे एक कार्यकर्ता चाहिए)",
    offerAService: "एक सेवा प्रदान करें (मैं एक कार्यकर्ता हूँ)",
    title: "शीर्षक",
    titlePlaceholder: "जैसे, वायरिंग जॉब के लिए इलेक्ट्रीशियन चाहिए",
    description: "विवरण",
    descriptionPlaceholder: "नौकरी या प्रस्तावित सेवा के बारे में विवरण प्रदान करें...",
    selectCategory: "श्रेणी चुनें",
    budgetPrice: "बजट/कीमत",
    budgetPlaceholder: "राशि दर्ज करें",
    enableLocation: "स्थान पहुंच सक्षम करें",
    locationDescription: "बेहतर सेवा मिलान के लिए स्थान की अनुमति दें",
    locationEnabled: "स्थान पहुंच सक्षम है",
    submitPost: "पोस्ट सबमिट करें",
    submitting: "सबमिट हो रहा है...",
    // Form Errors
    errorPostType: "कृपया पोस्ट प्रकार चुनें",
    errorTitle: "शीर्षक आवश्यक है",
    errorDescription: "विवरण आवश्यक है",
    errorCategory: "कृपया एक श्रेणी चुनें",
    errorBudget: "कृपया एक वैध बजट दर्ज करें",
    // Alerts
    postSuccess: "आपकी पोस्ट सफलतापूर्वक सबमिट हो गई है!",
    postError: "आपकी पोस्ट सबमिट करने में एक त्रुटि हुई। कृपया पुन: प्रयास करें।",
    postUpdated: "पोस्ट सफलतापूर्वक अपडेट किया गया!",
    editPostTitle: "पोस्ट संपादित करें",
    updatePost: "पोस्ट अपडेट करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    confirmDelete: "क्या आप निश्चित रूप से इस पोस्ट को हटाना चाहते हैं?",
    postDeleted: "पोस्ट सफलतापूर्वक हटा दिया गया।",

    // Messages
    searchConversations: "बातचीत खोजें...",
    activeNow: "अभी सक्रिय",
    typeAMessage: "एक संदेश टाइप करें...",
    noConversations: "कोई बातचीत नहीं मिली",
    startMessaging: "अपनी बातचीत यहाँ देखने के लिए किसी को संदेश भेजना शुरू करें।",

    // Profile
    editProfile: "प्रोफ़ाइल संपादित करें",
    fullName: "पूरा नाम",
    yourFullName: "आपका पूरा नाम",
    yourTitle: "जैसे, अनुभवी इलेक्ट्रीशियन",
    bio: "बायो",
    yourBio: "लोगों को अपने बारे में बताएं...",
    location: "स्थान",
    yourLocation: "आपका स्थान",
    phone: "फ़ोन",
    yourPhone: "आपका फ़ोन नंबर",
    cancel: "रद्द करें",
    saveChanges: "बदलाव सहेजें",
    joined: "{timeAgo} शामिल हुए",
    posts: "पोस्ट",
    jobsPosted: "पोस्ट की गई नौकरियाँ",
    myPosts: "मेरी पोस्ट",
    about: "विवरण",
    noPostsProfile: "अभी तक कोई पोस्ट नहीं है",
    shareFirstPost: "अपनी पहली नौकरी या सेवा पोस्ट साझा करें",
    contactInfo: "संपर्क जानकारी",
    noBio: "अभी तक कोई बायो नहीं जोड़ा गया है। एक जोड़ने के लिए अपनी प्रोफ़ाइल संपादित करें!",

    // Notifications
    unread: "{count} अपठित",
    markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
    new: "नया",
    markRead: "पढ़ा हुआ चिह्नित करें",
    noNotifications: "अभी तक कोई सूचना नहीं है",
    notificationsHint: "आपको यहां संदेशों, नौकरी अनुरोधों और अन्य अपडेट के बारे में सूचनाएं दिखाई देंगी।",
    
    contact: "संपर्क करें",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    lastSeen: "अंतिम बार देखा गया",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट किया गया!",
    errorUpdatingProfile: "प्रोफ़ाइल अपडेट करने में त्रुटि। कृपया पुन: प्रयास करें।",
    profilePhotoUpdated: "प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट किया गया!",
    errorUploadingPhoto: "फ़ोटो अपलोड करने में त्रुटि। कृपया पुन: प्रयास करें।",
    failedToDeletePost: "पोस्ट हटाने में असफल।",
    posted: "पोस्ट किया गया",
  },
};

export const useLocalization = () => {
    const [language, setLanguageState] = useState('en');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') || 'en';
        setLanguageState(savedLanguage);
        
        const handleStorageChange = () => {
            setLanguageState(localStorage.getItem('language') || 'en');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    
    const setLanguage = (lang) => {
        localStorage.setItem('language', lang);
        window.dispatchEvent(new Event('storage'));
        window.location.reload();
    };

    const t = (key, params = {}) => {
        let string = translations[language]?.[key] || translations['en'][key] || key;
        for (const param in params) {
            string = string.replace(`{${param}}`, params[param]);
        }
        return string;
    };
    
    return { t, setLanguage, language };
};
