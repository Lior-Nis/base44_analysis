
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities"; // Assuming this path is correct
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Zap, Crown, Star, Save, KeyRound, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";

const aiModels = [
  {
    provider: "OpenRouter (Recommended)",
    groups: [
      {
        label: "Premium Models",
        models: [
          { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", tier: "premium", recommended: true },
          { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", tier: "premium" },
          { id: "openai/gpt-4o", name: "GPT-4o", tier: "premium" },
          { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", tier: "premium" },
          { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B Instruct", tier: "premium" },
        ]
      },
      {
        label: "Free & Fast Models",
        models: [
          { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", tier: "standard" },
          { id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash", tier: "standard" },
          { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B Instruct", tier: "free" },
          { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B Instruct", tier: "free" },
          { id: "google/gemma-7b-it", name: "Gemma 7B", tier: "free" },
          { id: "nousresearch/nous-hermes-2-mistral-7b-dpo", name: "Nous Hermes 2", tier: "free" },
        ]
      }
    ]
  },
  {
    provider: "Direct API",
    groups: [
      {
        label: "Anthropic",
        models: [ { id: "direct/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", tier: "premium" } ]
      },
      {
        label: "Google",
        models: [ { id: "direct/gemini-1.5-pro", name: "Gemini 1.5 Pro", tier: "premium" } ]
      },
      {
        label: "OpenAI",
        models: [ { id: "direct/gpt-4o", name: "GPT-4o", tier: "premium" } ]
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

export default function Settings() {
  const [user, setUser] = useState(null);
  const [defaultModel, setDefaultModel] = useState("anthropic/claude-3.5-sonnet");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [seoOptimization, setSeoOptimization] = useState(true);
  const [responsiveDesign, setResponsiveDesign] = useState(true);
  const [includeAnimations, setIncludeAnimations] = useState(true);
  const [apiKeys, setApiKeys] = useState({
    openrouter: "",
    anthropic: "",
    google: "",
    openai: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load saved settings from user data
      if (currentUser.settings) {
        setDefaultModel(currentUser.settings.defaultModel || "anthropic/claude-3.5-sonnet");
        setAutoGenerate(currentUser.settings.autoGenerate !== false); // Default to true if not explicitly false
        setSeoOptimization(currentUser.settings.seoOptimization !== false); // Default to true
        setResponsiveDesign(currentUser.settings.responsiveDesign !== false); // Default to true
        setIncludeAnimations(currentUser.settings.includeAnimations !== false); // Default to true
      }
      
      // Load API keys from user data
      if (currentUser.apiKeys) {
        setApiKeys(currentUser.apiKeys);
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
    setLoading(false);
  };

  const getSelectedModelInfo = () => {
    for (const provider of aiModels) {
      for (const group of provider.groups) {
        const model = group.models.find(m => m.id === defaultModel);
        if (model) return { ...model, provider: provider.provider };
      }
    }
    return null;
  };

  const selectedModelInfo = getSelectedModelInfo();

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const settingsData = {
        settings: {
          defaultModel,
          autoGenerate,
          seoOptimization,
          responsiveDesign,
          includeAnimations,
        },
        apiKeys: apiKeys
      };

      await User.updateMyUserData(settingsData);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApiKeyChange = (provider, key) => {
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            Settings
          </h1>
          <p className="text-gray-600">Customize your AI website generation preferences</p>
        </div>

        <div className="space-y-8">
          {/* API Key Management */}
          <Card className="glass-effect shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                API Key Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Enter your API keys for the AI providers. We recommend using OpenRouter to access all models with a single key. Your keys are stored securely and never shared.
              </p>
              <div className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="openrouter-key" className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" /> OpenRouter API Key (Recommended)
                  </Label>
                  <Input
                    id="openrouter-key"
                    type="password"
                    placeholder="sk-or-..."
                    value={apiKeys.openrouter}
                    onChange={(e) => handleApiKeyChange('openrouter', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic (Claude) - Direct</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                    value={apiKeys.anthropic}
                    onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-key">Google (Gemini) - Direct</Label>
                  <Input
                    id="google-key"
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKeys.google}
                    onChange={(e) => handleApiKeyChange('google', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI (GPT) - Direct</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={apiKeys.openai}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Settings */}
          <Card className="glass-effect shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold text-gray-900">Default AI Model</Label>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    Choose the AI model that will be used by default for generating websites
                  </p>
                </div>

                <Select value={defaultModel} onValueChange={setDefaultModel}>
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
                        {selectedModelInfo.provider} {selectedModelInfo.name}
                      </span>
                    </div>
                    {/* Description is now optional as new models may not have it */}
                    {selectedModelInfo.description && (
                      <p className="text-sm text-gray-600">{selectedModelInfo.description}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generation Settings */}
          <Card className="glass-effect shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Generation Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900">Auto-generate on form submit</Label>
                  <p className="text-sm text-gray-600">Automatically start generation when business form is completed</p>
                </div>
                <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900">SEO Optimization</Label>
                  <p className="text-sm text-gray-600">Include meta tags, structured data, and SEO best practices</p>
                </div>
                <Switch checked={seoOptimization} onCheckedChange={setSeoOptimization} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900">Responsive Design</Label>
                  <p className="text-sm text-gray-600">Ensure websites work perfectly on all devices</p>
                </div>
                <Switch checked={responsiveDesign} onCheckedChange={setResponsiveDesign} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900">Include Animations</Label>
                  <p className="text-sm text-gray-600">Add smooth transitions and modern animations</p>
                </div>
                <Switch checked={includeAnimations} onCheckedChange={setIncludeAnimations} />
              </div>
            </CardContent>
          </Card>

          {/* Performance & Quality */}
          <Card className="glass-effect shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Performance & Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Fast Generation</h3>
                  <p className="text-sm text-gray-600">Websites generated in 30-60 seconds</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Production Ready</h3>
                  <p className="text-sm text-gray-600">Clean, optimized code ready for deployment</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Premium Features</h3>
                  <p className="text-sm text-gray-600">Advanced AI models and customization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 text-base font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
                  Settings Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
