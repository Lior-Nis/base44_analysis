

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Home, Utensils, Heart, User as UserIcon, Menu, X, Shield, Package, Users } from "lucide-react"; // Added Users icon
import { Button } from "@/components/ui/button";
import { User as UserEntity } from "@/api/entities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdBanner from "@/components/ads/AdBanner"; // Fixed import path

// Custom SVG icons for brands
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.49H18.06C17.73 16.14 16.85 17.56 15.39 18.51V21.09H19.14C21.32 19.13 22.56 15.99 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C14.97 23 17.45 22.04 19.14 20.45L15.39 17.87C14.39 18.57 13.25 18.99 12 18.99C9.37 18.99 7.14 17.34 6.29 15.07H2.4V17.75C4.12 20.94 7.74 23 12 23Z" fill="#34A853"/>
    <path d="M6.29 15.07C6.08 14.48 5.96 13.86 5.96 13.24C5.96 12.62 6.08 12 6.29 11.41V8.73H2.4C1.66 10.14 1.25 11.65 1.25 13.24C1.25 14.83 1.66 16.34 2.4 17.75L6.29 15.07Z" fill="#FBBC05"/>
    <path d="M12 7.48C13.49 7.48 14.71 7.99 15.63 8.87L19.21 5.29C17.45 3.73 14.97 2.75 12 2.75C7.74 2.75 4.12 4.98 2.4 8.17L6.29 10.85C7.14 8.58 9.37 7.48 12 7.48Z" fill="#EA4335"/>
  </svg>
);
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12Z" />
  </svg>
);
const MicrosoftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 11.4H2.25V2.25H11.4V11.4Z" fill="#F25022"/>
    <path d="M21.75 11.4H12.6V2.25H21.75V11.4Z" fill="#7FBA00"/>
    <path d="M11.4 21.75H2.25V12.6H11.4V21.75Z" fill="#00A4EF"/>
    <path d="M21.75 21.75H12.6V12.6H21.75V21.75Z" fill="#FFB900"/>
  </svg>
);


export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogin = async (provider) => {
    await UserEntity.loginWithRedirect(`${window.location.origin}${window.location.pathname}`);
  };

  const handleLogout = async () => {
    await UserEntity.logout();
    setUser(null);
    window.location.href = createPageUrl("Home");
  };

  const mainNav = [
  { name: "Home", href: createPageUrl("Home"), icon: Home },
  { name: "Restaurants", href: createPageUrl("AllRestaurants"), icon: Utensils },
  { name: "Marketplace", href: createPageUrl("Marketplace"), icon: Package },
  { name: "Stories", href: createPageUrl("Blog"), icon: Search },
  { name: "About", href: createPageUrl("About"), icon: Users }, // Added About Us
  { 
    name: "Favorites", 
    href: createPageUrl("Favorites"), 
    icon: Heart, 
    requireAuth: true,
    hideForRoles: ['restaurant_owner', 'seller']
  }];


  const userNav = [
  { name: "Profile", href: createPageUrl("UserProfile"), icon: UserIcon, requireAuth: true },
  { name: "My Restaurant", href: createPageUrl("RestaurantPortal"), icon: Utensils, requireAuth: true, ownerOnly: true },
  { name: "Sell Products", href: createPageUrl("SellerPortal"), icon: Package, requireAuth: true },
  { name: "Admin Portal", href: createPageUrl("AdminPortal"), icon: Shield, requireAuth: true, adminOnly: true }];

  const authProviders = [
    { name: "Google", provider: "google", icon: <GoogleIcon />, style: "text-[#4285F4]" },
    { name: "Facebook", provider: "facebook", icon: <FacebookIcon />, style: "text-[#1877F2]" },
    { name: "Microsoft", provider: "microsoft", icon: <MicrosoftIcon />, style: "" },
  ];

  const renderNavLink = (item, isMobile = false) => {
    if (item.requireAuth && !user) return null;
    if (item.ownerOnly && !user?.is_restaurant_owner) return null;
    if (item.adminOnly && !user?.is_admin) return null;
    
    // Hide navigation items for specific roles
    if (item.hideForRoles && user) {
      const userRoles = [];
      if (user.is_restaurant_owner) userRoles.push('restaurant_owner');
      if (user.is_seller) userRoles.push('seller');
      if (item.hideForRoles.some(role => userRoles.includes(role))) return null;
    }

    const isActive = location.pathname === item.href;
    return (
      <Link
        key={item.name}
        to={item.href}
        className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors duration-300 text-sm ${
        isActive ?
        "bg-[var(--primary-cta)] text-white" :
        "text-[var(--text-body)] hover:bg-black/5"}`
        }>

        <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[var(--primary-cta)]"}`} />
        <span className={isMobile ? '' : 'hidden sm:inline'}>{item.name}</span>
      </Link>);

  };

  const AuthButtons = ({ isMobile = false }) => (
    <div className={isMobile ? "space-y-2 pt-2" : "flex items-center"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={`cta-button text-sm ${isMobile ? 'w-full' : ''}`}>Sign In / Register</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {authProviders.map((provider) => (
            <DropdownMenuItem key={provider.provider} onClick={() => handleLogin(provider.provider)} className="cursor-pointer">
              <div className={`mr-2 ${provider.style}`}>{provider.icon}</div>
              <span>Sign in with {provider.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] text-[var(--text-body)] font-inter">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
        
        :root {
          --primary-cta: #884C24; /* Copper */
          --headings-labels: #111111; /* Charcoal */
          --highlights-accents: #D6AA79; /* Muted Gold */
          --bg-cream: #FFFFFF; /* White */
          --text-body: #333333; /* Dark Gray for body */
          --text-muted: #666666;
          --card-bg: #FFFFFF;
          --border-color: #EAEAEA;
        }

        .font-inter { font-family: 'Inter', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }

        .soft-shadow { box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04); }
        .soft-shadow-hover:hover { box-shadow: 0 4px 25px rgba(0, 0, 0, 0.07); }
        
        .cta-button {
            background-color: var(--primary-cta);
            color: white;
            border-radius: 4px;
            padding: 12px 28px;
            font-weight: 500;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            font-size: 14px;
        }
        .cta-button:hover {
            background-color: #6a3a1c; /* Darker copper */
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .prose h1, .prose h2, .prose h3 {
          font-family: 'Playfair Display', serif;
          color: var(--headings-labels);
        }
        .prose p, .prose li, .prose a {
          font-family: 'Inter', sans-serif;
          color: var(--text-body);
        }
        .prose strong {
          color: var(--headings-labels);
        }
        .prose a {
          color: var(--primary-cta);
          text-decoration: none;
          transition: color 0.2s;
        }
        .prose a:hover {
          color: #6a3a1c;
        }

        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
      
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary-cta)] rounded-md flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="font-playfair text-xl font-bold text-[var(--headings-labels)]">Dining Guide</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {mainNav.map((item) => renderNavLink(item, false))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2">
                {user ?
                <>
                     {userNav.map((item) => renderNavLink(item, false))}
                     <Button variant="ghost" onClick={handleLogout} className="text-sm">Logout</Button>
                    </> :
                <AuthButtons />
                }
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>

                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen &&
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 border-t border-[var(--border-color)]">
            <div className="px-4 py-4 space-y-2">
              {mainNav.map(item => renderNavLink(item, true))}
              {user && userNav.map(item => renderNavLink(item, true))}
              <div className="border-t border-[var(--border-color)] mt-2 pt-2">
              {user ?
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-sm">Logout</Button> :
              <AuthButtons isMobile={true} />
              }
              </div>
            </div>
          </div>
        }
      </header>
      
      <main>{children}</main>

      <footer className="bg-white mt-24 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <AdBanner placement="footer" className="h-48" format="banner" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[var(--primary-cta)] rounded-md flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-playfair text-lg font-bold text-[var(--headings-labels)]">Dining Guide</h3>
              </div>
              <p className="text-[var(--text-muted)] text-sm max-w-sm mb-6">
                Your guide to the best culinary experiences in the Maldives. Discover, review, and share your favorite flavors.
              </p>
            </div>
            
            <div>
              <h4 className="font-playfair text-base font-bold text-[var(--headings-labels)] mb-4">Explore</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to={createPageUrl("Home")} className="text-[var(--text-body)] hover:text-[var(--primary-cta)] transition-colors">Home</Link></li>
                <li><Link to={createPageUrl("AllRestaurants")} className="text-[var(--text-body)] hover:text-[var(--primary-cta)] transition-colors">Restaurants</Link></li>
                <li><Link to={createPageUrl("Marketplace")} className="text-[var(--text-body)] hover:text-[var(--primary-cta)] transition-colors">Marketplace</Link></li>
                <li><Link to={createPageUrl("About")} className="text-[var(--text-body)] hover:text-[var(--primary-cta)] transition-colors">About Us</Link></li> {/* Added About Us */}
              </ul>
            </div>
            
            <div>
              <h4 className="font-playfair text-base font-bold text-[var(--headings-labels)] mb-4">For Business</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to={createPageUrl("RestaurantPortal")} className="text-[var(--text-body)] hover:text-[var(--primary-cta)] transition-colors">
                    {user && user.is_restaurant_owner ? 'Manage Restaurant' : 'Add Your Restaurant'}
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("SellerPortal")} className="text-[var(--text-body)] hover:text-[var(--primary-cta)] transition-colors">
                    {user && user.is_seller ? 'Manage Store' : 'Become a Seller'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--border-color)] mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
                <Link to={createPageUrl("PrivacyPolicy")} className="text-[var(--text-muted)] hover:text-[var(--primary-cta)] transition-colors">Privacy Policy</Link>
                <Link to={createPageUrl("TermsConditions")} className="text-[var(--text-muted)] hover:text-[var(--primary-cta)] transition-colors">Terms & Conditions</Link>
                <Link to={createPageUrl("Disclaimer")} className="text-[var(--text-muted)] hover:text-[var(--primary-cta)] transition-colors">Disclaimer</Link>
              </div>
              <p className="text-xs text-[var(--text-muted)] text-center md:text-right">
                &copy; {new Date().getFullYear()} Dining Guide. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}

