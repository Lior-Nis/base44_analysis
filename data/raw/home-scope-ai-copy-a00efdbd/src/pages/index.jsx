import Layout from "./Layout.jsx";

import Home from "./Home";

import Dashboard from "./Dashboard";

import Redirector from "./Redirector";

import ExpertDashboard from "./ExpertDashboard";

import ReportViewer from "./ReportViewer";

import AdminPanel from "./AdminPanel";

import Contact from "./Contact";

import ApplyAsExpert from "./ApplyAsExpert";

import Terms from "./Terms";

import PrivacyPolicy from "./PrivacyPolicy";

import Business from "./Business";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Dashboard: Dashboard,
    
    Redirector: Redirector,
    
    ExpertDashboard: ExpertDashboard,
    
    ReportViewer: ReportViewer,
    
    AdminPanel: AdminPanel,
    
    Contact: Contact,
    
    ApplyAsExpert: ApplyAsExpert,
    
    Terms: Terms,
    
    PrivacyPolicy: PrivacyPolicy,
    
    Business: Business,
    
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
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Redirector" element={<Redirector />} />
                
                <Route path="/ExpertDashboard" element={<ExpertDashboard />} />
                
                <Route path="/ReportViewer" element={<ReportViewer />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/ApplyAsExpert" element={<ApplyAsExpert />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/Business" element={<Business />} />
                
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