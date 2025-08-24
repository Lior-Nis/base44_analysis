

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { GeckoImage } from "@/api/entities";
import { User } from "@/api/entities";
import { Gecko } from "@/api/entities";
import { ForumPost } from "@/api/entities";
import { Notification } from "@/api/entities";
import { DirectMessage } from "@/api/entities";
import { MorphReferenceImage } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import {
  Database, BookOpen, BarChart3, Upload, Eye, Users, HeartHandshake, Moon, Sun, Layers, LogOut, ExternalLink, Search, Settings, UserPlus, Award, Shield, MessageSquare, Wrench, Bell, Mail, Heart, Brain, Menu, ShoppingCart, GitBranch,
  LogIn, ChevronDown, X as CloseIcon, FlaskConical, LifeBuoy, LayoutDashboard, Star, Trophy
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarProvider,
  useSidebar
} from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import NotificationDropdown from "../components/ui/NotificationDropdown";
import UserBadge from '../components/ui/UserBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Much more conservative cache with longer durations
class DataCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.requestTimestamps = new Map();
    this.CACHE_DURATION = 60 * 60 * 1000; // Increased to 1 hour
    this.MIN_REQUEST_INTERVAL = 30000; // Minimum 30 seconds between same requests
  }

  isCacheValid(key) {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  canMakeRequest(key) {
    const lastRequest = this.requestTimestamps.get(key);
    if (!lastRequest) return true;
    return Date.now() - lastRequest > this.MIN_REQUEST_INTERVAL;
  }

  markRequestMade(key) {
    this.requestTimestamps.set(key, Date.now());
  }

  get(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  set(key, data) {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  clear(key) {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    this.requestTimestamps.delete(key);
  }

  clearAll() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.requestTimestamps.clear();
  }
}

// Global cache instance
const dataCache = new DataCache();
window.dataCache = dataCache;

// Utility functions with much longer delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced retry with exponential backoff
const retryApiCall = async (apiCall, maxRetries = 2, initialDelayMs = 10000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Rate limit hit, waiting ${delayMs}ms before retry (attempt ${attempt}/${maxRetries})`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
};

// Much longer debounce
const debouncedApiCall = (() => {
  const debounceMap = new Map();
  
  return (key, apiCall, delayMs = 5000) => { // Increased to 5 seconds
    return new Promise((resolve, reject) => {
      if (debounceMap.has(key)) {
        clearTimeout(debounceMap.get(key));
      }
      
      const timeoutId = setTimeout(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          debounceMap.delete(key);
        }
      }, delayMs);
      
      debounceMap.set(key, timeoutId);
    });
  };
})();

window.delay = delay;
window.retryApiCall = retryApiCall;

// Navigation items
const publicNavItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: BarChart3 },
  { title: "Morph ID", url: createPageUrl("Recognition"), icon: Search },
  { title: "Morph Visualizer", url: createPageUrl("MorphVisualizer"), icon: Layers },
  { title: "AI Consultant", url: createPageUrl("BreederConsultant"), icon: FlaskConical },
  { title: "Morph Guide", url: createPageUrl("MorphGuide"), icon: BookOpen },
  { title: "Care Guide", url: createPageUrl("CareGuide"), icon: Heart },
  { title: "Forum", url: createPageUrl("Forum"), icon: MessageSquare },
  { title: "Image Gallery", url: createPageUrl("Gallery"), icon: Database },
  { title: "Marketplace", url: createPageUrl("MarketplaceBuy"), icon: ShoppingCart }
];

const userSpecificNavItems = [
  { title: "My Geckos", url: createPageUrl("MyGeckos"), icon: Users },
  { title: "Breeding", url: createPageUrl("Breeding"), icon: GitBranch },
  { title: "Lineage", url: createPageUrl("Lineage"), icon: GitBranch },
  { title: "Sell Geckos", url: createPageUrl("MarketplaceSell"), icon: Upload },
  { title: "My Profile", url: createPageUrl("MyProfile"), icon: Users },
  { title: "Train Model", url: createPageUrl("Training"), icon: Upload },
];

const adminOnlyNavItems = [
  { title: "Admin Panel", url: createPageUrl("AdminPanel"), icon: Shield }
];

// Milestone and level constants
const MILESTONES = [
  { count: 1000, title: "Community Contributor", description: "First major milestone reached!" },
  { count: 5000, title: "Expert Trainer", description: "Advanced AI training achieved!" },
  { count: 10000, title: "Master Classifier", description: "Professional-grade dataset!" },
  { count: 100000, title: "AI Pioneer", description: "Revolutionary training dataset!" }
];

const USER_LEVELS = [
  { geckos: 1, title: "New Collector", badge: "🥚" },
  { geckos: 2, title: "Gecko Keeper", badge: "🦎" },
  { geckos: 5, title: "Hobbyist", badge: "🌿" },
  { geckos: 10, title: "Enthusiast", badge: "⭐" },
  { geckos: 15, title: "Dedicated Keeper", badge: "🌱" },
  { geckos: 20, title: "Breeder", badge: "❤️‍🔥" },
  { geckos: 30, title: "Pro Breeder", badge: "🏆" },
  { geckos: 40, title: "Expert Breeder", badge: "🧬" },
  { geckos: 50, title: "Master Breeder", badge: "👑" },
  { geckos: 75, title: "Grandmaster", badge: "🌌" },
  { geckos: 100, title: "Living Legend", badge: "💫" },
  { geckos: 150, title: "Gecko Tycoon", badge: "💼" },
  { geckos: 200, title: "Scale Sovereign", badge: "🏰" },
  { geckos: 300, title: "Reptile Royalty", badge: "⚜️" },
  { geckos: 500, title: "Crested King", badge: "🦁" },
];

const EXPERT_LEVELS = [
  { level: 1, title: "Apprentice Trainer", points: 10, badge: "🌱" },
  { level: 2, title: "Skilled Recognizer", points: 50, badge: "🧠" },
  { level: 3, title: "Master Annotator", points: 100, badge: "✍️" },
  { level: 4, title: "AI Virtuoso", points: 250, badge: "🤖" },
  { level: 5, title: "Gecko AI Grandmaster", points: 500, badge: "🌟" }
];

const COMMUNITY_LEVELS = [
  { level: 1, title: "New Contributor", points: 1, badge: "📝" },
  { level: 2, title: "Active Talker", points: 5, badge: "🗣️" },
  { level: 3, title: "Forum Regular", points: 10, badge: "💬" },
  { level: 4, title: "Community Pillar", points: 25, badge: "🏛️" },
  { level: 5, title: "Gecko Guru", points: 50, badge: "🎓" },
];

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [imageCount, setImageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [imageLevel, setImageLevel] = useState(null);
  const [communityLevel, setCommunityLevel] = useState(null);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [appLogo, setAppLogo] = useState(null);

  const { toggleSidebar } = useSidebar();

  const getUserLevel = (geckoCount) => {
    return [...USER_LEVELS].reverse().find((level) => geckoCount >= level.geckos) || USER_LEVELS[0];
  };

  const getNextLevel = (geckoCount) => {
    return USER_LEVELS.find((level) => geckoCount < level.geckos);
  };

  const getImageLevel = (imageCount) => {
    return [...EXPERT_LEVELS].reverse().find((level) => imageCount >= level.points) || EXPERT_LEVELS[0];
  };

  const getCommunityLevel = (postCount) => {
    return [...COMMUNITY_LEVELS].reverse().find((level) => postCount >= level.points) || COMMUNITY_LEVELS[0];
  };

  useEffect(() => {
    const logoUrl = window.APP_LOGO_URL;
    if (logoUrl && logoUrl !== 'undefined' && logoUrl !== '') {
      setAppLogo(logoUrl);
    } else {
      setAppLogo('https://i.imgur.com/gfaW2Yg.png');
    }
  }, []);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleScroll = () => {
      sessionStorage.setItem('sidebarScrollPos', sidebar.scrollTop.toString());
    };

    const scrollPos = sessionStorage.getItem('sidebarScrollPos');
    if (scrollPos) {
      setTimeout(() => {
        if (sidebarRef.current) {
          sidebarRef.current.scrollTop = parseInt(scrollPos, 10);
        }
      }, 50);
    }

    sidebar.addEventListener('scroll', handleScroll);
    return () => {
      if (sidebar) {
        sidebar.removeEventListener('scroll', handleScroll);
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Much less aggressive polling - only every 10 minutes and with heavy caching
  useEffect(() => {
    if (user && user.email) {
      const fetchUnread = async () => {
        try {
          const cacheKey = `notifications_${user.email}`;
          let unreadNotifications = dataCache.get(cacheKey);
          
          if (!unreadNotifications && dataCache.canMakeRequest(cacheKey)) {
            dataCache.markRequestMade(cacheKey);
            unreadNotifications = await retryApiCall(() => 
              Notification.filter({ user_email: user.email, is_read: false })
            );
            if (unreadNotifications) {
              dataCache.set(cacheKey, unreadNotifications);
              setUnreadNotificationsCount(unreadNotifications.length);
            }
          } else if (unreadNotifications) {
            setUnreadNotificationsCount(unreadNotifications.length);
          }
        } catch (e) {
          console.error("Polling for notifications failed:", e);
          // Don't retry on rate limit errors
          if (e.response?.status !== 429) {
            setUnreadNotificationsCount(0);
          }
        }
      };

      fetchUnread();
      const interval = setInterval(fetchUnread, 600000); // Every 10 minutes
      return () => clearInterval(interval);
    } else {
      setUnreadNotificationsCount(0);
    }
  }, [user]);
  
  // Much less aggressive message polling  
  useEffect(() => {
    if (user && user.email) {
      const fetchUnreadMessages = async () => {
        try {
          const cacheKey = `unread_messages_count_${user.email}`;
          let cachedCount = dataCache.get(cacheKey);
          
          if (cachedCount !== null) {
            setUnreadMessages(cachedCount);
          } else if (dataCache.canMakeRequest(cacheKey)) {
            dataCache.markRequestMade(cacheKey);
            const unread = await retryApiCall(() =>
              DirectMessage.filter({ recipient_email: user.email, is_read: false })
            );
            setUnreadMessages(unread.length);
            dataCache.set(cacheKey, unread.length);
          }
        } catch (e) {
          console.error("Polling for messages failed:", e);
          // Don't retry on rate limit errors
          if (e.response?.status !== 429) {
            setUnreadMessages(0);
          }
        }
      };

      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 600000); // Every 10 minutes
      return () => clearInterval(interval);
    } else {
      setUnreadMessages(0);
    }
  }, [user]);

  // Enhanced authentication check with better error handling and periodic re-check
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Try to get user first with heavy caching
        let currentUser = dataCache.get('current_user');
        if (!currentUser && dataCache.canMakeRequest('current_user')) {
          try {
            dataCache.markRequestMade('current_user');
            currentUser = await retryApiCall(() => User.me());
            if (currentUser) {
              dataCache.set('current_user', currentUser);
              setUser(currentUser);
              console.log('User authenticated successfully:', currentUser.email);
            }
          } catch (error) {
            console.log("User authentication check failed:", error);
            setUser(null);
            setUserLevel(null);
            setImageLevel(null);
            setCommunityLevel(null);
            setUnreadMessages(0);
            setUnreadNotificationsCount(0);
            
            // Clear any cached user data on auth failure
            dataCache.clear('current_user');
          }
        } else if (currentUser) {
          setUser(currentUser);
        }

        // Load user-specific data with very heavy caching
        if (currentUser) {
          let userContributions = dataCache.get(`user_contributions_${currentUser.email}`);
          if (!userContributions && dataCache.canMakeRequest(`user_contributions_${currentUser.email}`)) {
            try {
              dataCache.markRequestMade(`user_contributions_${currentUser.email}`);
              
              // Use Promise.allSettled and be more defensive
              const results = await Promise.allSettled([
                retryApiCall(() => Gecko.filter({ created_by: currentUser.email })),
                retryApiCall(() => GeckoImage.filter({ created_by: currentUser.email })),
                retryApiCall(() => ForumPost.filter({ created_by: currentUser.email }))
              ]);

              userContributions = {
                geckoCount: results[0].status === 'fulfilled' ? results[0].value.length : 0,
                imageCount: results[1].status === 'fulfilled' ? results[1].value.length : 0,
                postCount: results[2].status === 'fulfilled' ? results[2].value.length : 0
              };
              dataCache.set(`user_contributions_${currentUser.email}`, userContributions);
            } catch (error) {
              console.log("Could not load user contributions (rate limited):", error);
              userContributions = { geckoCount: 0, imageCount: 0, postCount: 0 };
            }
          }

          if (userContributions) {
            const level = getUserLevel(userContributions.geckoCount);
            setUserLevel({ ...level, geckoCount: userContributions.geckoCount });

            const imageLevelData = getImageLevel(userContributions.imageCount);
            setImageLevel({ ...imageLevelData, imageCount: userContributions.imageCount });

            const communityLevelData = getCommunityLevel(userContributions.postCount);
            setCommunityLevel({ ...communityLevelData, contributionCount: userContributions.postCount });
          }
        }

        // Load public data with very heavy caching
        let images = dataCache.get('gecko_images');
        if (!images && dataCache.canMakeRequest('gecko_images')) {
          try {
            dataCache.markRequestMade('gecko_images');
            images = await retryApiCall(() => GeckoImage.list());
            if (images) {
              dataCache.set('gecko_images', images);
            }
          } catch (error) {
            console.log("Could not load images (rate limited):", error);
            // Use fallback data
            images = dataCache.get('gecko_images') || [];
          }
        }

        if (images && images.length > 0) {
          setImageCount(images.length);
          const milestone = [...MILESTONES].reverse().find((m) => images.length >= m.count);
          setCurrentMilestone(milestone);
        } else {
          // Use reasonable fallback if no images or rate limited
          setImageCount(2500); 
        }

        let pinnedPostsData = dataCache.get('pinned_posts');
        if (!pinnedPostsData && dataCache.canMakeRequest('pinned_posts')) {
          try {
            dataCache.markRequestMade('pinned_posts');
            pinnedPostsData = await retryApiCall(() => ForumPost.filter({ is_pinned: true }, "-created_date", 5));
            if (pinnedPostsData) {
              dataCache.set('pinned_posts', pinnedPostsData);
            }
          } catch (error) {
            console.log("Could not load pinned posts (rate limited):", error);
            pinnedPostsData = [];
          }
        }

        if (pinnedPostsData) {
          setPinnedPosts(pinnedPostsData);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up periodic auth check every 30 seconds
    const authCheckInterval = setInterval(async () => {
      // Only attempt to check authentication if current user state is null
      // This prevents unnecessary API calls if the user is already known to be logged in
      if (!user) {
        try {
          const currentUserCheck = await User.me();
          if (currentUserCheck) {
            console.log('Authentication state recovered, reloading data.');
            setUser(currentUserCheck);
            dataCache.set('current_user', currentUserCheck);
            // Trigger a full data reload to get user-specific content
            fetchData(); 
          }
        } catch (error) {
          // User is still not authenticated or error occurred, continue checking
          // Clear cache to ensure subsequent checks are fresh if there was a transient issue
          dataCache.clear('current_user');
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(authCheckInterval); // Cleanup on component unmount
  }, [user]); // Re-run effect if `user` state changes (e.g., from null to user object)


  const handleLogin = async () => {
    try {
      // Revert to the standard login method to prevent iframe issues.
      await User.login();
      // Clear cache and reload data after successful login to ensure full state sync
      dataCache.clearAll();
      window.location.reload(); 
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      setUserLevel(null);
      setImageLevel(null);
      setCommunityLevel(null);
      dataCache.clearAll();
      setUnreadNotificationsCount(0);
      setUnreadMessages(0);
      window.location.reload(); // Reload page after logout for full state reset
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoginPrompt = (featureName) => {
    if (window.confirm(`${featureName} requires an account. Would you like to sign up or log in now?`)) {
      handleLogin();
    }
  };

  const nextMilestone = MILESTONES.find((m) => imageCount < m.count);
  const goalCount = nextMilestone ? nextMilestone.count : 100000;
  const progressPercent = Math.min(100, imageCount / goalCount * 100);

  const getSidebarBadge = () => {
    if (!user) return null;

    const pref = user.sidebar_badge_preference || 'collection';

    if (pref === 'collection' && userLevel) {
      return {
        badge: userLevel.badge,
        title: userLevel.title,
        count: userLevel.geckoCount,
        label: "geckos"
      };
    }
    if (pref === 'ai_training' && imageLevel) {
      return {
        badge: imageLevel.badge,
        title: imageLevel.title,
        count: imageLevel.imageCount,
        label: 'images'
      }
    }
    if (pref === 'community' && communityLevel) {
      return {
        badge: communityLevel.badge,
        title: communityLevel.title,
        count: communityLevel.contributionCount,
        label: 'contributions'
      }
    }
    if (userLevel) {
      return {
        badge: userLevel.badge,
        title: userLevel.title,
        count: userLevel.geckoCount,
        label: "geckos"
      };
    }

    return null;
  }

  const sidebarBadge = getSidebarBadge();

  const renderNavSection = (items, title) => {
    return (
      <div className="mb-4">
        {title && <div className="text-xs font-semibold text-sage-700 uppercase tracking-wider px-4 py-2">{title}</div>}
        <nav className="space-y-1 px-2">
          {items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`group flex items-center rounded-md px-2 py-2 text-xs font-medium transition-colors duration-200 sidebar-nav-item
                  ${isActive
                    ? "active"
                    : "text-gray-600 dark:text-gray-300 hover:bg-sage-50 dark:hover:bg-gray-700 hover:text-sage-900 dark:hover:text-white"
                  }`}
              >
                <item.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          html, body, #root {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          .app-container-outline {
            width: 100%;
            min-height: 100vh; /* Changed from height to min-height for better compatibility */
            display: flex;
            background: linear-gradient(135deg, #0a0f0a 0%, #1a2920 100%);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          }

          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

          @supports (display-mode: standalone) {
            .app-container-outline {
              min-height: 100vh !important; /* Use min-height for safety */
              padding-top: env(safe-area-inset-top) !important;
              padding-bottom: env(safe-area-inset-bottom) !important;
            }
          }

          .gecko-glow {
            box-shadow: 
              0 0 20px rgba(134, 239, 172, 0.3),
              0 0 40px rgba(134, 239, 172, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .gecko-shimmer {
            background: linear-gradient(
              45deg,
              rgba(134, 239, 172, 0.1) 0%,
              rgba(167, 243, 208, 0.2) 25%,
              rgba(74, 222, 128, 0.3) 50%,
              rgba(167, 243, 208, 0.2) 75%,
              rgba(134, 239, 172, 0.1) 100%
            );
            background-size: 200% 200%;
            animation: shimmer 3s ease-in-out infinite;
          }

          @keyframes shimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          .gecko-scale-pattern {
            background-image: 
              radial-gradient(circle at 20% 50%, rgba(134, 239, 172, 0.1) 2px, transparent 2px),
              radial-gradient(circle at 80% 50%, rgba(74, 222, 128, 0.1) 1px, transparent 1px),
              radial-gradient(circle at 40% 20%, rgba(167, 243, 208, 0.08) 1px, transparent 1px),
              radial-gradient(circle at 60% 80%, rgba(134, 239, 172, 0.06) 2px, transparent 2px);
            background-size: 30px 30px, 25px 25px, 40px 40px, 35px 35px;
            background-position: 0 0, 15px 15px, 5px 10px, 25px 5px;
          }

          :root {
            --gecko-primary: #86efac;
            --gecko-secondary: #a7f3d0;
            --gecko-accent: #4ade80;
            --gecko-dark: #064e3b;
            --gecko-darker: #022c22;
            --gecko-surface: rgba(20, 83, 45, 0.4);
            --gecko-surface-light: rgba(134, 239, 172, 0.1);
            --gecko-text: #d1fae5;
            --gecko-text-muted: #a7f3d0;
            --gecko-border: rgba(134, 239, 172, 0.2);
            --gecko-hover: rgba(134, 239, 172, 0.15);
            
            --sage-50: #ecfdf5;
            --sage-100: #d1fae5;
            --sage-200: #a7f3d0;
            --sage-300: #6ee7b7;
            --sage-400: #34d399;
            --sage-500: #10b981;
            --sage-600: #059669;
            --sage-700: #047857;
            --sage-800: #065f46;
            --sage-900: #064e3b;

            --earth-50: #fef7f0;
            --earth-100: #fdeee0;
            --earth-200: #f9d5b5;
            --earth-300: #f4b885;
            --earth-400: #ed9455;
            --earth-500: #e67e22;
            --earth-600: #d35400;
            --earth-700: #b7472a;
            --earth-800: #8e3a16;
            --earth-900: #6f2e0c;
          }

          .dark {
            --sage-50: #064e3b;
            --sage-100: #065f46;
            --sage-200: #047857;
            --sage-300: #059669;
            --sage-400: #10b981;
            --sage-500: #34d399;
            --sage-600: #6ee7b7;
            --sage-700: #a7f3d0;
            --sage-800: #d1fae5;
            --sage-900: #ecfdf5;

            --earth-50: #6f2e0c;
            --earth-100: #8e3a16;
            --earth-200: #b7472a;
            --earth-300: #d35400;
            --earth-400: #e67e22;
            --earth-500: #ed9455;
            --earth-600: #f4b885;
            --earth-700: #f9d5b5;
            --earth-800: #fdeee0;
            --earth-900: #fef7f0;
          }

          body {
            background: linear-gradient(135deg, #0a0f0a 0%, #1a2920 100%);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            color: var(--gecko-text);
            font-weight: 400;
          }

          .dark .bg-white,
          .dark .bg-white\\/80,
          .dark .bg-white\\/90 {
            background: rgba(20, 83, 45, 0.6) !important;
            backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid var(--gecko-border);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .dark .bg-slate-900,
          .dark .bg-gray-900 {
            background: rgba(4, 120, 87, 0.3) !important;
            backdrop-filter: blur(15px);
            border: 1px solid var(--gecko-border);
          }

          .dark .bg-slate-800,
          .dark .bg-gray-800 {
            background: rgba(6, 95, 70, 0.4) !important;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(134, 239, 172, 0.15);
          }

          .dark .bg-slate-950 {
            background: linear-gradient(135deg, 
              rgba(2, 44, 34, 0.95) 0%, 
              rgba(6, 78, 59, 0.9) 50%, 
              rgba(4, 120, 87, 0.8) 100%) !important;
            position: relative;
          }

          .dark .bg-slate-950::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(ellipse at top, rgba(134, 239, 172, 0.03) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(74, 222, 128, 0.02) 0%, transparent 50%);
            pointer-events: none;
          }

          .dark button,
          .dark .bg-gray-100,
          .dark .bg-gray-200,
          .dark .bg-slate-100,
          .dark .bg-slate-200 {
            background: rgba(6, 95, 70, 0.6) !important;
            color: var(--gecko-text) !important;
            border: 1px solid var(--gecko-border) !important;
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 500;
          }

          .dark button:hover,
          .dark .hover\\:bg-gray-50:hover,
          .dark .hover\\:bg-gray-100:hover,
          .dark .hover\\:bg-slate-50:hover,
          .dark .hover\\:bg-slate-100:hover {
            background: rgba(16, 185, 129, 0.2) !important;
            border-color: var(--gecko-accent) !important;
            box-shadow: 0 0 20px rgba(134, 239, 172, 0.2);
            transform: translateY(-1px);
          }

          .dark button[class*="bg-emerald"],
          .dark button[class*="bg-green"] {
            background: linear-gradient(135deg, var(--gecko-accent) 0%, var(--gecko-primary) 100%) !important;
            border: none !important;
            color: var(--gecko-dark) !important;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .dark button[class*="bg-emerald"]:hover,
          .dark button[class*="bg-green"]:hover {
            background: linear-gradient(135deg, #22c55e 0%, #86efac 100%) !important;
            box-shadow: 
              0 0 25px rgba(134, 239, 172, 0.4),
              0 8px 32px rgba(0, 0, 0, 0.3);
            transform: translateY(-2px);
          }

          .dark input,
          .dark textarea,
          .dark select,
          .dark [role="combobox"] {
            background: rgba(4, 120, 87, 0.4) !important;
            border: 1px solid var(--gecko-border) !important;
            color: var(--gecko-text) !important;
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .dark input:focus,
          .dark textarea:focus,
          .dark select:focus,
          .dark [role="combobox"]:focus {
            border-color: var(--gecko-accent) !important;
            box-shadow: 
              0 0 0 3px rgba(134, 239, 172, 0.1),
              0 0 20px rgba(134, 239, 172, 0.2) !important;
            background: rgba(6, 95, 70, 0.6) !important;
          }

          .dark .text-slate-100,
          .dark .text-slate-200,
          .dark .text-white {
            color: var(--gecko-text) !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          }

          .dark .text-slate-400,
          .dark .text-slate-500,
          .dark .text-gray-400,
          .dark .text-gray-500 {
            color: var(--gecko-text-muted) !important;
          }

          .dark .border-slate-700,
          .dark .border-gray-700 {
            border-color: var(--gecko-border) !important;
          }

          .dark [data-state="checked"] {
            background-color: var(--gecko-accent) !important;
            border-color: var(--gecko-accent) !important;
          }

          .dark .bg-emerald-600 {
            background: linear-gradient(135deg, var(--gecko-accent) 0%, var(--gecko-primary) 100%) !important;
          }

          .dark .hover\\:bg-emerald-700:hover {
            background: linear-gradient(135deg, #22c55e 0%, #86efac 100%) !important;
          }

          .notification-badge {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            border: 2px solid var(--gecko-dark);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
            animation: pulse-notification 2s infinite;
          }

          @keyframes pulse-notification {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          .gecko-card {
            background: rgba(6, 95, 70, 0.4);
            backdrop-filter: blur(15px) saturate(180%);
            border: 1px solid var(--gecko-border);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }

          .gecko-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--gecko-primary), transparent);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .gecko-card:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: var(--gecko-accent);
            box-shadow: 
              0 20px 40px rgba(0, 0, 0, 0.4),
              0 0 60px rgba(134, 239, 172, 0.2),
              inset 0 1px 0 rgba(134, 239, 172, 0.1);
          }

          .gecko-card:hover::before {
            opacity: 1;
          }

          .sidebar-nav-item {
            backdrop-filter: blur(10px);
            border-radius: 12px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .sidebar-nav-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: var(--gecko-accent);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .sidebar-nav-item.active {
            background: rgba(16, 185, 129, 0.15);
            border-left: 3px solid var(--gecko-accent);
            color: var(--gecko-primary);
          }

          .sidebar-nav-item.active::before {
            opacity: 1;
          }

          .sidebar-nav-item:hover {
            background: var(--gecko-hover);
            transform: translateX(4px);
          }

          .gecko-progress {
            background: rgba(4, 120, 87, 0.3);
            border-radius: 8px;
            overflow: hidden;
            position: relative;
          }

          .gecko-progress::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, 
              transparent 25%, 
              rgba(134, 239, 172, 0.1) 25%, 
              rgba(134, 239, 172, 0.1) 50%, 
              transparent 50%, 
              transparent 75%, 
              rgba(134, 239, 172, 0.1) 75%);
            background-size: 20px 20px;
            animation: progress-stripes 1s linear infinite;
            opacity: 0;
          }

          .gecko-progress.active::before {
            opacity: 1;
          }

          @keyframes progress-stripes {
            0% { background-position: 0 0; }
            100% { background-position: 20px 0; }
          }

          .gecko-badge {
            background: linear-gradient(135deg, var(--gecko-accent), var(--gecko-primary));
            color: var(--gecko-dark);
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(134, 239, 172, 0.3);
            border: 1px solid rgba(134, 239, 172, 0.5);
          }

          .gecko-header {
            background: linear-gradient(135deg, 
              rgba(6, 95, 70, 0.8) 0%, 
              rgba(4, 120, 87, 0.6) 100%);
            backdrop-filter: blur(20px) saturate(180%);
            border-bottom: 1px solid var(--gecko-border);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(4, 120, 87, 0.2);
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, var(--gecko-accent), var(--gecko-primary));
            border-radius: 4px;
            border: 1px solid rgba(134, 239, 172, 0.3);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #22c55e, #86efac);
            box-shadow: 0 0 10px rgba(134, 239, 172, 0.4);
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .text-glow {
            text-shadow: 0 0 20px rgba(134, 239, 172, 0.5);
          }

          .loading-spinner {
            border: 3px solid rgba(134, 239, 172, 0.2);
            border-top: 3px solid var(--gecko-accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={{ display: 'none' }}>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Geck Inspect" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </div>

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans app-container-outline">
        {/* Mobile Sidebar */}
        <Sidebar className="border-r border-sage-300 bg-sage-200/90 backdrop-blur-sm md:hidden">
          <SidebarHeader className="border-b border-sage-300 p-6">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
              {appLogo && (
                <img 
                  src={appLogo}
                  alt="Geck Inspect Logo" 
                  className="h-8 w-8 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://i.imgur.com/gfaW2Yg.png';
                  }}
                />
              )}
              <span className="text-lg font-bold text-sage-800">Geck Inspect</span>
            </Link>
          </SidebarHeader>

          <SidebarBody ref={sidebarRef} className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="px-4 mb-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to={createPageUrl('MyProfile')}>
                    <img 
                      src={user.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=84A98C&color=fff`} 
                      alt="User avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={createPageUrl('MyProfile')} className="font-medium text-sage-800 text-sm">{user.full_name}</Link>
                    <p className="text-xs text-sage-600">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-sage-600 to-earth-600 hover:from-sage-700 hover:to-earth-700 shadow-lg text-sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up / Login
                  </Button>
                  <div className="text-xs text-sage-500 text-center">
                    Create an account to save your work and manage your gecko collection
                  </div>
                </div>
              )}
            </div>
            
            {user && renderNavSection(userSpecificNavItems, "My Collection")}
            {renderNavSection(publicNavItems)}
            {user?.role === 'admin' && renderNavSection(adminOnlyNavItems, "Admin")}
          </SidebarBody>

          <SidebarFooter className="p-4 border-t border-sage-300">
            <div className="space-y-3">
              <Link to={createPageUrl("Donations")} className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-pink-600 hover:text-pink-800 border-pink-300 hover:bg-pink-50 dark:text-pink-400 dark:hover:text-pink-300 dark:border-pink-700 dark:hover:bg-pink-900/20 text-sm"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Support This Project
                </Button>
              </Link>

              <div className="px-3 py-2 space-y-2">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-sage-200 rounded mb-2"></div>
                    <div className="h-2 bg-sage-200 rounded mb-2"></div>
                    <div className="h-3 bg-sage-200 rounded"></div>
                  </div>
                ) : (
                  <>
                        {currentMilestone && (
                          <Alert className="mb-2 border-green-200 bg-green-50 dark:bg-sage-100 dark:border-sage-300 p-2">
                            <Award className="h-4 w-4" />
                            <AlertDescription className="text-green-700 dark:text-sage-600 text-xs">
                              🎉 {currentMilestone.title} achieved! {currentMilestone.description}
                            </AlertDescription>
                          </Alert>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-sage-600">Training Progress</span>
                          <span className="font-bold text-sage-700">{imageCount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-sage-200 rounded-full h-2 overflow-hidden gecko-progress">
                          <div className="h-full bg-gradient-to-r from-sage-500 to-earth-400 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <div className="text-xs text-sage-500">
                          {nextMilestone ?
                            `${imageCount.toLocaleString()} / ${goalCount.toLocaleString()} to ${nextMilestone.title}` :
                            "All milestones achieved! 🏆"
                          }
                        </div>
                  </>
                )}
              </div>

              {user ?
                <div className="space-y-2">
                  {sidebarBadge && (
                    <UserBadge
                      badge={sidebarBadge.badge}
                      title={sidebarBadge.title}
                      count={sidebarBadge.count}
                      label={sidebarBadge.label}
                    />
                  )}

                  <Link to={createPageUrl("Settings")} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-sage-600 hover:text-sage-700 border-sage-300 text-sm">

                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>

                  <div className="text-xs text-sage-500 px-3">
                    Logged in as {user.full_name}
                    {user.is_expert && <span className="ml-2 text-green-600">✓ Expert</span>}
                    {user.role === 'admin' && <span className="ml-2 text-purple-600">⚡ Admin</span>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-sage-600 hover:text-sage-700 border-sage-300 text-sm">

                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div> :
                null}
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex w-64 flex-col">
            <div className="flex flex-grow flex-col overflow-y-auto bg-white dark:bg-gray-800 pt-5 border-r border-gray-200 dark:border-gray-700" ref={sidebarRef}>
              <div className="flex items-center flex-shrink-0 px-6 mb-4">
                <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
                  {appLogo && (
                    <img
                      src={appLogo}
                      alt="Geck Inspect Logo"
                      className="h-8 w-8 object-contain rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://i.imgur.com/gfaW2Yg.png';
                      }}
                    />
                  )}
                  <span className="text-lg font-bold text-sage-800 dark:text-sage-700">Geck Inspect</span>
                </Link>
              </div>

              <div className="px-4 mb-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link to={createPageUrl('MyProfile')}>
                      <img
                        src={user.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=84A98C&color=fff`}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={createPageUrl('MyProfile')} className="font-medium text-sage-800 dark:text-sage-700 text-sm">{user.full_name}</Link>
                      <p className="text-xs text-sage-600 dark:text-sage-500">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={handleLogin}
                      className="w-full bg-gradient-to-r from-sage-600 to-earth-600 hover:from-sage-700 hover:to-earth-700 shadow-lg text-sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up / Login
                    </Button>
                    <div className="text-xs text-sage-500 dark:text-sage-400 text-center">
                      Create an account to save your work and manage your gecko collection
                    </div>
                  </div>
                )}
              </div>

              {user && renderNavSection(userSpecificNavItems, "My Collection")}
              {renderNavSection(publicNavItems)}
              {user?.role === 'admin' && renderNavSection(adminOnlyNavItems, "Admin")}
              
              <div className="p-4 border-t border-sage-300 dark:border-sage-300 mt-auto">
                <div className="space-y-3">
                  <Link to={createPageUrl("Donations")} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-pink-600 hover:text-pink-800 border-pink-300 hover:bg-pink-50 dark:text-pink-400 dark:hover:text-pink-300 dark:border-pink-700 dark:hover:bg-pink-900/20 text-sm"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Support This Project
                    </Button>
                  </Link>

                  <div className="px-3 py-2 space-y-2">
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-sage-200 rounded mb-2"></div>
                        <div className="h-2 bg-sage-200 rounded mb-2"></div>
                        <div className="h-3 bg-sage-200 rounded"></div>
                      </div>
                    ) : (
                      <>
                        {currentMilestone && (
                          <Alert className="mb-2 border-green-200 bg-green-50 dark:bg-sage-100 dark:border-sage-300 p-2">
                            <Award className="h-4 w-4" />
                            <AlertDescription className="text-green-700 dark:text-sage-600 text-xs">
                              🎉 {currentMilestone.title} achieved! {currentMilestone.description}
                            </AlertDescription>
                          </Alert>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-sage-600 dark:text-sage-500">Training Progress</span>
                          <span className="font-bold text-sage-700 dark:text-sage-600">{imageCount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-sage-200 rounded-full h-2 overflow-hidden gecko-progress">
                          <div className="h-full bg-gradient-to-r from-sage-500 to-earth-400 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <div className="text-xs text-sage-500 dark:text-sage-400">
                          {nextMilestone ?
                            `${imageCount.toLocaleString()} / ${goalCount.toLocaleString()} to ${nextMilestone.title}` :
                            "All milestones achieved! 🏆"
                          }
                        </div>
                      </>
                    )}
                  </div>

                  {user ?
                    <div className="space-y-2">
                      {sidebarBadge && (
                        <UserBadge
                          badge={sidebarBadge.badge}
                          title={sidebarBadge.title}
                          count={sidebarBadge.count}
                          label={sidebarBadge.label}
                        />
                      )}

                      <Link to={createPageUrl("Settings")} className="block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-sage-600 hover:text-sage-700 border-sage-300 text-sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </Link>

                      <div className="text-xs text-sage-500 dark:text-sage-400 px-3">
                        Logged in as {user.full_name}
                        {user.is_expert && <span className="ml-2 text-green-600">✓ Expert</span>}
                        {user.role === 'admin' && <span className="ml-2 text-purple-600">⚡ Admin</span>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-sage-600 hover:text-sage-700 border-sage-300 text-sm">

                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div> :
                    null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-sage-200/90 backdrop-blur-md border-b border-sage-300 px-4 py-3 md:hidden sticky top-0 z-10 gecko-header">
            <div className="flex items-center justify-between gap-4">
              <button onClick={toggleSidebar} className="hover:bg-sage-200 p-2 rounded-lg transition-colors duration-200" aria-label="Toggle Sidebar">
                <Menu className="w-5 h-5 text-sage-600" />
              </button>

              <div className="flex items-center gap-2">
                {user ?
                  <>
                    <Link to={createPageUrl("Messages")} className="relative hover:bg-sage-200 p-2 rounded-lg transition-colors duration-200">
                      <Mail className="w-5 h-5 text-sage-600" />
                      {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
                    </Link>
                    <div className="relative">
                      <Link to={createPageUrl("Notifications")} className="relative hover:bg-sage-200 p-2 rounded-lg transition-colors duration-200 block">
                        <Bell className="w-5 h-5 text-sage-600" />
                      </Link>
                      {unreadNotificationsCount > 0 && <span className="notification-badge pointer-events-none">{unreadNotificationsCount}</span>}
                    </div>
                    <Link to={createPageUrl("MyProfile")} className="hover:bg-sage-200 p-2 rounded-lg transition-colors duration-200">
                      <Users className="w-5 h-5 text-sage-600" />
                    </Link>
                  </> :
                  <Button onClick={handleLogin} size="sm" className="bg-gradient-to-r from-sage-600 to-earth-600 hover:from-sage-700 hover:to-earth-700">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                }
              </div>
            </div>
          </header>

          <header className="bg-sage-200/90 backdrop-blur-md border-b border-sage-300 px-4 py-3 hidden md:flex sticky top-0 z-10 gecko-header">
            <div className="flex items-center justify-between gap-4 w-full">
              <div></div>

              <div className="flex items-center gap-2">
                {user ?
                  <>
                    <Link to={createPageUrl("Messages")} className="relative hover:bg-sage-200 p-2 rounded-lg transition-colors duration-200">
                      <Mail className="w-5 h-5 text-sage-600" />
                      {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
                    </Link>
                     <div className="relative">
                       <Link to={createPageUrl("Notifications")} className="relative hover:bg-sage-200 p-2 rounded-lg transition-colors duration-200 block">
                         <Bell className="w-5 h-5 text-sage-600" />
                       </Link>
                       {unreadNotificationsCount > 0 && <span className="notification-badge pointer-events-none">{unreadNotificationsCount}</span>}
                    </div>
                    <Link to={createPageUrl("MyProfile")} className="hover:bg-sage-200 p-2 rounded-lg transition-colors duration-200">
                      <Users className="w-5 h-5 text-sage-600" />
                    </Link>
                  </> :
                  <Button onClick={handleLogin} size="sm" className="bg-gradient-to-r from-sage-600 to-earth-600 hover:from-sage-700 to-earth-700">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                }
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <SidebarProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </SidebarProvider>
  );
}

