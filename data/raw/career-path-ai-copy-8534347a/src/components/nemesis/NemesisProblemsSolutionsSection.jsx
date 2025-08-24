
import React from 'react';
import { Layers, BookOpen, Compass, CreditCard, Wand, Book, Pin, ShoppingCart } from 'lucide-react';

const ProblemCard = ({ icon: Icon, title, description, index }) => (
    <div className="p-6 bg-red-900/20 rounded-xl h-full">
        <div className="flex items-center gap-3 mb-3">
            <Icon className="w-5 h-5 text-red-400" />
            <h4 className="text-base font-medium text-white">Problem #{index}: {title}</h4>
        </div>
        <p className="text-sm text-white/70 font-light">{description}</p>
    </div>
);

const SolutionCard = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-green-900/20 rounded-xl h-full">
        <div className="flex items-center gap-3 mb-3">
            <Icon className="w-5 h-5 text-green-400" />
            <h4 className="text-base font-medium text-white">Solution: {title}</h4>
        </div>
        <p className="text-sm text-white/70 font-light">{description}</p>
    </div>
);

export default function NemesisProblemsSolutionsSection() {
    const items = [
        { 
            pIcon: Layers, pTitle: "Inconsistent Tone", pDesc: "Website, social, and in-store voice feel disjointed, creating brand friction for new visitors.",
            sIcon: Book, sTitle: "Brand Guidelines & Grid", sDesc: "Create a compact brand playbook and social templates for a consistent tone and faster content creation."
        },
        { 
            pIcon: BookOpen, pTitle: "Underleveraged Storytelling", pDesc: "Origin/producer stories are not integrated at key touchpoints like menus or packaging, missing a chance to add value.",
            sIcon: Book, sTitle: "Provenance Integration", sDesc: "Add origin modules (farm blurbs, QR codes) to packaging, menus, and web pages to link product to story."
        },
        { 
            pIcon: Compass, pTitle: "Generic Environmental Signage", pDesc: "The iconic pavilion's interior signage and wayfinding lack a consistent, branded vocabulary.",
            sIcon: Pin, sTitle: "Environmental Graphics System", sDesc: "Develop a kit (vinyl, menus, aprons) that echoes the pavilion's architecture and brand identity."
        },
        { 
            pIcon: CreditCard, pTitle: "Conversion & UX Gaps", pDesc: "Digital shop and event pages have friction points that hinder online purchases and bookings.",
            sIcon: ShoppingCart, sTitle: "E-commerce & Events UX Overhaul", sDesc: "Redesign product/event pages with clearer info, single-click actions, and better booking flows."
        }
    ];

    return (
        <section id="nemesis-problems-solutions" className="fade-in">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Section 2</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Problems & Strategic Solutions</p>
                <div className="mt-6 max-w-3xl mx-auto glass-card p-4 rounded-xl border-l-4 border-r-4 border-[#D7263D]/80">
                    <p className="text-white/80 font-light italic">Theme: “Anchor the story — unify the system.”</p>
                    <p className="mt-2 text-white/90 font-medium">Center every touchpoint on three pillars: Hospitality, Provenance, & Design.</p>
                </div>
            </div>

            <div className="space-y-8">
                {items.map((item, index) => (
                    <div key={index} className="glass-card rounded-2xl p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ProblemCard icon={item.pIcon} title={item.pTitle} description={item.pDesc} index={index + 1} />
                            <SolutionCard icon={item.sIcon} title={item.sTitle} description={item.sDesc} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
