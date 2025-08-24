
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Globe, Users, GitMerge, MapPin, Briefcase, ExternalLink, Image as ImageIcon } from 'lucide-react';
import CountdownTimer from '@/components/shared/CountdownTimer';

const StudioCard = React.memo(({ rank, name, location, founded, team, specialty, description, alignment, website, websiteUrl, index }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    return (
        <div 
            className="glass-card rounded-2xl overflow-hidden transition-all duration-500 flex flex-col hover:scale-105 hover:-translate-y-2 will-change-transform"
            style={{
                animationDelay: `${index * 150}ms`,
                transform: isHovered ? 'scale(1.02) translateY(-8px)' : 'scale(1) translateY(0)',
                boxShadow: isHovered ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="h-40 bg-black bg-opacity-20 flex items-center justify-center border-b border-white border-opacity-5 relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 transition-opacity duration-300"
                    style={{ opacity: isHovered ? 0.05 : 0 }}
                />
                <div className="text-center z-10">
                    <ImageIcon className="w-10 h-10 text-white text-opacity-30 mx-auto mb-1 transition-transform duration-300" 
                        style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }} />
                    <p className="text-white text-opacity-40 text-xs font-light">Studio Logo</p>
                </div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-light text-white tracking-tight transition-transform duration-300"
                            style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}>
                            {name}
                        </h3>
                        <div className="flex items-center gap-2 text-white text-opacity-70 mt-2">
                            <MapPin className="w-4 h-4 text-white text-opacity-60" />
                            <span className="font-light">{location}</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white bg-opacity-5 backdrop-blur-md border border-white border-opacity-10 flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{ 
                            transform: isHovered ? 'rotate(5deg) scale(1.05)' : 'rotate(0deg) scale(1)',
                            backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                        }}>
                        <span className="text-white font-bold text-xl">{rank}</span>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatPill label="Founded" value={founded} />
                    <StatPill label="Team" value={team} />
                    <StatPill label="Specialty" value={specialty} />
                </div>
                <p className="text-white text-opacity-80 leading-relaxed mb-6 font-extralight text-base flex-grow">{description}</p>
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-white text-opacity-50" />
                        <span className="text-white text-opacity-60 font-light text-xs uppercase tracking-widest">Alignment</span>
                    </div>
                    <p className="text-white text-opacity-90 font-extralight italic pl-4 border-l-2 border-white border-opacity-20">"{alignment}"</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-white text-opacity-60">
                        <Globe className="w-4 h-4" />
                        <span className="font-mono text-sm font-light">{website}</span>
                    </div>
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 flex items-center justify-center transition-all duration-300 hover:bg-opacity-20 hover:scale-110 hover:rotate-12">
                        <ExternalLink className="w-5 h-5 text-white" />
                    </a>
                </div>
            </div>
        </div>
    );
});

const StatPill = ({ label, value }) => (
    <div className="text-center p-3 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-colors,transform duration-200 transform hover:scale-105">
        <div className="text-white font-medium text-base">{value}</div>
        <div className="text-white text-opacity-60 text-xs uppercase tracking-wider font-light">{label}</div>
    </div>
);

export default function StudiosSection() {
    return (
        <section id="studios" className="fade-in">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Aspirations</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Target Studios</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                 <div className="glass-card rounded-xl p-6 text-center hover:bg-white hover:bg-opacity-10 transition-colors,transform duration-300 hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tight">
                        <CountdownTimer targetNumber={4} duration={1500} />
                    </div>
                    <div className="text-white text-opacity-90 font-medium mb-1">Target Studios</div>
                    <div className="text-white text-opacity-60 text-sm">Carefully selected</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center hover:bg-white hover:bg-opacity-10 transition-colors,transform duration-300 hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 flex items-center justify-center mx-auto mb-4">
                         <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tight">
                        <CountdownTimer targetNumber={5} duration={1800} />
                    </div>
                    <div className="text-white text-opacity-90 font-medium mb-1">Cities</div>
                    <div className="text-white text-opacity-60 text-sm">Global reach</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center hover:bg-white hover:bg-opacity-10 transition-colors,transform duration-300 hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tight">
                        <CountdownTimer targetNumber={300} suffix="+" duration={2200} />
                    </div>
                    <div className="text-white text-opacity-90 font-medium mb-1">Total Team</div>
                    <div className="text-white text-opacity-60 text-sm">Across studios</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center hover:bg-white hover:bg-opacity-10 transition-colors,transform duration-300 hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 flex items-center justify-center mx-auto mb-4">
                        <GitMerge className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tight">
                        <CountdownTimer targetNumber={50} suffix="+" duration={2500} />
                    </div>
                    <div className="text-white text-opacity-90 font-medium mb-1">Years Combined</div>
                    <div className="text-white text-opacity-60 text-sm">Experience</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StudioCard 
                    index={0}
                    rank="1"
                    name="PENTAGRAM"
                    location="Global"
                    founded="1972"
                    team="20+ Partners"
                    specialty="Brand Identity"
                    description="World-renowned interdisciplinary design collective (brand & identity, luxury systems)"
                    alignment="Global prestige and luxury system mastery"
                    website="pentagram.com"
                    websiteUrl="https://www.pentagram.com"
                />
                
                <StudioCard 
                    index={1}
                    rank="2"
                    name="RETHINK"
                    location="Vancouver, Canada"
                    founded="1999"
                    team="150+ People"
                    specialty="Brand Strategy"
                    description="Canadian creative agency with strong Vancouver presence; formalizing design practice"
                    alignment="Local connection with growing design focus"
                    website="rethinkideas.com"
                    websiteUrl="https://www.rethinkideas.com"
                />

                <StudioCard 
                    index={2}
                    rank="3"
                    name="ANAGRAMA"
                    location="Mexico City"
                    founded="2011"
                    team="30+ Designers"
                    specialty="Packaging"
                    description="Boutique studio known for material-driven, finish-forward brand systems and packaging"
                    alignment="Material craft and packaging expertise"
                    website="anagrama.com"
                    websiteUrl="https://www.anagrama.com"
                />

                <StudioCard 
                    index={3}
                    rank="4"
                    name="COLLINS"
                    location="New York / SF"
                    founded="2008"
                    team="100+ Team"
                    specialty="Transformation"
                    description="Transformation & brand studio (strategy → identity → product experiences)"
                    alignment="End-to-end brand transformation focus"
                    website="wearecollins.com"
                    websiteUrl="https://www.wearecollins.com"
                />
            </div>
        </section>
    );
}
