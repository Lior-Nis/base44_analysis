import React from 'react';
import { MessageCircle, Users, Heart, Image as ImageIcon } from 'lucide-react';

const SupportCard = React.memo(({ icon: Icon, title, description, index }) => (
    <div className="text-center p-6 bg-black bg-opacity-20 rounded-xl border border-white border-opacity-5 hover:bg-opacity-30 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
        style={{ animationDelay: `${index * 150}ms` }}>
        <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-10 flex items-center justify-center mx-auto mb-4 hover:bg-opacity-20 hover:scale-110 transition-all duration-300">
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h4 className="text-lg font-medium text-white mb-2">{title}</h4>
        <p className="text-white text-opacity-70 font-extralight">{description}</p>
    </div>
));

export default function ContactSection() {
    return (
        <section id="contact" className="fade-in pt-16 pb-16">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Collaboration</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Let's Connect</p>
            </div>
            <div className="glass-card rounded-2xl p-8 mb-12 hover:bg-black hover:bg-opacity-30 transition-colors duration-300">
                <div className="text-center mb-8">
                    <h3 className="text-xl font-light text-white tracking-tight">What Support I Need</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SupportCard index={0} icon={MessageCircle} title="Feedback" description="On portfolio direction and case study priority." />
                    <SupportCard index={1} icon={Users} title="Connections" description="To design leads and creatives at target studios." />
                    <SupportCard index={2} icon={Heart} title="Mentorship" description="Guidance from experienced designers in luxury branding." />
                </div>
            </div>

            <div className="glass-card rounded-2xl p-8 text-center hover:bg-black hover:bg-opacity-30 transition-colors duration-300">
                <div className="w-24 h-24 rounded-full bg-black bg-opacity-20 flex items-center justify-center mx-auto mb-6 border-2 border-white border-opacity-10 hover:scale-110 hover:rotate-3 transition-all duration-500 hover:border-opacity-30">
                    <div className="text-center">
                        <ImageIcon className="w-10 h-10 text-white text-opacity-30 mx-auto mb-1" />
                        <p className="text-white text-opacity-40 text-xs font-light">Contact Photo</p>
                    </div>
                </div>
                <button className="px-8 py-4 bg-white text-black font-light rounded-full hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-base">
                    Get in Touch
                </button>
                <div className="mt-6 pt-6 border-t border-white border-opacity-10">
                    <p className="text-white text-opacity-60 font-extralight">
                        <span className="font-mono text-sm">alaksa.khan@lasallecollege.com</span> • Vancouver, BC
                    </p>
                </div>
            </div>
        </section>
    );
}