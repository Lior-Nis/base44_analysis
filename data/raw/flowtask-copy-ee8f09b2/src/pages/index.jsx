import Layout from "./Layout.jsx";

import Home from "./Home";

import Todo from "./Todo";

import About from "./About";

import Legal from "./Legal";

import Roadmap from "./Roadmap";

import dev from "./dev";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Todo: Todo,
    
    About: About,
    
    Legal: Legal,
    
    Roadmap: Roadmap,
    
    dev: dev,
    
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
                
                <Route path="/Todo" element={<Todo />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Legal" element={<Legal />} />
                
                <Route path="/Roadmap" element={<Roadmap />} />
                
                <Route path="/dev" element={<dev />} />
                
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