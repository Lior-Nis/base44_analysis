import React from 'react';
import { Layers } from 'lucide-react';

export default function MorphVisualizer() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="text-center">
        <Layers className="w-24 h-24 mx-auto text-emerald-500 mb-6" />
        <h1 className="text-5xl font-bold text-slate-100 mb-4">Morph Visualizer</h1>
        <p className="text-2xl font-semibold text-emerald-400 bg-emerald-900/50 py-2 px-4 rounded-lg inline-block">
          Coming Soon!
        </p>
        <p className="text-lg text-slate-400 mt-6 max-w-2xl mx-auto">
          This exciting feature will allow you to layer different genetic traits to visualize potential breeding outcomes. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
}