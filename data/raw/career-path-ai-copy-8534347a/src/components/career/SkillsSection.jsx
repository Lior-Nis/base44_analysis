import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, TrendingUp, Image as ImageIcon } from 'lucide-react';

const RoleCard = React.memo(({ rank, title, subtitle, index }) => (
    <div className="glass-card rounded-xl p-6 hover:bg-black hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
        style={{ animationDelay: `${index * 100}ms` }}>
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white bg-opacity-10 border border-white border-opacity-10 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 hover:bg-opacity-20 transition-all duration-200">{rank}</div>
            <div>
                <p className="text-white text-opacity-90 font-medium text-lg">{title}</p>
                <p className="text-white text-opacity-70 font-extralight text-sm">{subtitle}</p>
            </div>
        </div>
    </div>
));

const ProgressBar = React.memo(({ label, percentage }) => {
    const [width, setWidth] = useState(0);
    const barRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setWidth(percentage), 200); // Small delay before animation starts
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.3 } // Trigger when 30% of the component is visible
        );

        const currentRef = barRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if(currentRef) {
                observer.unobserve(currentRef);
            }
        }
    }, [percentage]);

    return (
        <div ref={barRef}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-white text-opacity-90 font-light">{label}</span>
                <span className="text-white text-opacity-70 text-sm font-light">{width}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-10 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-white to-gray-300 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                        width: `${width}%`,
                        boxShadow: width > 0 ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none'
                    }}
                />
            </div>
        </div>
    );
});

const SkillSet = React.memo(({ title, icon: Icon, skills }) => (
    <div className="glass-card rounded-2xl p-8 hover:bg-black hover:bg-opacity-10 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-8">
            <Icon className="w-5 h-5 text-white text-opacity-60" />
            <h3 className="text-base font-light text-white uppercase tracking-widest">{title}</h3>
        </div>
        <div className="space-y-6">
            {skills.map((skill, index) => (
                <div key={skill.name} className="fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <ProgressBar label={skill.name} percentage={skill.level} />
                </div>
            ))}
        </div>
    </div>
));

const FocusCard = React.memo(({ title, subtitle, index }) => (
    <div className="glass-card rounded-xl overflow-hidden hover:bg-black hover:bg-opacity-20 transition-all duration-500 flex flex-col hover:scale-105 hover:-translate-y-2"
        style={{ animationDelay: `${index * 100}ms` }}>
        <div className="h-48 bg-black bg-opacity-20 flex items-center justify-center border-b border-white border-opacity-5 hover:bg-opacity-30 transition-colors duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="text-center z-10">
                <ImageIcon className="w-10 h-10 text-white text-opacity-30 mx-auto mb-1 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-white text-opacity-40 text-xs font-light">Project Preview</p>
            </div>
        </div>
        <div className="p-6 flex-grow">
            <h4 className="text-lg font-medium text-white mb-1">{title}</h4>
            <p className="text-white text-opacity-80 font-extralight">{subtitle}</p>
        </div>
    </div>
));

export default function SkillsSection() {
    return (
        <section id="skills" className="fade-in space-y-24">
            <div>
                <div className="text-center mb-12">
                    <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Career Trajectory</h2>
                    <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Target Roles & Skills</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RoleCard index={0} rank="1" title="Brand Identity Designer / Art Director" subtitle="luxury & cultural brands" />
                    <RoleCard index={1} rank="2" title="Senior Visual Designer" subtitle="packaging, editorial, typographic systems" />
                    <RoleCard index={2} rank="3" title="Motion & Systems Designer" subtitle="brand motion, launch assets, campaigns" />
                    <RoleCard index={3} rank="4" title="Design Lead" subtitle="small boutique studio (project & client ownership)" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <SkillSet 
                    title="Core Competencies"
                    icon={CheckCircle}
                    skills={[
                        { name: "Logo systems", level: 85 },
                        { name: "Adobe CC (PS/AI/ID)", level: 90 },
                        { name: "Figma", level: 80 },
                        { name: "Photography & composition", level: 75 },
                        { name: "Brand concepting", level: 85 },
                    ]}
                />
                <SkillSet 
                    title="Growth Areas"
                    icon={TrendingUp}
                    skills={[
                        { name: "Packaging production & finishes", level: 30 },
                        { name: "Motion identity & After Effects", level: 25 },
                        { name: "Design systems for digital", level: 40 },
                        { name: "Client-facing storytelling", level: 35 },
                        { name: "Advanced typography & custom type", level: 45 },
                    ]}
                />
            </div>
            
            <div>
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-light text-white tracking-tight mb-2">Portfolio Focus</h3>
                    <p className="text-white text-opacity-70 text-base font-extralight">Four case studies to demonstrate end-to-end design capability.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FocusCard index={0} title="Luxury Identity + Packaging" subtitle="Bengali-Western fusion jewelry brand" />
                    <FocusCard index={1} title="Cultural Food Brand" subtitle="Editorial & packaging system (limited run)" />
                    <FocusCard index={2} title="Campaign Launch" subtitle="Boutique hotel (motion + print + web)" />
                    <FocusCard index={3} title="Creative Collective Brand" subtitle="Type-driven, modular system" />
                </div>
            </div>
        </section>
    )
}