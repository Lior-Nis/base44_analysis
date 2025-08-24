import Layout from "./Layout.jsx";

import Home from "./Home";

import Restaurant from "./Restaurant";

import RestaurantPortal from "./RestaurantPortal";

import AdminPortal from "./AdminPortal";

import Favorites from "./Favorites";

import AllRestaurants from "./AllRestaurants";

import UserProfile from "./UserProfile";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsConditions from "./TermsConditions";

import Disclaimer from "./Disclaimer";

import Blog from "./Blog";

import BlogPost from "./BlogPost";

import Marketplace from "./Marketplace";

import ProductDetail from "./ProductDetail";

import SellerPortal from "./SellerPortal";

import Cart from "./Cart";

import Checkout from "./Checkout";

import OrderConfirmation from "./OrderConfirmation";

import SellerProfile from "./SellerProfile";

import About from "./About";

import EmailTester from "./EmailTester";

import AllSellers from "./AllSellers";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Restaurant: Restaurant,
    
    RestaurantPortal: RestaurantPortal,
    
    AdminPortal: AdminPortal,
    
    Favorites: Favorites,
    
    AllRestaurants: AllRestaurants,
    
    UserProfile: UserProfile,
    
    PrivacyPolicy: PrivacyPolicy,
    
    TermsConditions: TermsConditions,
    
    Disclaimer: Disclaimer,
    
    Blog: Blog,
    
    BlogPost: BlogPost,
    
    Marketplace: Marketplace,
    
    ProductDetail: ProductDetail,
    
    SellerPortal: SellerPortal,
    
    Cart: Cart,
    
    Checkout: Checkout,
    
    OrderConfirmation: OrderConfirmation,
    
    SellerProfile: SellerProfile,
    
    About: About,
    
    EmailTester: EmailTester,
    
    AllSellers: AllSellers,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Restaurant" element={<Restaurant />} />
                
                <Route path="/RestaurantPortal" element={<RestaurantPortal />} />
                
                <Route path="/AdminPortal" element={<AdminPortal />} />
                
                <Route path="/Favorites" element={<Favorites />} />
                
                <Route path="/AllRestaurants" element={<AllRestaurants />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/TermsConditions" element={<TermsConditions />} />
                
                <Route path="/Disclaimer" element={<Disclaimer />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/BlogPost" element={<BlogPost />} />
                
                <Route path="/Marketplace" element={<Marketplace />} />
                
                <Route path="/ProductDetail" element={<ProductDetail />} />
                
                <Route path="/SellerPortal" element={<SellerPortal />} />
                
                <Route path="/Cart" element={<Cart />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/OrderConfirmation" element={<OrderConfirmation />} />
                
                <Route path="/SellerProfile" element={<SellerProfile />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/EmailTester" element={<EmailTester />} />
                
                <Route path="/AllSellers" element={<AllSellers />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}