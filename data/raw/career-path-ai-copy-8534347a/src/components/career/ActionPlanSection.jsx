import React from 'react';
import { CalendarCheck } from 'lucide-react';

const Milestone = React.memo(({ title, description, index }) => (
    <div className="relative flex items-start mb-8 fade-in" style={{ animationDelay: `${index * 150}ms` }}>
        <div className="w-12 h-12 rounded-full bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 flex items-center justify-center flex-shrink-0 z-10 hover:bg-opacity-20 hover:scale-110 transition-all duration-300">
            <div className="w-3 h-3 rounded-full bg-white bg-opacity-80"></div>
        </div>
        <div className="ml-6 glass-card rounded-xl p-4 flex-1 hover:bg-black hover:bg-opacity-20 transition-all duration-300 hover:scale-105">
            <h4 className="text-white font-medium mb-1">{title}</h4>
            <p className="text-white text-opacity-70 text-sm font-light">{description}</p>
        </div>
    </div>
));

export default function ActionPlanSection() {
    const milestones = [
        { title: "Month 1: Foundation", description: "Create 2 portfolio case study outlines • Start luxury identity project • Publish process shots weekly" },
        { title: "Month 2: Development", description: "Complete luxury identity case study • Create packaging mockups • Begin outreach to photographer and print house" },
        { title: "Month 3: Digital Presence", description: "Build landing portfolio page (Figma → Webflow/Wix) • Start motion tests for logo reveal • Refine case studies" },
        { title: "Month 4: Refinement", description: "Polish case studies • Request reviews from mentors • Submit to Design Week / Behance" },
        { title: "Month 5: Applications", description: "Target applications: Rethink (Vancouver) • Small boutiques outreach • Speculative briefs for Pentagram/COLLINS" },
        { title: "Month 6: Launch", description: "Refine pitch deck • Rehearse presentation • Interview prep and network follow-ups" }
    ];

    return (
        <section id="plan" className="fade-in">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Execution</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">6-Month Action Plan</p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:bg-black hover:bg-opacity-30 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-8">
                    <CalendarCheck className="w-5 h-5 text-white text-opacity-60" />
                    <h3 className="text-base font-light text-white uppercase tracking-widest">Key Milestones</h3>
                </div>
                <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white bg-opacity-20"></div>
                    {milestones.map((milestone, index) => (
                        <Milestone key={index} index={index} title={milestone.title} description={milestone.description} />
                    ))}
                </div>
            </div>
        </section>
    );
}