import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const themes = [
  {
    id: 'notion-clean',
    name: 'Notion Clean',
    description: 'Minimalist workspace design',
    preview: 'bg-white border-2 border-gray-200',
    previewAccent: 'bg-gray-900'
  },
  {
    id: 'stripe-modern',
    name: 'Stripe Modern',
    description: 'Professional gradient elegance',
    preview: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    previewAccent: 'bg-gradient-to-r from-indigo-500 to-purple-600'
  },
  {
    id: 'spotify-dark',
    name: 'Spotify Dark',
    description: 'Bold dark with green accents',
    preview: 'bg-gray-900',
    previewAccent: 'bg-green-500'
  },
  {
    id: 'airbnb-warm',
    name: 'Airbnb Warm',
    description: 'Cozy coral and cream tones',
    preview: 'bg-gradient-to-br from-rose-50 to-orange-50',
    previewAccent: 'bg-rose-500'
  },
  {
    id: 'figma-creative',
    name: 'Figma Creative',
    description: 'Vibrant creative workspace',
    preview: 'bg-gradient-to-br from-violet-100 via-pink-50 to-orange-100',
    previewAccent: 'bg-gradient-to-r from-violet-500 to-pink-500'
  }
];

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-current hover:bg-white/20 rounded-full"
        >
          <Palette className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Choose Your Style</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                setIsOpen(false);
              }}
              className={`relative w-full p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                currentTheme === theme.id
                  ? 'border-blue-500 shadow-xl'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-12 rounded-xl ${theme.preview} border border-gray-200 relative overflow-hidden`}>
                  <div className={`absolute bottom-0 left-0 w-full h-2 ${theme.previewAccent}`}></div>
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-900">{theme.name}</h3>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </div>
                {currentTheme === theme.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}