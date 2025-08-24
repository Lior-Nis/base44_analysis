import React from 'react';
import { LayoutGrid, MenuSquare, Package, Monitor, Instagram, CalendarDays } from 'lucide-react';

const SketchCard = ({ icon: Icon, title, description, dimensions }) => (
    <div className="text-center p-6 border-2 border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300">
        <Icon className="w-10 h-10 mx-auto text-white/60 mb-4" />
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-white/70 my-2 font-light">{description}</p>
        <p className="text-xs text-white/50 font-mono">{dimensions}</p>
    </div>
);

export default function NemesisSketchesSection() {
    return (
        <section id="nemesis-sketches" className="fade-in">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Section 3</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Thumbnail Sketches</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <SketchCard 
                    icon={LayoutGrid} 
                    title="Logo Lockups" 
                    description="Heart mark inverted & stacked with wordmark; used as photo mask."
                    dimensions="3 Variants"
                />
                <SketchCard 
                    icon={MenuSquare} 
                    title="Menu Board Signage" 
                    description="Modular cards with serif headlines and small origin snippets."
                    dimensions="1200×600 px"
                />
                <SketchCard 
                    icon={Package} 
                    title="Packaging Label" 
                    description="Large heart mark, roast profile meter, and producer story QR code on back."
                    dimensions="450×300 px"
                />
                <SketchCard 
                    icon={Monitor} 
                    title="Website Hero" 
                    description="GNW pavilion image, tagline, and clear CTAs. Heart mark as SVG stamp."
                    dimensions="1920x1080 px"
                />
                <SketchCard 
                    icon={Instagram} 
                    title="Instagram Carousel" 
                    description="4-slide template: product hero, tasting notes, origin portrait, CTA."
                    dimensions="1080x1350 px"
                />
                <SketchCard 
                    icon={CalendarDays} 
                    title="Event Booking Card" 
                    description="Compact block with date, time, price, and booking CTA. Aerial GNW visual."
                    dimensions="600x400 px"
                />
            </div>
        </section>
    );
}