
import React from 'react';
import { Palette, Type, MousePointerClick, ShieldCheck, Milestone, Figma, Box, CircleDollarSign } from 'lucide-react';

const ColorSwatch = ({ hex, name }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: hex }}></div>
        <div>
            <p className="font-medium text-white">{name}</p>
            <p className="text-xs text-white/60 font-mono">{hex}</p>
        </div>
    </div>
);

// RoadmapStep component is no longer used, its logic is inlined in the NemesisDigitalSection
// const RoadmapStep = ({ week, title, description }) => (
//     <div className="relative pl-8">
//         <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white/20 border-2 border-white/30"></div>
//         <p className="text-sm font-bold text-white/60">Week {week}</p>
//         <h5 className="font-medium text-white">{title}</h5>
//         <p className="text-sm text-white/70 font-light">{description}</p>
//     </div>
// );

export default function NemesisDigitalSection() {
    const roadmapSteps = [
        { week: "1–2", title: "Brand Guidelines & Social Templates", description: "Establish the core visual and tonal rules." },
        { week: "3", title: "Packaging Label Proof (1 SKU)", description: "Integrate QR code and producer story." },
        { week: "4–5", title: "Web Prototypes & Usability Testing", description: "Build and test new page designs in Figma." },
        { week: "6", title: "Environmental Graphics Proofs", description: "Finalize designs for GNW & Gastown locations." },
        { week: "7", title: "Front‑end Dev & Shop Adjustments", description: "Implement subscription toggles and UX improvements." },
        { week: "8", title: "Soft Launch & Staff Training", description: "Roll out changes internally and launch social campaign." }
    ];

    return (
        <section id="nemesis-digital" className="fade-in space-y-24">
            <div>
                <div className="text-center mb-12">
                    <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Section 4</h2>
                    <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Digital Potential Solution</p>
                </div>
                
                <div className="glass-card rounded-2xl overflow-hidden mb-8">
                    <div className="p-3 bg-black/30 border-b border-white/10 flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="ml-auto text-xs text-white/40 font-mono">localhost:3000</div>
                    </div>
                    <div className="p-8">
                        <h3 className="text-lg font-medium text-white mb-4 uppercase tracking-widest">Homepage & Product Page</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-light">
                            <div className="bg-white/5 p-6 rounded-lg">
                                <h4 className="font-medium text-white mb-2">Homepage Hero Copy</h4>
                                <p className="text-xl text-white/90">“Coffee that’s from a place — roasted with purpose.”</p>
                                <p className="text-white/70 mt-2">Subhead: “Nemesis curates roasters and producers. Taste the origin.”</p>
                                <div className="flex gap-2 mt-4">
                                    <button className="text-xs px-3 py-1 bg-white text-black rounded-full">Shop Coffee</button>
                                    <button className="text-xs px-3 py-1 bg-white/10 text-white rounded-full">Reserve Events</button>
                                </div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-lg">
                                <h4 className="font-medium text-white mb-2">Product Page Elements</h4>
                                <p className="text-white/80">Hero image, Tasting ribbon (acidity/roast icons), Short origin line with link.</p>
                                <p className="text-white/80 mt-2">Subscription toggle: weekly / bi-weekly.</p>
                                <p className="italic text-white/60 mt-2">Microcopy: “Each purchase supports the producer. Learn why.”</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6"><Palette className="w-5 h-5 text-white/70" /><h4 className="text-base font-medium text-white uppercase tracking-widest">Visual System & Palette</h4></div>
                        <div className="space-y-4">
                            <ColorSwatch hex="#D7263D" name="Nemesis Red" />
                            <ColorSwatch hex="#F7F7F7" name="Off-White" />
                            <ColorSwatch hex="#1D1D1F" name="Charcoal" />
                            <ColorSwatch hex="#E6D8C3" name="Soft Sand" />
                        </div>
                    </div>
                     <div className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6"><Type className="w-5 h-5 text-white/70" /><h4 className="text-base font-medium text-white uppercase tracking-widest">Typographic System</h4></div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-3xl" style={{ fontFamily: "'Neue Haas Grotesk Display Pro', sans-serif" }}>Display: Neue Haas Grotesk</p>
                                <p className="text-white/60 text-sm">48–72 px</p>
                            </div>
                             <div>
                                <p className="text-lg">UI & Body: Inter</p>
                                <p className="text-white/60 text-sm">16–18 px / 1.45 line height</p>
                            </div>
                             <div>
                                <p className="text-lg" style={{ fontFamily: "'Tiempos Text', serif" }}>Accent: Tiempos Text</p>
                                <p className="text-white/60 text-sm">For editorial headlines</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-light text-white tracking-tight">Implementation Roadmap</h3>
                </div>
                <div className="relative border-l-2 border-white/20 pl-10">
                    {roadmapSteps.map((step, index) => (
                        <div key={index} className="mb-12 relative last:mb-0">
                             <div className="absolute -left-[50px] top-0 w-8 h-8 rounded-full bg-black border-2 border-white/30 flex items-center justify-center">
                                <span className="text-white/80 font-mono text-sm">{index + 1}</span>
                            </div>
                            <p className="text-sm font-bold text-white/60">Week {step.week}</p>
                            <h5 className="font-medium text-white text-lg">{step.title}</h5>
                            <p className="text-sm text-white/70 font-light mt-1">{step.description}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center gap-2"><Figma className="w-4 h-4 text-white/70"/> <span className="text-sm text-white/80">Figma</span></div>
                    <div className="flex items-center justify-center gap-2"><Box className="w-4 h-4 text-white/70"/> <span className="text-sm text-white/80">Illustrator/InDesign</span></div>
                    <div className="flex items-center justify-center gap-2"><CircleDollarSign className="w-4 h-4 text-white/70"/> <span className="text-sm text-white/80">$6–12k CAD Budget</span></div>
                </div>
            </div>
        </section>
    );
}
