
import React from 'react';
import { Building, Users, Beaker, BarChart2, UserCheck, Search, BookOpen, Code, Coffee } from 'lucide-react';

const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="glass-card rounded-xl p-6 hover:bg-black/20 transition-colors">
        <div className="flex items-center gap-3 mb-4">
            <Icon className="w-5 h-5 text-white/70" />
            <h4 className="text-base font-medium text-white uppercase tracking-widest">{title}</h4>
        </div>
        <div className="text-sm text-white/80 font-light space-y-2">
            {children}
        </div>
    </div>
);

const PersonaCard = ({ name, age, description, pains, icon: Icon }) => (
    <div className="bg-white/5 p-4 rounded-lg border border-transparent hover:border-white/10 transition-colors duration-300 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                 <Icon className="w-6 h-6 text-white/80" />
            </div>
            <div>
                <h5 className="font-semibold text-white">{name}, {age}</h5>
                <p className="text-xs text-white/60">{description}</p>
            </div>
        </div>
        <div className="text-xs text-red-300 bg-red-900/30 p-3 rounded-md mt-auto">
            <p className="font-bold text-red-200 uppercase tracking-wider text-[10px] mb-1">Pain Points</p>
            <p className="font-light">{pains}</p>
        </div>
    </div>
);

export default function NemesisResearchSection() {
    return (
        <section id="nemesis-research" className="fade-in">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Section 1</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Detailed Research</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <InfoCard icon={Building} title="Company Background">
                    <p>Founded by Jess Reno (2017), Nemesis is a hospitality-driven specialty coffee company with a cafe + roastery ethos.</p>
                    <p>Multiple locations including the flagship GNW Pavilion, an architectural statement piece.</p>
                </InfoCard>
                <InfoCard icon={Beaker} title="Brand Personality">
                    <p>A mix of warm, creative hospitality and premium, minimalist aesthetics.</p>
                    <p>Positioned as specialty coffee with an elevated bakery/food program (Dope Bakehouse).</p>
                </InfoCard>
                <InfoCard icon={Users} title="Target Markets">
                    <p><strong className="text-white">Primary:</strong> 22-40 creative professionals, students, and tech workers.</p>
                    <p><strong className="text-white">Secondary:</strong> Food & coffee tourists, event clients.</p>
                </InfoCard>
                <InfoCard icon={BarChart2} title="Competitors">
                    <p><strong className="text-white">Direct:</strong> Revolver, Matchstick, Small Victory.</p>
                    <p><strong className="text-white">Edge:</strong> Unique architecture, strong in-house bakery, multi-roaster model.</p>
                </InfoCard>
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <UserCheck className="w-5 h-5 text-white/70" />
                        <h4 className="text-base font-medium text-white uppercase tracking-widest">Customer Personas</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <PersonaCard name="Mia" age={24} description="Creative Student" pains="Needs affordable options, strong Wi-Fi, comfortable seating." icon={BookOpen} />
                        <PersonaCard name="Ethan" age={29} description="Creative Pro" pains="Inconsistent booking/event info, wants premium options." icon={Code} />
                        <PersonaCard name="Laura" age={34} description="Weekend Visitor" pains="Wants clear menus and memorable merchandise." icon={Coffee} />
                    </div>
                </div>
            </div>
            
            <div className="glass-card rounded-2xl p-8 border-l-4 border-[#D7263D]">
                 <div className="flex items-center gap-3 mb-4">
                    <Search className="w-5 h-5 text-[#D7263D]" />
                    <h3 className="text-lg font-medium text-white uppercase tracking-widest">Quick Audit Takeaways</h3>
                </div>
                <p className="text-white/90 font-light leading-relaxed">
                    Nemesis has a strong product and spatial identity, but there's a disconnect in cohesion between the physical brand experience (the pavilion), the digital presence (website/shop), and social media storytelling. The compelling coffee origin content exists but is not consistently surfaced at key customer touchpoints.
                </p>
            </div>
        </section>
    );
}
