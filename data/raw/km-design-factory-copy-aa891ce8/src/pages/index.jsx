import Layout from "./Layout.jsx";

import CustomizeJewelry from "./CustomizeJewelry";

import MyDesigns from "./MyDesigns";

import AllDesigns from "./AllDesigns";

import AdminDataTable from "./AdminDataTable";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    CustomizeJewelry: CustomizeJewelry,
    
    MyDesigns: MyDesigns,
    
    AllDesigns: AllDesigns,
    
    AdminDataTable: AdminDataTable,
    
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
                
                    <Route path="/" element={<CustomizeJewelry />} />
                
                
                <Route path="/CustomizeJewelry" element={<CustomizeJewelry />} />
                
                <Route path="/MyDesigns" element={<MyDesigns />} />
                
                <Route path="/AllDesigns" element={<AllDesigns />} />
                
                <Route path="/AdminDataTable" element={<AdminDataTable />} />
                
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