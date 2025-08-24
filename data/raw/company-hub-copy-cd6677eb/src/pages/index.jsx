import Layout from "./Layout.jsx";

import Home from "./Home";

import Calendar from "./Calendar";

import TimeOff from "./TimeOff";

import Policies from "./Policies";

import Executives from "./Executives";

import Announcements from "./Announcements";

import Tickets from "./Tickets";

import AdminDashboard from "./AdminDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Calendar: Calendar,
    
    TimeOff: TimeOff,
    
    Policies: Policies,
    
    Executives: Executives,
    
    Announcements: Announcements,
    
    Tickets: Tickets,
    
    AdminDashboard: AdminDashboard,
    
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
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/TimeOff" element={<TimeOff />} />
                
                <Route path="/Policies" element={<Policies />} />
                
                <Route path="/Executives" element={<Executives />} />
                
                <Route path="/Announcements" element={<Announcements />} />
                
                <Route path="/Tickets" element={<Tickets />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
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