
import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Message } from "@/api/entities";
import { motion } from "framer-motion";

import IdeaInput from "../components/generator/IdeaInput";
import PlatformCard from "../components/generator/PlatformCard";
import TranslationPanel from "../components/generator/TranslationPanel";

const platforms = ["linkedin", "facebook", "twitter", "reddit", "discord", "whatsapp"];

export default function Generator() {
  const [generatedContent, setGeneratedContent] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const generatePlatformContent = async ({ idea, tone, audience }) => {
    setIsGenerating(true);
    try {
      const prompt = `
        Generate platform-specific social media posts based on this idea: "${idea}"
        
        Tone: ${tone}
        Target Audience: ${audience}
        
        Create unique, optimized versions for each platform:
        
        LinkedIn: Professional, thoughtful, industry-focused. Use professional language, include relevant hashtags, and structure for business networking. Length: 1-3 paragraphs.
        
        Facebook: Personal, engaging, conversation-starting. More casual than LinkedIn but still polished. Include emojis where appropriate. Length: 1-2 paragraphs.
        
        Twitter/X: Short, punchy, attention-grabbing. Maximum 280 characters. Use relevant hashtags and make every word count. Direct and impactful.
        
        Reddit: Casual, authentic, discussion-oriented. Avoid corporate speak. Be genuine and encourage community engagement. Include context that would resonate with Reddit users.
        
        Discord: Friendly, conversational, community-focused. Use casual language that fits chat environments. Can include emojis and be more relaxed.
        
        WhatsApp: Direct, concise, personal or team-focused. Very casual and to-the-point. Like a message you'd send to close colleagues or friends.
        
        Make each version unique and truly optimized for its platform's culture and limitations.
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            linkedin_version: { type: "string" },
            facebook_version: { type: "string" },
            twitter_version: { type: "string" },
            reddit_version: { type: "string" },
            discord_version: { type: "string" },
            whatsapp_version: { type: "string" },
            title: { type: "string" }
          }
        }
      });

      const messageData = {
        original_idea: idea,
        tone,
        target_audience: audience,
        ...result,
        original_language: "en"
      };

      const savedMessage = await Message.create(messageData);
      setCurrentData({ ...messageData, id: savedMessage.id });
      setGeneratedContent(result);
    } catch (error) {
      console.error("Error generating content:", error);
    }
    setIsGenerating(false);
  };

  const regeneratePlatform = async (platform) => {
    if (!currentData) return;
    
    setIsRegenerating(true);
    try {
      const platformNames = {
        linkedin: "LinkedIn",
        facebook: "Facebook", 
        twitter: "Twitter/X",
        reddit: "Reddit",
        discord: "Discord",
        whatsapp: "WhatsApp"
      };

      const platformGuidelines = {
        linkedin: "Professional, thoughtful, industry-focused. Use professional language, include relevant hashtags, and structure for business networking. Length: 1-3 paragraphs.",
        facebook: "Personal, engaging, conversation-starting. More casual than LinkedIn but still polished. Include emojis where appropriate. Length: 1-2 paragraphs.",
        twitter: "Short, punchy, attention-grabbing. Maximum 280 characters. Use relevant hashtags and make every word count. Direct and impactful.",
        reddit: "Casual, authentic, discussion-oriented. Avoid corporate speak. Be genuine and encourage community engagement. Include context that would resonate with Reddit users.",
        discord: "Friendly, conversational, community-focused. Use casual language that fits chat environments. Can include emojis and be more relaxed.",
        whatsapp: "Direct, concise, personal or team-focused. Very casual and to-the-point. Like a message you'd send to close colleagues or friends."
      };

      const prompt = `
        Regenerate a fresh ${platformNames[platform]} post based on this idea: "${currentData.original_idea}"
        
        Tone: ${currentData.tone}
        Target Audience: ${currentData.target_audience}
        
        Platform Guidelines for ${platformNames[platform]}: ${platformGuidelines[platform]}
        
        Create a completely new version that's different from the previous one but still optimized for ${platformNames[platform]}.
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            content: { type: "string" }
          }
        }
      });

      const updatedContent = {
        ...generatedContent,
        [`${platform}_version`]: result.content
      };

      setGeneratedContent(updatedContent);
      
      // Update the saved message
      await Message.update(currentData.id, {
        [`${platform}_version`]: result.content
      });

    } catch (error) {
      console.error("Error regenerating content:", error);
    }
    setIsRegenerating(false);
  };

  const translateAllPlatforms = async (fromLang, toLang) => {
    setIsTranslating(true);
    try {
      const languageNames = {
        en: "English", he: "Hebrew", es: "Spanish", fr: "French", 
        de: "German", it: "Italian", pt: "Portuguese", ru: "Russian",
        ja: "Japanese", ko: "Korean", zh: "Chinese", ar: "Arabic"
      };

      const contentToTranslate = {};
      platforms.forEach(platform => {
        if (generatedContent[`${platform}_version`]) {
          contentToTranslate[platform] = generatedContent[`${platform}_version`];
        }
      });

      const prompt = `
        Translate the following social media posts from ${languageNames[fromLang]} to ${languageNames[toLang]}.
        
        Maintain the tone, style, and platform-specific characteristics of each post.
        Keep hashtags relevant and appropriate for the target language and culture.
        Preserve emojis and formatting.
        
        Content to translate:
        ${Object.entries(contentToTranslate).map(([platform, content]) => 
          `${platform.toUpperCase()}: ${content}`
        ).join('\n\n')}
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            linkedin: { type: "string" },
            facebook: { type: "string" },
            twitter: { type: "string" },
            reddit: { type: "string" },
            discord: { type: "string" },
            whatsapp: { type: "string" }
          }
        }
      });

      const translatedContent = {};
      platforms.forEach(platform => {
        if (result[platform]) {
          translatedContent[`${platform}_version`] = result[platform];
        }
      });

      setGeneratedContent(prev => ({ ...prev, ...translatedContent }));
      
      // Update the saved message
      if (currentData?.id) {
        await Message.update(currentData.id, {
          ...translatedContent,
          original_language: toLang
        });
      }

    } catch (error) {
      console.error("Error translating content:", error);
    }
    setIsTranslating(false);
  };

  const updateContent = (platform, newContent) => {
    const updatedContent = {
      ...generatedContent,
      [`${platform}_version`]: newContent
    };
    setGeneratedContent(updatedContent);
    
    // Update the saved message
    if (currentData?.id) {
      Message.update(currentData.id, {
        [`${platform}_version`]: newContent
      });
    }
  };

  const handlePlatformTranslate = (platform) => {
    setSelectedPlatform(platform);
  };

  const hasContent = Object.keys(generatedContent).length > 0;

  return (
    <div className="min-h-screen p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e4a89] mb-4 tracking-tight">
            AI Message Generator
          </h1>
          <p className="text-lg text-[#2e5a9a]/90 max-w-3xl mx-auto">
            Turn a single idea into perfectly crafted posts for all your platforms. Tweak the tone, target your audience, and let AI handle the rest.
          </p>
        </motion.div>

        {/* Input Section */}
        <div className="mb-16">
          <IdeaInput 
            onGenerate={generatePlatformContent}
            isGenerating={isGenerating}
          />
        </div>

        {/* Results Section */}
        {hasContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-12"
          >
            {/* Translation Panel */}
            <TranslationPanel
              selectedPlatform={selectedPlatform}
              originalLanguage={currentData?.original_language || "en"}
              onTranslateAll={translateAllPlatforms}
              isTranslating={isTranslating}
            />

            {/* Platform Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {platforms.map((platform) => (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  content={generatedContent[`${platform}_version`]}
                  onContentChange={updateContent}
                  onRegenerate={regeneratePlatform}
                  onTranslate={() => handlePlatformTranslate(platform)}
                  isRegenerating={isRegenerating}
                  isTranslating={isTranslating}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
