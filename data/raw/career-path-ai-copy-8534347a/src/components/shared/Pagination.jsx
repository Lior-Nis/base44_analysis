import React from 'react';
import { ChevronLeft, ChevronRight, FileText, BarChart, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Pagination({ currentPage, totalPages }) {
    const pages = [
        { 
            name: 'Career', 
            title: 'Career Trajectory', 
            subtitle: 'Target roles, studios & action plan',
            icon: FileText 
        },
        { 
            name: 'SWOT', 
            title: 'SWOT Analysis', 
            subtitle: 'Strategic framework & implementation',
            icon: BarChart 
        },
        {
            name: 'Nemesis',
            title: 'Nemesis Brand Audit',
            subtitle: 'In-depth case study & rebrand proposal',
            icon: Building
        }
    ];

    const currentPageIndex = pages.findIndex(p => p.name === currentPage);
    const prevPage = currentPageIndex > 0 ? pages[currentPageIndex - 1] : null;
    const nextPage = currentPageIndex < pages.length - 1 ? pages[currentPageIndex + 1] : null;

    const handlePageChange = (pageName) => {
        // Smooth scroll to top before navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Small delay to allow scroll to complete
        setTimeout(() => {
            window.location.href = createPageUrl(pageName);
        }, 300);
    };

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 print:hidden">
            <div className="glass-card rounded-2xl p-3 flex items-center gap-3 border border-white border-opacity-10 shadow-2xl">
                
                {/* Previous Page */}
                {prevPage && (
                    <button 
                        onClick={() => handlePageChange(prevPage.name)}
                        className="flex items-center gap-3 px-4 py-2 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-15 transition-all duration-300 group"
                    >
                        <ChevronLeft className="w-4 h-4 text-white text-opacity-60 group-hover:text-opacity-100 transition-opacity" />
                        <div className="text-left">
                            <div className="flex items-center gap-2">
                                <prevPage.icon className="w-3 h-3 text-white text-opacity-60" />
                                <span className="text-white text-opacity-60 text-xs font-light uppercase tracking-wider">Previous</span>
                            </div>
                            <span className="text-white text-sm font-medium">{prevPage.title}</span>
                        </div>
                    </button>
                )}

                {/* Page Indicators */}
                <div className="flex items-center gap-2 px-3">
                    {pages.map((page, index) => {
                        const isActive = page.name === currentPage;
                        return (
                            <button 
                                key={page.name}
                                onClick={() => handlePageChange(page.name)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-white' 
                                        : 'bg-white bg-opacity-30 hover:bg-opacity-50'
                                }`}
                                title={page.title}
                            />
                        );
                    })}
                </div>

                {/* Next Page */}
                {nextPage && (
                    <button 
                        onClick={() => handlePageChange(nextPage.name)}
                        className="flex items-center gap-3 px-4 py-2 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-15 transition-all duration-300 group"
                    >
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-white text-opacity-60 text-xs font-light uppercase tracking-wider">Next</span>
                                <nextPage.icon className="w-3 h-3 text-white text-opacity-60" />
                            </div>
                            <span className="text-white text-sm font-medium">{nextPage.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white text-opacity-60 group-hover:text-opacity-100 transition-opacity" />
                    </button>
                )}

            </div>
        </div>
    );
}