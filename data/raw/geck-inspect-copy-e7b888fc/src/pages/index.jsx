import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Recognition from "./Recognition";

import Gallery from "./Gallery";

import GeckoDetail from "./GeckoDetail";

import BreedingPairs from "./BreedingPairs";

import MorphVisualizer from "./MorphVisualizer";

import MorphGuide from "./MorphGuide";

import MyProfile from "./MyProfile";

import Settings from "./Settings";

import PublicProfile from "./PublicProfile";

import AdminPanel from "./AdminPanel";

import Forum from "./Forum";

import ForumPost from "./ForumPost";

import Notifications from "./Notifications";

import Messages from "./Messages";

import Donations from "./Donations";

import CareGuide from "./CareGuide";

import MorphGuideSubmission from "./MorphGuideSubmission";

import MarketplaceBuy from "./MarketplaceBuy";

import MarketplaceSell from "./MarketplaceSell";

import MyListings from "./MyListings";

import MyGeckos from "./MyGeckos";

import Breeding from "./Breeding";

import Lineage from "./Lineage";

import TrainModel from "./TrainModel";

import Training from "./Training";

import BreederConsultant from "./BreederConsultant";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Recognition: Recognition,
    
    Gallery: Gallery,
    
    GeckoDetail: GeckoDetail,
    
    BreedingPairs: BreedingPairs,
    
    MorphVisualizer: MorphVisualizer,
    
    MorphGuide: MorphGuide,
    
    MyProfile: MyProfile,
    
    Settings: Settings,
    
    PublicProfile: PublicProfile,
    
    AdminPanel: AdminPanel,
    
    Forum: Forum,
    
    ForumPost: ForumPost,
    
    Notifications: Notifications,
    
    Messages: Messages,
    
    Donations: Donations,
    
    CareGuide: CareGuide,
    
    MorphGuideSubmission: MorphGuideSubmission,
    
    MarketplaceBuy: MarketplaceBuy,
    
    MarketplaceSell: MarketplaceSell,
    
    MyListings: MyListings,
    
    MyGeckos: MyGeckos,
    
    Breeding: Breeding,
    
    Lineage: Lineage,
    
    TrainModel: TrainModel,
    
    Training: Training,
    
    BreederConsultant: BreederConsultant,
    
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
                
                <Route path="/Recognition" element={<Recognition />} />
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/GeckoDetail" element={<GeckoDetail />} />
                
                <Route path="/BreedingPairs" element={<BreedingPairs />} />
                
                <Route path="/MorphVisualizer" element={<MorphVisualizer />} />
                
                <Route path="/MorphGuide" element={<MorphGuide />} />
                
                <Route path="/MyProfile" element={<MyProfile />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/PublicProfile" element={<PublicProfile />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/Forum" element={<Forum />} />
                
                <Route path="/ForumPost" element={<ForumPost />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Donations" element={<Donations />} />
                
                <Route path="/CareGuide" element={<CareGuide />} />
                
                <Route path="/MorphGuideSubmission" element={<MorphGuideSubmission />} />
                
                <Route path="/MarketplaceBuy" element={<MarketplaceBuy />} />
                
                <Route path="/MarketplaceSell" element={<MarketplaceSell />} />
                
                <Route path="/MyListings" element={<MyListings />} />
                
                <Route path="/MyGeckos" element={<MyGeckos />} />
                
                <Route path="/Breeding" element={<Breeding />} />
                
                <Route path="/Lineage" element={<Lineage />} />
                
                <Route path="/TrainModel" element={<TrainModel />} />
                
                <Route path="/Training" element={<Training />} />
                
                <Route path="/BreederConsultant" element={<BreederConsultant />} />
                
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