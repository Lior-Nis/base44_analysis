
import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';

const ClayButton = ({ onClick, children, variant = "primary", size = "default", className = "", ...props }) => {
    const baseClasses = "font-medium transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50";
    
    const variants = {
        primary: "bg-gradient-to-br from-emerald-300 to-emerald-400 hover:from-emerald-400 hover:to-emerald-500 text-emerald-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_6px_12px_rgba(16,185,129,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_8px_16px_rgba(16,185,129,0.4)] focus:ring-emerald-300",
        secondary: "bg-gradient-to-br from-slate-300 to-slate-400 hover:from-slate-400 hover:to-slate-500 text-slate-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_6px_12px_rgba(100,116,139,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_8px_16px_rgba(100,116,139,0.4)] focus:ring-slate-300"
    };
    
    const sizes = {
        sm: "px-4 py-2 text-sm rounded-2xl",
        default: "px-6 py-3 text-base rounded-3xl",
        lg: "px-8 py-4 text-lg rounded-3xl"
    };
    
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default function PromptPreview({ promptJson, onClear }) {
    const [copied, setCopied] = useState(false);

    const jsonString = JSON.stringify(promptJson, null, 2);
    
    // Count words and characters
    const wordCount = jsonString.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = jsonString.length;
    const secRead = Math.ceil(wordCount / 200);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadJson = () => {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'veo3-prompt.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-gradient-to-br from-white to-rose-50 rounded-3xl p-6 md:p-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.1)] border border-rose-100/50">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    ✨ Generated Google Veo 3 Prompt
                </h3>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
                <div className="bg-gradient-to-br from-rose-200 to-rose-300 rounded-2xl p-3 text-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(251,113,133,0.2)] flex flex-col justify-center items-center">
                    <div className="text-xl md:text-2xl font-bold text-rose-800">{wordCount}</div>
                    <div className="text-xs text-rose-600">Words</div>
                </div>
                <div className="bg-gradient-to-br from-rose-200 to-rose-300 rounded-2xl p-3 text-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(251,113,133,0.2)] flex flex-col justify-center items-center">
                    <div className="text-xl md:text-2xl font-bold text-rose-800">{charCount}</div>
                    <div className="text-xs text-rose-600">Characters</div>
                </div>
                <div className="bg-gradient-to-br from-rose-200 to-rose-300 rounded-2xl p-3 text-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(251,113,133,0.2)] flex flex-col justify-center items-center">
                    <div className="text-xl md:text-2xl font-bold text-rose-800">{secRead}</div>
                    <div className="text-xs text-rose-600">Sec Read</div>
                </div>
            </div>

            {/* JSON Display */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 mb-8 shadow-[inset_0_3px_6px_rgba(0,0,0,0.07)] border border-blue-100/50 max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {jsonString}
                </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <ClayButton 
                    onClick={copyToClipboard}
                    className="flex-1"
                >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Veo 3 Prompt'}
                </ClayButton>
                <ClayButton 
                    onClick={onClear}
                    variant="secondary"
                    className="flex-1 sm:flex-initial"
                >
                    Clear All
                </ClayButton>
            </div>
        </div>
    );
}
