
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PromptPreview from '../components/builder/PromptPreview';

const scenes = [
  "A train conductor checking his pocket watch on a misty platform.",
  "A chef meticulously plating a complex dish in a high-end kitchen.",
  "An astronaut floating silently in the ISS, looking down at Earth.",
  "A librarian stamping books in a dusty, sunlit library.",
  "A group of friends laughing around a campfire on a beach.",
  "A detective studying a clue board in a dimly lit office.",
  "A street artist spray-painting a vibrant mural on a brick wall.",
  "A child flying a kite in a vast, green field on a windy day.",
  "A friendly yeti telling jokes while building a snowman in the mountains.",
  "A 3D animated map of France with the Eiffel Tower slowly emerging from Paris.",
  "Ancient pyramids materializing on an Egyptian desert map with golden sunrise.",
  "A digital map of Japan with Mount Fuji and cherry blossoms appearing gracefully."
];

const compositions = [
  "Wide aerial tracking shot",
  "Extreme close-up",
  "Medium shot",
  "Over-the-shoulder shot",
  "Point-of-view (POV) shot",
  "Low angle shot",
  "Dutch angle shot"
];

const visualStyles = [
  "Cinematic",
  "Documentary",
  "Vintage Film (16mm)",
  "Hyper-realistic",
  "Anime",
  "Film Noir",
  "Technicolor"
];

const lightingStyles = [
  "Natural lighting",
  "Golden hour",
  "Studio lighting",
  "Neon lighting",
  "High-contrast",
  "Moonlight",
  "Backlit"
];

const backgrounds = [
  "Indoor setting",
  "Bustling city street",
  "Misty forest",
  "Modern minimalist apartment",
  "Futuristic sci-fi corridor",
  "Crowded marketplace",
  "Serene mountain landscape"
];

const audioCues = [
  "Ambient sounds",
  "Upbeat jazz music",
  "Tense string orchestra",
  "Sound of gentle rain",
  "Distant city sirens",
  "Chirping birds",
  "Suspenseful silence"
];

const dialogues = [
  "You know what they say about first impressions, but I've learned to never judge too quickly.",
  "It wasn't about the destination. It was about the journey we never took.",
  "Sometimes, the smallest key can unlock the biggest door.",
  "Is this what we were fighting for? I can't remember anymore.",
  "I've seen things you people wouldn't believe.",
  "Just act natural. They can't know we're here.",
  "Why did the yeti cross the road? To get to the ice cream shop!",
  "Look at this beautiful country unfold before our eyes like a living story."
];

const colorPalettes = [
    { name: "None", colors: [] },
    { name: "Lavender Dream", colors: ["#E6E6FA", "#DDA0DD", "#9370DB"] },
    { name: "Mint Fresh", colors: ["#F0FFF0", "#98FB98", "#00FA9A"] },
    { name: "Baby Blue Sky", colors: ["#E0F6FF", "#87CEEB", "#4169E1"] },
    { name: "Peachy Soft", colors: ["#FFE5CC", "#FFCC99", "#FF9966"] },
    { name: "Rose Quartz", colors: ["#FFE4E6", "#FFC0CB", "#FF69B4"] },
    { name: "Sage Green", colors: ["#F0F8E8", "#C8E6C9", "#81C784"] },
];

const cameraMovements = [
    "Precision dolly-in from 2.5m to 1.5m over 5 seconds",
    "Slow 180-degree pan from left to right",
    "Jib shot moving up and over the subject",
    "Handheld tracking shot following a character running",
    "Static tripod shot with no movement",
    "Fast zoom-out from a character's eyes to a wide shot"
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ClaySection = ({ icon, title, children }) => (
    <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-3 px-2">{icon} {title}</h3>
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.08)] border border-purple-100/50">
            {children}
        </div>
    </div>
);

const ClayButton = ({ onClick, children, variant = "primary", size = "default", className = "", ...props }) => {
    const baseClasses = "font-medium transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50";
    
    const variants = {
        primary: "bg-gradient-to-br from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-purple-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_6px_12px_rgba(147,112,219,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_8px_16px_rgba(147,112,219,0.4)] focus:ring-purple-300",
        secondary: "bg-gradient-to-br from-mint-200 to-mint-300 hover:from-mint-300 hover:to-mint-400 text-mint-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_6px_12px_rgba(152,251,152,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_8px_16px_rgba(152,251,152,0.4)] focus:ring-mint-300",
        danger: "bg-gradient-to-br from-rose-300 to-rose-400 hover:from-rose-400 hover:to-rose-500 text-rose-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_6px_12px_rgba(251,113,133,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_8px_16px_rgba(251,113,133,0.4)] focus:ring-rose-300"
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

const ClayInput = ({ value, onChange, placeholder, className = "", ...props }) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 shadow-[inset_0_3px_6px_rgba(0,0,0,0.07)] border border-blue-100/50 focus:shadow-[inset_0_3px_6px_rgba(0,0,0,0.1),0_0_0_3px_rgba(135,206,235,0.3)] focus:outline-none focus:border-blue-200 transition-all duration-300 resize-none text-slate-700 placeholder:text-slate-400 ${className}`}
        {...props}
    />
);

const ClaySelect = ({ value, onValueChange, children, placeholder }) => (
    <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-gradient-to-br from-white to-green-50 rounded-2xl p-4 h-auto shadow-[inset_0_3px_6px_rgba(0,0,0,0.07)] border border-green-100/50 focus:shadow-[inset_0_3px_6px_rgba(0,0,0,0.1),0_0_0_3px_rgba(152,251,152,0.3)] focus:outline-none focus:border-green-200 transition-all duration-300">
            <SelectValue placeholder={placeholder} className="text-slate-700" />
        </SelectTrigger>
        <SelectContent className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-green-100/50">
            {children}
        </SelectContent>
    </Select>
);

export default function Builder() {
    const initialState = {
        scene_description: '',
        shot_composition: '',
        camera_movement: '',
        visual_style: '',
        custom_visual_style: '',
        lighting: '',
        custom_lighting: '',
        environment: '',
        custom_environment: '',
        audio_cue: '',
        custom_audio_cue: '',
        dialogue: '',
        color_palette: JSON.stringify(colorPalettes[0]) // Default to "None"
    };

    const [formState, setFormState] = useState(initialState);

    const handleChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleClear = () => {
        setFormState(initialState);
    };

    const randomizeAll = () => {
        setFormState({
            scene_description: getRandomItem(scenes),
            shot_composition: getRandomItem(compositions),
            camera_movement: getRandomItem(cameraMovements),
            visual_style: getRandomItem(visualStyles),
            custom_visual_style: '',
            lighting: getRandomItem(lightingStyles),
            custom_lighting: '',
            environment: getRandomItem(backgrounds),
            custom_environment: '',
            audio_cue: getRandomItem(audioCues),
            custom_audio_cue: '',
            dialogue: getRandomItem(dialogues),
            color_palette: JSON.stringify(getRandomItem(colorPalettes.slice(1))) // Randomize from actual palettes, not "None"
        });
    };
    
    const randomizeScene = () => {
        handleChange('scene_description', getRandomItem(scenes));
    };

    const randomizeBackground = () => {
        handleChange('environment', getRandomItem(backgrounds));
    };

    const randomizeDialogue = () => {
        handleChange('dialogue', getRandomItem(dialogues));
    };

    const generatePromptJson = () => {
        const selectedPalette = JSON.parse(formState.color_palette);
        const promptData = {
            scene_description: formState.scene_description || undefined,
            shot_composition: formState.shot_composition || undefined,
            camera_movement: formState.camera_movement || undefined,
            visual_style: formState.custom_visual_style || formState.visual_style || undefined,
            lighting: formState.custom_lighting || formState.lighting || undefined,
            environment: formState.custom_environment || formState.environment || undefined,
            audio_cue: formState.custom_audio_cue || formState.audio_cue || undefined,
            dialogue: formState.dialogue || undefined,
        };
        
        if (selectedPalette.name !== "None" && selectedPalette.colors.length > 0) {
            promptData.color_palette = {
                name: selectedPalette.name,
                colors: selectedPalette.colors
            };
        }

        // Remove undefined keys for a cleaner output
        Object.keys(promptData).forEach(key => {
            if (promptData[key] === undefined) {
                delete promptData[key];
            }
        });

        return promptData;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-mint-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Panel */}
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.1)] border border-purple-100/50">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-3">
                                    🚀 Need Veo 3 Prompt Inspiration?
                                </h2>
                                <ClayButton onClick={randomizeAll} size="lg" className="w-full mb-4">
                                    🎲 Complete Random Veo 3 Prompt
                                </ClayButton>
                                <p className="text-slate-600 mb-4">Or randomize individual Veo 3 elements:</p>
                                <div className="flex gap-3 justify-center flex-wrap">
                                    <ClayButton onClick={randomizeScene} size="sm" variant="secondary">🎬 Scene</ClayButton>
                                    <ClayButton onClick={randomizeBackground} size="sm" variant="secondary">🖼️ Background</ClayButton>
                                    <ClayButton onClick={randomizeDialogue} size="sm" variant="secondary">💬 Dialogue</ClayButton>
                                </div>
                            </div>
                        </div>

                        {/* Scene Description */}
                        <ClaySection icon="🎬" title="Scene Description">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-3">Describe Your Scene</label>
                                <ClayInput 
                                    value={formState.scene_description}
                                    onChange={(e) => handleChange('scene_description', e.target.value)}
                                    placeholder="Enter scene description..."
                                    rows={3}
                                />
                            </div>
                        </ClaySection>

                        {/* Shot Composition */}
                        <ClaySection icon="📸" title="Shot Composition">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-3">Composition</label>
                                <ClaySelect 
                                    value={formState.shot_composition}
                                    onValueChange={(v) => handleChange('shot_composition', v)}
                                    placeholder="Select composition..."
                                >
                                    {compositions.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </ClaySelect>
                            </div>
                        </ClaySection>

                        {/* Camera Movement */}
                        <ClaySection icon="🎥" title="Camera Movement">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-3">Camera Motion</label>
                                <ClayInput 
                                    value={formState.camera_movement}
                                    onChange={(e) => handleChange('camera_movement', e.target.value)}
                                    placeholder="Enter camera movement..."
                                    rows={2}
                                />
                            </div>
                        </ClaySection>

                        {/* Visual Style */}
                        <ClaySection icon="🎨" title="Visual Style">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-3">Style</label>
                                    <ClaySelect 
                                        value={formState.visual_style}
                                        onValueChange={(v) => handleChange('visual_style', v)}
                                        placeholder="Select visual style..."
                                    >
                                        {visualStyles.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </ClaySelect>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-3">Or enter your own visual style...</label>
                                    <ClayInput 
                                        value={formState.custom_visual_style}
                                        onChange={(e) => handleChange('custom_visual_style', e.target.value)}
                                        placeholder="Custom visual style..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </ClaySection>

                        {/* Lighting */}
                        <ClaySection icon="💡" title="Lighting">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-3">Lighting Style</label>
                                    <ClaySelect 
                                        value={formState.lighting}
                                        onValueChange={(v) => handleChange('lighting', v)}
                                        placeholder="Select lighting..."
                                    >
                                        {lightingStyles.map(l => (
                                            <SelectItem key={l} value={l}>{l}</SelectItem>
                                        ))}
                                    </ClaySelect>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-3">Or enter your own lighting style...</label>
                                    <ClayInput 
                                        value={formState.custom_lighting}
                                        onChange={(e) => handleChange('custom_lighting', e.target.value)}
                                        placeholder="Custom lighting..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </ClaySection>

                        {/* Environment */}
                        <ClaySection icon="🖼️" title="Environment">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-3">Background Setting</label>
                                    <ClaySelect 
                                        value={formState.environment}
                                        onValueChange={(v) => handleChange('environment', v)}
                                        placeholder="Select environment..."
                                    >
                                        {backgrounds.map(b => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </ClaySelect>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-3">Or enter your own background setting...</label>
                                    <ClayInput 
                                        value={formState.custom_environment}
                                        onChange={(e) => handleChange('custom_environment', e.target.value)}
                                        placeholder="Custom environment..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </ClaySection>

                        {/* Audio */}
                        <ClaySection icon="🔊" title="Audio">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-3">Audio Description</label>
                                    <ClaySelect 
                                        value={formState.audio_cue}
                                        onValueChange={(v) => handleChange('audio_cue', v)}
                                        placeholder="Select audio..."
                                    >
                                        {audioCues.map(a => (
                                            <SelectItem key={a} value={a}>{a}</SelectItem>
                                        ))}
                                    </ClaySelect>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-3">Or enter your own audio description...</label>
                                    <ClayInput 
                                        value={formState.custom_audio_cue}
                                        onChange={(e) => handleChange('custom_audio_cue', e.target.value)}
                                        placeholder="Custom audio..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </ClaySection>

                        {/* Dialogue */}
                        <ClaySection icon="💬" title="Dialogue">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-3">Spoken Text (optional)</label>
                                <ClayInput 
                                    value={formState.dialogue}
                                    onChange={(e) => handleChange('dialogue', e.target.value)}
                                    placeholder="Enter dialogue..."
                                    rows={3}
                                />
                            </div>
                        </ClaySection>

                        {/* Color Palette */}
                        <ClaySection icon="🌈" title="Color Palette">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-3">Choose Color Scheme (Optional)</label>
                                <ClaySelect 
                                    value={formState.color_palette}
                                    onValueChange={(v) => handleChange('color_palette', v)}
                                    placeholder="Select color palette..."
                                >
                                    {colorPalettes.map(p => (
                                        <SelectItem key={p.name} value={JSON.stringify(p)}>
                                            {p.name} {p.colors.length > 0 ? `(${p.colors.join(', ')})` : ''}
                                        </SelectItem>
                                    ))}
                                </ClaySelect>
                            </div>
                        </ClaySection>
                    </div>

                    {/* Right Panel */}
                    <div className="lg:sticky lg:top-8 lg:h-fit">
                        <PromptPreview promptJson={generatePromptJson()} onClear={handleClear} />
                    </div>
                </div>
            </div>
        </div>
    );
}
