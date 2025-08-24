import React from 'react';

export default function NemesisCreditsSection() {
    return (
        <section id="nemesis-credits" className="fade-in text-center pt-16">
            <div className="glass-card rounded-2xl p-8">
                <h3 className="text-2xl font-light text-white">Thank You</h3>
                <p className="text-white/80 mt-2">Presentation by: Alaksa Anjum Khan</p>
                <p className="text-white/60 text-sm font-mono mt-1">Instructor: Michael Simons</p>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-sm text-white/70 uppercase tracking-widest mb-3">Credits, Resources & Image Sources</h4>
                    <div className="text-xs text-white/60 space-y-1 font-light">
                        <p>Nemesis Coffee Official Site & Instagram</p>
                        <p>Scout Magazine • Perkins&Will Architecture</p>
                    </div>
                </div>
            </div>
        </section>
    );
}