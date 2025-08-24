import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Crown } from "lucide-react";

const aiModels = [
  {
    provider: "OpenRouter (Recommended)",
    groups: [
      {
        label: "Premium Models",
        models: [
          { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Flagship model for complex websites and superior reasoning.", tier: "premium", recommended: true },
          { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", description: "Slightly older, but still a top-tier powerful model.", tier: "premium" },
          { id: "openai/gpt-4o", name: "GPT-4o", description: "Latest model from OpenAI, fast and intelligent.", tier: "premium" },
          { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Google's most capable model with a large context window.", tier: "premium" },
          { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B Instruct", description: "Meta's powerful open-source model.", tier: "premium" },
        ]
      },
      {
        label: "Free & Fast Models",
        models: [
          { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", description: "The fastest and most compact model for near-instant responsiveness.", tier: "standard" },
          { id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "A lightweight, fast and cost-efficient model by Google.", tier: "standard" },
          { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B Instruct", description: "Meta's highly capable small open-source model.", tier: "free" },
          { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B Instruct", description: "A popular, high-performing small model.", tier: "free" },
          { id: "google/gemma-7b-it", name: "Gemma 7B", description: "Google's open-source model, great for general tasks.", tier: "free" },
          { id: "nousresearch/nous-hermes-2-mistral-7b-dpo", name: "Nous Hermes 2", description: "A highly-rated fine-tuned model for creative content.", tier: "free" },
        ]
      }
    ]
  },
  {
    provider: "Direct API",
    groups: [
      {
        label: "Anthropic",
        models: [ { id: "direct/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Connect directly to Anthropic's API.", tier: "premium" } ]
      },
      {
        label: "Google",
        models: [ { id: "direct/gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Connect directly to Google's API.", tier: "premium" } ]
      },
      {
        label: "OpenAI",
        models: [ { id: "direct/gpt-4o", name: "GPT-4o", description: "Connect directly to OpenAI's API.", tier: "premium" } ]
      }
    ]
  }
];

const getTierIcon = (tier) => {
  switch (tier) {
    case "premium":
      return <Crown className="w-3 h-3 text-purple-600" />;
    case "standard":
      return <Star className="w-3 h-3 text-blue-600" />;
    case "free":
      return <Zap className="w-3 h-3 text-green-600" />;
    default:
      return <Zap className="w-3 h-3 text-gray-600" />;
  }
};

const getTierColor = (tier) => {
  switch (tier) {
    case "premium":
      return "bg-purple-100 text-purple-800";
    case "standard":
      return "bg-blue-100 text-blue-800";
    case "free":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AIModelSelector({ selectedModel, setSelectedModel }) {
  const getSelectedModelInfo = () => {
    for (const provider of aiModels) {
      for (const group of provider.groups) {
        const model = group.models.find(m => m.id === selectedModel);
        if (model) return { ...model, provider: provider.provider };
      }
    }
    return null;
  };

  const selectedModelInfo = getSelectedModelInfo();

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold text-gray-900">AI Model Selection</Label>
        <p className="text-sm text-gray-600 mt-1">Choose the AI that will generate your website. OpenRouter is recommended.</p>
      </div>

      <div className="space-y-4">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="h-12 border-gray-200 focus:border-indigo-500">
            <SelectValue placeholder="Select AI model">
              {selectedModelInfo && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getTierIcon(selectedModelInfo.tier)}
                    <span className="font-medium">{selectedModelInfo.provider}</span>
                  </div>
                  <span className="text-gray-600">-</span>
                  <span>{selectedModelInfo.name}</span>
                  {selectedModelInfo.recommended && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs ml-1">
                      Recommended
                    </Badge>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {aiModels.map((provider) => (
              <SelectGroup key={provider.provider}>
                <SelectLabel className="font-semibold text-gray-900">
                  {provider.provider}
                </SelectLabel>
                {provider.groups.map(group => (
                  <React.Fragment key={group.label}>
                    <SelectLabel className="pl-5 text-xs font-medium text-gray-500">{group.label}</SelectLabel>
                    {group.models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            {model.recommended && (
                              <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className={`ml-2 text-xs ${getTierColor(model.tier)}`}>
                            {getTierIcon(model.tier)}
                            <span className="ml-1 capitalize">{model.tier}</span>
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {selectedModelInfo && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(selectedModelInfo.tier)}`}>
                {getTierIcon(selectedModelInfo.tier)}
                <span className="ml-1 capitalize">{selectedModelInfo.tier}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {selectedModelInfo.provider} - {selectedModelInfo.name}
              </span>
            </div>
            <p className="text-sm text-gray-600">{selectedModelInfo.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}