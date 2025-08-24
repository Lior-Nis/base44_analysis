import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Subjects from "./Subjects";

import AITutor from "./AITutor";

import StudyPlanner from "./StudyPlanner";

import QuizCenter from "./QuizCenter";

import LearningHub from "./LearningHub";

import ParentDashboard from "./ParentDashboard";

import Campus from "./Campus";

import Profile from "./Profile";

import PrivateLessons from "./PrivateLessons";

import TutorProfilePage from "./TutorProfilePage";

import TutorProfileSetup from "./TutorProfileSetup";

import StudyCircles from "./StudyCircles";

import TermsOfService from "./TermsOfService";

import PrivacyPolicy from "./PrivacyPolicy";

import Welcome from "./Welcome";

import ContentManagement from "./ContentManagement";

import TutorDashboard from "./TutorDashboard";

import AccessibilityStatement from "./AccessibilityStatement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Subjects: Subjects,
    
    AITutor: AITutor,
    
    StudyPlanner: StudyPlanner,
    
    QuizCenter: QuizCenter,
    
    LearningHub: LearningHub,
    
    ParentDashboard: ParentDashboard,
    
    Campus: Campus,
    
    Profile: Profile,
    
    PrivateLessons: PrivateLessons,
    
    TutorProfilePage: TutorProfilePage,
    
    TutorProfileSetup: TutorProfileSetup,
    
    StudyCircles: StudyCircles,
    
    TermsOfService: TermsOfService,
    
    PrivacyPolicy: PrivacyPolicy,
    
    Welcome: Welcome,
    
    ContentManagement: ContentManagement,
    
    TutorDashboard: TutorDashboard,
    
    AccessibilityStatement: AccessibilityStatement,
    
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
                
                <Route path="/Subjects" element={<Subjects />} />
                
                <Route path="/AITutor" element={<AITutor />} />
                
                <Route path="/StudyPlanner" element={<StudyPlanner />} />
                
                <Route path="/QuizCenter" element={<QuizCenter />} />
                
                <Route path="/LearningHub" element={<LearningHub />} />
                
                <Route path="/ParentDashboard" element={<ParentDashboard />} />
                
                <Route path="/Campus" element={<Campus />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/PrivateLessons" element={<PrivateLessons />} />
                
                <Route path="/TutorProfilePage" element={<TutorProfilePage />} />
                
                <Route path="/TutorProfileSetup" element={<TutorProfileSetup />} />
                
                <Route path="/StudyCircles" element={<StudyCircles />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/ContentManagement" element={<ContentManagement />} />
                
                <Route path="/TutorDashboard" element={<TutorDashboard />} />
                
                <Route path="/AccessibilityStatement" element={<AccessibilityStatement />} />
                
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