
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Languages, ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" }
];

export default function TranslationPanel({ 
  selectedPlatform, 
  originalLanguage = "en", 
  onTranslateAll,
  isTranslating 
}) {
  const [targetLanguage, setTargetLanguage] = useState("");

  const handleTranslate = () => {
    if (targetLanguage) {
      onTranslateAll(originalLanguage, targetLanguage);
    }
  };

  const getLanguageByCode = (code) => languages.find(lang => lang.code === code);
  const originalLang = getLanguageByCode(originalLanguage);
  const targetLang = getLanguageByCode(targetLanguage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-white to-[#c0d4ea]/40 border border-[#c0d4ea]/50 overflow-hidden shadow-xl">
        <div className="h-1 bg-gradient-to-r from-[#2e5a9a] via-[#1e4a89] to-[#6b95c9]" />
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-[#1e4a89]">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2e5a9a] to-[#1e4a89] rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            Translation Hub
          </CardTitle>
          <p className="text-[#2e5a9a]/90">Translate all your messages to reach a global audience</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1e4a89] mb-3">From Language</p>
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-[#c0d4ea]/60 shadow-sm">
                <span className="text-2xl">{originalLang?.flag}</span>
                <span className="font-semibold text-[#1e4a89]">{originalLang?.name}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#2e5a9a] to-[#1e4a89] rounded-full shadow-lg">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1e4a89] mb-3">To Language</p>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="h-16 bg-white/80 backdrop-blur-sm border-[#c0d4ea]/60 rounded-xl text-base">
                  <SelectValue placeholder="Choose target language..." />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {languages
                    .filter(lang => lang.code !== originalLanguage)
                    .map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPlatform && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-[#c0d4ea]/60">
              <Badge className="bg-[#c0d4ea]/50 text-[#1e4a89] font-medium border-[#c0d4ea]">
                Selected Platform: {selectedPlatform}
              </Badge>
              <p className="text-sm text-[#2e5a9a]/90 mt-2">
                Translation will be applied to the selected platform content
              </p>
            </div>
          )}

          <Button
            onClick={handleTranslate}
            disabled={!targetLanguage || isTranslating}
            className="w-full h-14 bg-gradient-to-r from-[#2e5a9a] via-[#1e4a89] to-[#1e4a89] hover:from-[#1e4a89] hover:via-[#2e5a9a] text-white font-bold text-lg shadow-xl rounded-xl"
          >
            {isTranslating ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Translating all platforms...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5" />
                Translate All Platforms
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
