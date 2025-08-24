import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Actions from "./Actions";

import Map from "./Map";

import Profile from "./Profile";

import Challenges from "./Challenges";

import Admin from "./Admin";

import Rewards from "./Rewards";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Actions: Actions,
    
    Map: Map,
    
    Profile: Profile,
    
    Challenges: Challenges,
    
    Admin: Admin,
    
    Rewards: Rewards,
    
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
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Actions" element={<Actions />} />
                
                <Route path="/Map" element={<Map />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Challenges" element={<Challenges />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Rewards" element={<Rewards />} />
                
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