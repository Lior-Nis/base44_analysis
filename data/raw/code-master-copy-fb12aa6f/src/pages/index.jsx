import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import PythonCourse from "./PythonCourse";

import JavaCourse from "./JavaCourse";

import CCourse from "./CCourse";

import Practice from "./Practice";

import Games from "./Games";

import Achievements from "./Achievements";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    PythonCourse: PythonCourse,
    
    JavaCourse: JavaCourse,
    
    CCourse: CCourse,
    
    Practice: Practice,
    
    Games: Games,
    
    Achievements: Achievements,
    
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
                
                <Route path="/PythonCourse" element={<PythonCourse />} />
                
                <Route path="/JavaCourse" element={<JavaCourse />} />
                
                <Route path="/CCourse" element={<CCourse />} />
                
                <Route path="/Practice" element={<Practice />} />
                
                <Route path="/Games" element={<Games />} />
                
                <Route path="/Achievements" element={<Achievements />} />
                
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