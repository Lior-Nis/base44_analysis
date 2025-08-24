import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Game from "./Game";

import Rewards from "./Rewards";

import Shop from "./Shop";

import Friends from "./Friends";

import Challenges from "./Challenges";

import MultiplayerGame from "./MultiplayerGame";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Game: Game,
    
    Rewards: Rewards,
    
    Shop: Shop,
    
    Friends: Friends,
    
    Challenges: Challenges,
    
    MultiplayerGame: MultiplayerGame,
    
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
                
                <Route path="/Game" element={<Game />} />
                
                <Route path="/Rewards" element={<Rewards />} />
                
                <Route path="/Shop" element={<Shop />} />
                
                <Route path="/Friends" element={<Friends />} />
                
                <Route path="/Challenges" element={<Challenges />} />
                
                <Route path="/MultiplayerGame" element={<MultiplayerGame />} />
                
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