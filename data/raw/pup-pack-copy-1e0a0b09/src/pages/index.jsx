import Layout from "./Layout.jsx";

import Home from "./Home";

import Gallery from "./Gallery";

import Checkout from "./Checkout";

import Dashboard from "./Dashboard";

import Upload from "./Upload";

import Admin from "./Admin";

import PaymentSuccess from "./PaymentSuccess";

import PaymentCancel from "./PaymentCancel";

import CreateOrder from "./CreateOrder";

import ContactSupport from "./ContactSupport";

import AdminOrderDetail from "./AdminOrderDetail";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Gallery: Gallery,
    
    Checkout: Checkout,
    
    Dashboard: Dashboard,
    
    Upload: Upload,
    
    Admin: Admin,
    
    PaymentSuccess: PaymentSuccess,
    
    PaymentCancel: PaymentCancel,
    
    CreateOrder: CreateOrder,
    
    ContactSupport: ContactSupport,
    
    AdminOrderDetail: AdminOrderDetail,
    
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
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/PaymentCancel" element={<PaymentCancel />} />
                
                <Route path="/CreateOrder" element={<CreateOrder />} />
                
                <Route path="/ContactSupport" element={<ContactSupport />} />
                
                <Route path="/AdminOrderDetail" element={<AdminOrderDetail />} />
                
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