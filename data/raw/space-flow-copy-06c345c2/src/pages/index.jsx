import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Bookings from "./Bookings";

import Locations from "./Locations";

import FloorPlans from "./FloorPlans";

import Zones from "./Zones";

import Floors from "./Floors";

import Workspaces from "./Workspaces";

import Employees from "./Employees";

import DailyRoster from "./DailyRoster";

import Profile from "./Profile";

import Conflicts from "./Conflicts";

import OutOfOffice from "./OutOfOffice";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Bookings: Bookings,
    
    Locations: Locations,
    
    FloorPlans: FloorPlans,
    
    Zones: Zones,
    
    Floors: Floors,
    
    Workspaces: Workspaces,
    
    Employees: Employees,
    
    DailyRoster: DailyRoster,
    
    Profile: Profile,
    
    Conflicts: Conflicts,
    
    OutOfOffice: OutOfOffice,
    
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
                
                <Route path="/Bookings" element={<Bookings />} />
                
                <Route path="/Locations" element={<Locations />} />
                
                <Route path="/FloorPlans" element={<FloorPlans />} />
                
                <Route path="/Zones" element={<Zones />} />
                
                <Route path="/Floors" element={<Floors />} />
                
                <Route path="/Workspaces" element={<Workspaces />} />
                
                <Route path="/Employees" element={<Employees />} />
                
                <Route path="/DailyRoster" element={<DailyRoster />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Conflicts" element={<Conflicts />} />
                
                <Route path="/OutOfOffice" element={<OutOfOffice />} />
                
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