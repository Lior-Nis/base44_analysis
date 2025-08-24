

import React, { useState, useEffect, useRef } from "react";
import { 
    User,
    Briefcase,
    BarChart3,
    CalendarCheck,
    Mail,
    Zap,
    Download,
    Shield,
    Search,
    AlertTriangle,
    Edit3,
    Monitor,
    Info
} from "lucide-react";

const navigationItems = {
    Career: [
        { title: "Mission", id: "hero", icon: User },
        { title: "Studios", id: "studios", icon: Briefcase },
        { title: "Skills", id: "skills", icon: BarChart3 },
        { title: "Action Plan", id: "plan", icon: CalendarCheck },
        { title: "Contact", id: "contact", icon: Mail },
    ],
    SWOT: [
        { title: "Overview", id: "swot-hero", icon: Shield },
        { title: "Matrix", id: "swot-matrix", icon: BarChart3 },
        { title: "Action Plan", id: "swot-action", icon: CalendarCheck },
    ],
    Nemesis: [
        { title: "Intro", id: "nemesis-hero", icon: Zap },
        { title: "Research", id: "nemesis-research", icon: Search },
        { title: "Problems", id: "nemesis-problems-solutions", icon: AlertTriangle },
        { title: "Sketches", id: "nemesis-sketches", icon: Edit3 },
        { title: "Digital", id: "nemesis-digital", icon: Monitor },
        { title: "Credits", id: "nemesis-credits", icon: Info },
    ]
};

export default function Layout({ children, currentPageName }) {
    const [activeSection, setActiveSection] = useState(currentPageName === 'SWOT' ? 'swot-hero' : (currentPageName === 'Nemesis' ? 'nemesis-hero' : 'hero'));
    const observer = useRef(null);

    const currentNavItems = navigationItems[currentPageName] || navigationItems.Career;

    useEffect(() => {
        observer.current = new IntersectionObserver((entries) => {
            const visibleSection = entries.find((entry) => entry.isIntersecting)?.target;
            if (visibleSection) {
                setActiveSection(visibleSection.id);
            }
        }, { 
            threshold: 0.3,
            rootMargin: "-30% 0px -30% 0px"
        });

        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => {
            if (observer.current) {
                observer.current.observe(section);
            }
        });

        return () => {
            sections.forEach((section) => {
                if (observer.current) {
                    observer.current.unobserve(section);
                }
            });
        };
    }, [children, currentPageName]);

    useEffect(() => {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');
        
        if (!cursorDot || !cursorOutline) return;

        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        let animationId;

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        };

        const animateOutline = () => {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
            animationId = requestAnimationFrame(animateOutline);
        };

        const handleMouseEnter = () => cursorOutline.classList.add('hover');
        const handleMouseLeave = () => cursorOutline.classList.remove('hover');

        const addListeners = () => {
            document.querySelectorAll('a, button').forEach(el => {
                el.addEventListener('mouseenter', handleMouseEnter);
                el.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        const removeListeners = () => {
            document.querySelectorAll('a, button').forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        animationId = requestAnimationFrame(animateOutline);
        addListeners();

        const mutationObserver = new MutationObserver((mutations) => {
            removeListeners();
            addListeners();
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            removeListeners();
            mutationObserver.disconnect();
        };
    }, [children]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="relative min-h-screen bg-black text-white font-sans custom-cursor-area print:bg-white print:text-black">
             <div className="cursor-dot"></div>
             <div className="cursor-outline"></div>

            {/* Background - Hidden in Print */}
            <div className="fixed inset-0 z-0 print:hidden">
                <iframe 
                    src="https://my.spline.design/thresholddarkambientui-v0gkZCfi6zXm69kE0wccy70f/" 
                    frameBorder="0" 
                    width="100%" 
                    height="100%" 
                    className="w-full h-full"
                    loading="lazy"
                    title="3D Background"
                ></iframe>
            </div>

            {/* Sidebar - Hidden in Print */}
            <aside className="fixed inset-y-0 left-0 flex flex-col gap-3 sm:gap-4 py-6 px-3 items-center bg-transparent z-50 print:hidden">
                <a 
                    href={currentPageName === 'SWOT' ? '#swot-hero' : (currentPageName === 'Nemesis' ? '#nemesis-hero' : '#hero')}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform,background-color duration-150 bg-white text-black hover:scale-105 shadow-lg mb-4 will-change-transform"
                    aria-label="Go to top"
                >
                    <Zap className="w-5 h-5" />
                </a>
                
                {currentNavItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <a
                            key={item.title}
                            href={`#${item.id}`}
                            title={item.title}
                            aria-label={`Go to ${item.title}`}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 will-change-transform ${
                                isActive 
                                    ? 'bg-white text-black scale-105 shadow-md'
                                    : 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 hover:bg-opacity-20 hover:scale-105 text-white'
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                        </a>
                    );
                })}

                <button
                    onClick={handlePrint}
                    title="Print or Save as PDF"
                    aria-label="Print or save presentation as PDF"
                    className="w-9 h-9 mt-auto rounded-full flex items-center justify-center transition-all duration-150 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 hover:bg-opacity-20 hover:scale-105 text-white will-change-transform"
                >
                    <Download className="w-4 h-4" />
                </button>
            </aside>
            
            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center w-full px-4 custom-scrollbar overflow-y-auto min-h-screen sm:pl-20 md:pl-24 lg:pl-28 print:pl-0 print:px-8">
                {children}
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800;900&display=swap');
                
                html {
                    scroll-behavior: smooth;
                    scroll-padding-top: 2rem;
                }
                body, * {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                * {
                    box-sizing: border-box;
                    will-change: auto;
                }

                /* Custom Cursor */
                .custom-cursor-area {
                    cursor: none;
                }
                .custom-cursor-area a, .custom-cursor-area button {
                    cursor: none;
                }

                .cursor-dot, .cursor-outline {
                    position: fixed;
                    pointer-events: none;
                    z-index: 9999;
                    will-change: transform;
                    top: 0; left: 0;
                    transform: translate(-50%, -50%);
                }

                .cursor-dot {
                    height: 6px;
                    width: 6px;
                    background-color: white;
                    border-radius: 50%;
                }

                .cursor-outline {
                    width: 36px;
                    height: 36px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    border-radius: 50%;
                    transition: width 0.2s ease, height 0.2s ease, border-color 0.2s ease;
                }
                .cursor-outline.hover {
                    width: 48px;
                    height: 48px;
                    border-color: rgba(255, 255, 255, 1);
                    border-width: 2px;
                }

                /* Glass Card Effect */
                .glass-card {
                    background: rgba(10, 10, 10, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                }

                /* Lightning Fast Animations */
                .fade-in { 
                    animation: fadeIn 0.4s ease-out forwards;
                    opacity: 0; 
                    transform: translateY(20px);
                    will-change: opacity, transform;
                }
                @keyframes fadeIn { 
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    } 
                }

                .animate-fade-in-fast {
                    animation: fadeInFast 0.3s ease-out forwards;
                }
                @keyframes fadeInFast { 
                    from { 
                        opacity: 0; 
                        transform: translateY(10px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    } 
                }
                
                @keyframes pulse-heart {
                    0%, 100% {
                        transform: scale(1) rotate(180deg);
                        filter: drop-shadow(0 0 4px rgba(215, 38, 61, 0.5));
                    }
                    50% {
                        transform: scale(1.1) rotate(180deg);
                        filter: drop-shadow(0 0 12px rgba(215, 38, 61, 0.8));
                    }
                }
                .animate-pulse-heart {
                    animation: pulse-heart 3.5s ease-in-out infinite;
                }

                /* Scrollbar */
                .custom-scrollbar {
                    scroll-behavior: smooth;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }

                /* Performance Optimizations */
                .glass-card, .hover\\:scale-105, .hover\\:scale-110 {
                    will-change: transform, opacity;
                }
                .will-change-transform {
                    will-change: transform;
                }
                
                section {
                    scroll-margin-top: 4rem;
                }

                /* Ultra Fast Transitions */
                button, a, .glass-card {
                    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                }

                a, button {
                    text-rendering: optimizeLegibility;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    text-rendering: optimizeLegibility;
                }

                /* Print Styles for PDF Export */
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        transition: none !important;
                        animation: none !important;
                    }

                    body {
                        background: white !important;
                        color: black !important;
                    }
                    
                    .custom-cursor-area { cursor: default !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:static { position: static !important; }
                    .print\\:top-0 { top: 0 !important; }
                    .print\\:right-0 { right: 0 !important; }
                    .print\\:mb-8 { margin-bottom: 2rem !important; }
                    .print\\:pl-0 { padding-left: 0 !important; }
                    .print\\:px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
                    
                    .glass-card {
                        background: rgba(250, 250, 250, 1) !important;
                        border: 1px solid rgba(0, 0, 0, 0.1) !important;
                        backdrop-filter: none !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
                    }

                    h1,h2,h3,h4,h5,h6,p,span,div,svg {
                       color: black !important;
                       opacity: 1 !important;
                    }
                    
                    .text-white, .text-opacity-90, .text-opacity-80, .text-opacity-70, .text-opacity-60, .text-opacity-50, .text-opacity-40, .text-opacity-30 {
                        color: black !important;
                    }
                    .text-opacity-90 { opacity: 0.9 !important; }
                    .text-opacity-80 { opacity: 0.8 !important; }
                    .text-opacity-70 { opacity: 0.7 !important; }
                    .text-opacity-60 { opacity: 0.6 !important; }
                    .text-opacity-50 { opacity: 0.5 !important; }
                    .text-opacity-40 { opacity: 0.4 !important; }
                    .text-opacity-30 { opacity: 0.3 !important; }
                    
                    .bg-white.text-black {
                        background-color: #f0f0f0 !important;
                        color: black !important;
                    }
                    .bg-gradient-to-r {
                        background-image: none !important;
                        color: black !important;
                    }
                    .bg-clip-text {
                        -webkit-background-clip: border-box !important;
                        background-clip: border-box !important;
                        color: black !important;
                    }
                    
                    main {
                        padding: 0 !important;
                    }
                    
                    section {
                        page-break-inside: avoid;
                    }
                    
                    h1, h2, h3, h4, h5, h6 {
                        page-break-after: avoid;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                }
            `}</style>
        </div>
    );
}

