import Layout from "./Layout.jsx";

import Catalog from "./Catalog";

import MyCourses from "./MyCourses";

import ManageCourses from "./ManageCourses";

import Settings from "./Settings";

import About from "./About";

import Dashboard from "./Dashboard";

import Bookmarks from "./Bookmarks";

import Reviews from "./Reviews";

import AIAssistant from "./AIAssistant";

import Affiliates from "./Affiliates";

import TestGenerator from "./TestGenerator";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsOfService from "./TermsOfService";

import DoodleNotes from "./DoodleNotes";

import PurchaseVerification from "./PurchaseVerification";

import Messages from "./Messages";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Catalog: Catalog,
    
    MyCourses: MyCourses,
    
    ManageCourses: ManageCourses,
    
    Settings: Settings,
    
    About: About,
    
    Dashboard: Dashboard,
    
    Bookmarks: Bookmarks,
    
    Reviews: Reviews,
    
    AIAssistant: AIAssistant,
    
    Affiliates: Affiliates,
    
    TestGenerator: TestGenerator,
    
    PrivacyPolicy: PrivacyPolicy,
    
    TermsOfService: TermsOfService,
    
    DoodleNotes: DoodleNotes,
    
    PurchaseVerification: PurchaseVerification,
    
    Messages: Messages,
    
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
                
                    <Route path="/" element={<Catalog />} />
                
                
                <Route path="/Catalog" element={<Catalog />} />
                
                <Route path="/MyCourses" element={<MyCourses />} />
                
                <Route path="/ManageCourses" element={<ManageCourses />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Bookmarks" element={<Bookmarks />} />
                
                <Route path="/Reviews" element={<Reviews />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/Affiliates" element={<Affiliates />} />
                
                <Route path="/TestGenerator" element={<TestGenerator />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/DoodleNotes" element={<DoodleNotes />} />
                
                <Route path="/PurchaseVerification" element={<PurchaseVerification />} />
                
                <Route path="/Messages" element={<Messages />} />
                
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