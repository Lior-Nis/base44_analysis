import React from 'react';
import { Shield, AlertTriangle, TrendingUp, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const SWOTQuadrant = ({ title, icon: Icon, items, color, position, index }) => {
    const isPositive = position === 'top-left' || position === 'top-right';
    const isInternal = position === 'top-left' || position === 'bottom-left';

    return (
        <div 
            className={`relative glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-500 ${
                position === 'top-left' ? 'border-l-4 border-l-green-400' :
                position === 'top-right' ? 'border-r-4 border-r-blue-400' :
                position === 'bottom-left' ? 'border-l-4 border-l-yellow-400' :
                'border-r-4 border-r-red-400'
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Corner Icon */}
            <div className={`absolute ${
                position === 'top-left' ? '-top-3 -left-3' :
                position === 'top-right' ? '-top-3 -right-3' :
                position === 'bottom-left' ? '-bottom-3 -left-3' :
                '-bottom-3 -right-3'
            } w-8 h-8 rounded-full ${color} bg-opacity-20 border-2 border-white border-opacity-10 flex items-center justify-center backdrop-blur-sm`}>
                <Icon className="w-4 h-4 text-white" />
            </div>

            {/* Header */}
            <div className="mb-4">
                <h3 className="text-lg font-medium text-white uppercase tracking-wide mb-1">{title}</h3>
                <div className="flex items-center gap-2 text-xs text-white text-opacity-60">
                    <span>{isInternal ? 'Internal' : 'External'}</span>
                    <span>•</span>
                    <span>{isPositive ? 'Positive' : 'Negative'}</span>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full ${color} bg-opacity-60 mt-1.5 flex-shrink-0`}></div>
                        <div>
                            <h4 className="text-white text-sm font-medium leading-tight mb-1">{item.title}</h4>
                            <p className="text-white text-opacity-70 text-xs leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SWOTAxis = () => (
    <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal Line */}
        <div className="absolute top-1/2 left-4 right-4 h-px bg-white bg-opacity-20 transform -translate-y-px"></div>
        
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white bg-opacity-20 transform -translate-x-px"></div>
        
        {/* Labels */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <span className="text-white text-opacity-50 text-xs font-light uppercase tracking-widest">Positive</span>
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-white text-opacity-50 text-xs font-light uppercase tracking-widest">Negative</span>
        </div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90">
            <span className="text-white text-opacity-50 text-xs font-light uppercase tracking-widest">Internal</span>
        </div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90">
            <span className="text-white text-opacity-50 text-xs font-light uppercase tracking-widest">External</span>
        </div>
    </div>
);

export default function SWOTMatrix({ strengths, weaknesses, opportunities, threats }) {
    return (
        <div className="relative">
            {/* Matrix Container */}
            <div className="relative glass-card rounded-3xl p-8 border border-white border-opacity-10">
                <SWOTAxis />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    <SWOTQuadrant 
                        title="Strengths"
                        icon={Shield}
                        items={strengths}
                        color="bg-green-500"
                        position="top-left"
                        index={0}
                    />
                    <SWOTQuadrant 
                        title="Opportunities"
                        icon={TrendingUp}
                        items={opportunities}
                        color="bg-blue-500"
                        position="top-right"
                        index={1}
                    />
                    <SWOTQuadrant 
                        title="Weaknesses"
                        icon={AlertTriangle}
                        items={weaknesses}
                        color="bg-yellow-500"
                        position="bottom-left"
                        index={2}
                    />
                    <SWOTQuadrant 
                        title="Threats"
                        icon={Target}
                        items={threats}
                        color="bg-red-500"
                        position="bottom-right"
                        index={3}
                    />
                </div>
            </div>

            {/* Strategy Arrows */}
            <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-2 bg-black bg-opacity-40 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <ArrowUpRight className="w-3 h-3 text-green-400" />
                        <span className="text-white text-xs font-medium">S-O Strategy</span>
                    </div>
                </div>
                <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
                    <div className="flex items-center gap-2 bg-black bg-opacity-40 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                        <span className="text-white text-xs font-medium">W-T Strategy</span>
                    </div>
                </div>
            </div>
        </div>
    );
}