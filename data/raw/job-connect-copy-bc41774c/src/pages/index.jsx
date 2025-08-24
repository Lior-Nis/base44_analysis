import Layout from "./Layout.jsx";

import Home from "./Home";

import Search from "./Search";

import CreatePost from "./CreatePost";

import Messages from "./Messages";

import Jobs from "./Jobs";

import Profile from "./Profile";

import Notifications from "./Notifications";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Search: Search,
    
    CreatePost: CreatePost,
    
    Messages: Messages,
    
    Jobs: Jobs,
    
    Profile: Profile,
    
    Notifications: Notifications,
    
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
                
                <Route path="/Search" element={<Search />} />
                
                <Route path="/CreatePost" element={<CreatePost />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Jobs" element={<Jobs />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
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