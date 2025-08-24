import React from 'react';
import { Shield, AlertTriangle, TrendingUp, Target, CheckCircle } from 'lucide-react';

const ActionCard = ({ title, items, icon: Icon, color, index }) => (
    <div 
        className="glass-card rounded-2xl p-6 hover:bg-black hover:bg-opacity-20 transition-all duration-500 hover:scale-105"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-20 border border-white border-opacity-10 flex items-center justify-center relative overflow-hidden`}>
                <div className={`absolute inset-0 ${color} bg-opacity-10 animate-pulse`}></div>
                <Icon className="w-5 h-5 text-white relative z-10" />
            </div>
            <h4 className="text-lg font-medium text-white">{title}</h4>
        </div>
        <ul className="space-y-3">
            {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-white bg-opacity-10 border border-white border-opacity-20 flex items-center justify-center mt-0.5 group-hover:bg-opacity-20 transition-all duration-200">
                        <CheckCircle className="w-3 h-3 text-white text-opacity-60" />
                    </div>
                    <span className="text-white text-opacity-80 font-light text-sm leading-relaxed group-hover:text-opacity-100 transition-all duration-200">
                        {item}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

const StrategyFlow = () => (
    <div className="relative mb-8">
        <div className="glass-card rounded-2xl p-6 text-center">
            <h3 className="text-xl font-light text-white mb-4 uppercase tracking-wide">Strategic Implementation Flow</h3>
            <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-green-500 bg-opacity-20 rounded-full px-4 py-2 border border-green-500 border-opacity-30">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm font-medium">Leverage</span>
                </div>
                <div className="text-white text-opacity-40">→</div>
                <div className="flex items-center gap-2 bg-yellow-500 bg-opacity-20 rounded-full px-4 py-2 border border-yellow-500 border-opacity-30">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-medium">Improve</span>
                </div>
                <div className="text-white text-opacity-40">→</div>
                <div className="flex items-center gap-2 bg-blue-500 bg-opacity-20 rounded-full px-4 py-2 border border-blue-500 border-opacity-30">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Seize</span>
                </div>
                <div className="text-white text-opacity-40">→</div>
                <div className="flex items-center gap-2 bg-red-500 bg-opacity-20 rounded-full px-4 py-2 border border-red-500 border-opacity-30">
                    <Target className="w-4 h-4 text-red-400" />
                    <span className="text-white text-sm font-medium">Guard</span>
                </div>
            </div>
        </div>
    </div>
);

export default function ActionPlanVisual() {
    return (
        <div>
            <StrategyFlow />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActionCard 
                    title="To Maximize Strengths"
                    icon={Shield}
                    color="bg-green-500"
                    index={0}
                    items={[
                        "Create a cinematic portfolio site that showcases not only designs but their commercial and storytelling impact.",
                        "Keep refining your cultural fusion style so it becomes a signature people instantly recognize."
                    ]}
                />
                <ActionCard 
                    title="To Improve Weaknesses"
                    icon={AlertTriangle}
                    color="bg-yellow-500"
                    index={1}
                    items={[
                        "Adopt a 'launch fast, refine later' policy on personal and client projects to reduce perfectionism delays.",
                        "Dedicate weekly 'deep skill sprints' to motion and 3D tools (Blender, After Effects) so you close the gap."
                    ]}
                />
                <ActionCard 
                    title="To Seize Opportunities"
                    icon={TrendingUp}
                    color="bg-blue-500"
                    index={2}
                    items={[
                        "Attend Vancouver creative meetups and design festivals to actively network and land collaborations.",
                        "Develop case studies showing AI-assisted workflows for high-end brands—this will make you a go-to name in the AI design niche."
                    ]}
                />
                <ActionCard 
                    title="To Guard Against Threats"
                    icon={Target}
                    color="bg-red-500"
                    index={3}
                    items={[
                        "Build a strong personal brand on platforms like Instagram, Behance, and LinkedIn so you're not competing solely on price.",
                        "Keep a continuous learning loop—set monthly challenges to learn new tools before they go mainstream.",
                        "Diversify income streams so you're not entirely reliant on client budgets."
                    ]}
                />
            </div>
        </div>
    );
}