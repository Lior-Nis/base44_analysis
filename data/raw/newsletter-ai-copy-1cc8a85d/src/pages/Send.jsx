
import React, { useState, useEffect } from "react";
import { Newsletter, SentEmail, Subscriber, User, UserProfile } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { sendNewsletter } from "@/api/functions";
import { generateEmailHTML } from "@/components/utils/emailRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, Mail, Users, CheckCircle, AlertCircle, Wand2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { MultiSelect } from "@/components/ui/multi-select";

export default function SendPage() {
  const [newsletters, setNewsletters] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
    
    const urlParams = new URLSearchParams(window.location.search);
    const newsletterId = urlParams.get('newsletter');
    if (newsletterId) {
      loadSpecificNewsletter(newsletterId);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Only fetch newsletters created by the current user
      const newsData = await Newsletter.filter({ created_by: user.email }, '-created_date');
      setNewsletters(newsData);
      
      const subData = await Subscriber.filter({ created_by: user.email });
      setSubscribers(subData.map(s => ({ 
        label: s.name ? `${s.name} <${s.email}>` : s.email, 
        value: s.email 
      })));

      const profiles = await UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };
  
  const loadSpecificNewsletter = async (id) => {
    try {
      const user = await User.me();
      // Only load newsletters that belong to the current user
      const newsletters = await Newsletter.filter({ id, created_by: user.email });
      if (newsletters.length > 0) {
        const newsletter = newsletters[0];
        setSelectedNewsletter(newsletter);
        setSubject(newsletter.subject || "");
      }
    } catch (error) {
      console.error("Error loading specific newsletter:", error);
    }
  };

  const handleNewsletterSelect = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setSubject(newsletter.subject || "");
    setSendResult(null);
  };

  const handleGenerateContent = async (newsletter) => {
    if (!userProfile) {
        setSendResult({ success: false, message: "User profile not found. Please set up your profile first." });
        return;
    };

    setGenerating(true);
    setSendResult(null); // Clear previous send results
    try {
      const prompt = `Create a complete structured newsletter for:
      
      Title: ${newsletter.title}
      Description: ${newsletter.description}
      
      Context:
      - Field: ${userProfile.field_of_knowledge}
      - Audience: ${userProfile.target_audience}
      - Tone: ${userProfile.writing_tone}
      - Topics: ${userProfile.topics.join(', ')}
      
      Generate:
      1. A compelling email subject line
      2. An intro_text (2-3 sentences introducing the newsletter)
      3. EXACTLY 4 feature_blocks (this is mandatory), each with:
         - icon (use relevant emojis like 🚀, 💡, 📊, 🔧, 💼, 🎯, 📈, 🛠️, 🌟, 🔍, etc.)
         - title (short, punchy headline - max 6 words)
         - description (2-3 sentences explaining the feature/topic in detail)
      4. call_to_action_text (engaging button text)
      5. call_to_action_url (use placeholder like "https://example.com/learn-more")
      
      IMPORTANT: You must generate exactly 4 feature blocks. Each feature should be valuable, actionable, and engaging for the target audience.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            intro_text: { type: "string" },
            feature_blocks: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: {
                type: "object",
                properties: {
                  icon: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" }
                },
                required: ["icon", "title", "description"]
              }
            },
            call_to_action_text: { type: "string" },
            call_to_action_url: { type: "string" }
          },
          required: ["subject", "intro_text", "feature_blocks", "call_to_action_text", "call_to_action_url"]
        }
      });
      
      // Ensure we have at least 2 features as a fallback
      if (!response.feature_blocks || response.feature_blocks.length < 2) {
        response.feature_blocks = [
          {
            icon: "🚀",
            title: "Key Insight #1",
            description: "This feature provides valuable insights related to " + userProfile.field_of_knowledge + " that will help your " + userProfile.target_audience + " achieve better results."
          },
          {
            icon: "💡",
            title: "Key Insight #2", 
            description: "Another important aspect of " + userProfile.field_of_knowledge + " that offers practical value and actionable steps for your audience."
          },
          {
            icon: "📊",
            title: "Key Insight #3",
            description: "Advanced strategies and techniques that can make a significant difference in how your audience approaches their work."
          },
          {
            icon: "🎯",
            title: "Key Insight #4",
            description: "Expert tips and best practices that will empower your readers to implement these concepts effectively."
          }
        ];
      }

      const payload = {
        subject: response.subject,
        intro_text: response.intro_text,
        feature_blocks: response.feature_blocks,
        call_to_action_text: response.call_to_action_text,
        call_to_action_url: response.call_to_action_url,
        status: 'draft' // Keep as draft after generation
      };

      const updatedNewsletter = await Newsletter.update(newsletter.id, payload);
      
      setSelectedNewsletter(updatedNewsletter);
      setSubject(updatedNewsletter.subject);
      setNewsletters(prev => prev.map(n => n.id === newsletter.id ? updatedNewsletter : n));

      setSendResult({ success: true, message: "Content generated successfully!" });

    } catch (error) {
      console.error("Error generating content:", error);
      setSendResult({ success: false, message: "Failed to generate content. Please try again." });
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedNewsletter || selectedRecipients.length === 0 || !subject.trim()) {
      setSendResult({ success: false, message: "Please fill in all fields and select recipients" });
      return;
    }
    
    // Ensure content exists before attempting to send
    if (!selectedNewsletter.feature_blocks || selectedNewsletter.feature_blocks.length === 0) {
      setSendResult({ success: false, message: "Please generate newsletter content before sending." });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const recipientList = selectedRecipients.map(r => r.value);
      const emailHTML = generateEmailHTML(selectedNewsletter);
      
      const response = await sendNewsletter({
        to: recipientList,
        subject: subject,
        content: emailHTML,
        from_name: "Newsletter"
      });

      if (response.data.success) {
        await SentEmail.create({
          newsletter_id: selectedNewsletter.id,
          recipients: recipientList,
          subject: subject,
          body: emailHTML,
          resend_id: response.data.id,
          status: 'sent',
          sent_date: new Date().toISOString()
        });

        if (selectedNewsletter.status !== 'sent') {
          await Newsletter.update(selectedNewsletter.id, { status: 'sent' });
        }

        setSendResult({ success: true, message: "Newsletter sent successfully!" });
        
        setTimeout(() => {
          setSelectedNewsletter(null);
          setSelectedRecipients([]);
          setSubject("");
          setSendResult(null);
          loadData();
        }, 2000);
      } else {
        setSendResult({ success: false, message: response.data.error || "Failed to send newsletter" });
      }
    } catch (error) {
      setSendResult({ success: false, message: error.message || "Failed to send newsletter" });
    }
    setSending(false);
  };

  const getPreviewContent = () => {
    if (!selectedNewsletter) return "";
    return generateEmailHTML(selectedNewsletter);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const hasContent = selectedNewsletter && selectedNewsletter.feature_blocks && selectedNewsletter.feature_blocks.length > 0;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            Send Newsletter
          </h1>
          <p className="text-gray-600 mt-2">
            Send your beautifully designed newsletter to your subscribers
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="glass-card rounded-3xl shadow-2xl p-4">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Select Newsletter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
              {newsletters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm">No newsletters available</p>
                </div>
              ) : (
                newsletters.map((newsletter) => (
                  <div
                    key={newsletter.id}
                    onClick={() => handleNewsletterSelect(newsletter)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      selectedNewsletter?.id === newsletter.id
                        ? 'border-orange-400 bg-white/80 shadow-md'
                        : 'border-white/20 bg-white/30 hover:bg-white/50 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg mt-1">{newsletter.emoji || "📧"}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                          {newsletter.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {newsletter.description}
                        </p>
                        <Badge variant="secondary" className="bg-white/40 text-gray-700 text-xs mt-2 capitalize">
                          {newsletter.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card className="glass-card rounded-3xl shadow-2xl p-4">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">
                  Send Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipients" className="flex items-center gap-2 font-medium">
                    <Users className="w-4 h-4" />
                    Recipients ({selectedRecipients.length} selected)
                  </Label>
                  <MultiSelect
                    options={subscribers}
                    selected={selectedRecipients}
                    onChange={setSelectedRecipients}
                    placeholder="Select subscribers..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-medium">Subject Line</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-white/30 border-white/20 backdrop-blur-sm"
                  />
                </div>

                {selectedNewsletter && (
                  <div>
                    <Label className="font-medium">Email Preview</Label>
                    <div className="mt-2 bg-white rounded-lg border overflow-hidden shadow-inner">
                      {hasContent ? (
                        <iframe
                          srcDoc={getPreviewContent()}
                          title="Newsletter Preview"
                          className="w-full h-[60vh] border-0"
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
                          <h3 className="text-lg font-semibold text-gray-800">This newsletter is missing content.</h3>
                          <p className="text-gray-600 mb-6">Let our AI generate a full draft for you.</p>
                          <Button 
                            onClick={() => handleGenerateContent(selectedNewsletter)} 
                            disabled={generating}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                          >
                            {generating ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Generate Full Content
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {sendResult && (
                  <div className={`p-4 rounded-lg border flex items-center gap-3 ${
                    sendResult.success 
                      ? 'bg-green-100 border-green-200 text-green-800' 
                      : 'bg-red-100 border-red-200 text-red-800'
                  }`}>
                    {sendResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className="font-medium">{sendResult.message}</p>
                  </div>
                )}

                <Button
                  onClick={handleSend}
                  disabled={sending || !hasContent || selectedRecipients.length === 0 || !subject.trim()}
                  className="w-full bg-black text-white hover:bg-gray-800 transition-all shadow-lg text-base py-3"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to {selectedRecipients.length} Recipients
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
