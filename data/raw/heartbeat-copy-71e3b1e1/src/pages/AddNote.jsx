
import React, { useState, useEffect } from "react";
import { Contact, Interaction } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Save, X, Smile, Camera, Mic, Tag, MapPin, Clock, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AddNote() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState("");
  const [interactionType, setInteractionType] = useState("note");
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState("neutral");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await Contact.list("name");
      setContacts(data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!selectedContact || !content.trim()) {
      // Add a visual cue for missing fields, e.g., toast notification or form validation messages
      console.warn("Missing contact or content");
      return;
    }

    setSaving(true);
    try {
      const interactionData = {
        contact_id: selectedContact,
        type: interactionType,
        content: content.trim(),
        sentiment,
        location: location.trim() || undefined,
        duration: duration ? parseFloat(duration) : undefined,
        tags: tags.length > 0 ? tags : undefined,
        mood: mood || undefined,
        // photo_urls and voice_note_url would be handled by file upload integrations in a real app
      };

      await Interaction.create(interactionData);
      
      const contactToUpdate = contacts.find(c => c.id === selectedContact);
      if (contactToUpdate) {
        await Contact.update(selectedContact, {
          last_contact: new Date().toISOString().split('T')[0]
        });
      }

      navigate(createPageUrl("Timeline"));
    } catch (error) {
      console.error("Error saving interaction:", error);
      // Add user-facing error message
    } finally {
      setSaving(false);
    }
  };

  const getMoodEmoji = (moodValue) => {
    switch (moodValue) {
      case "excited": return "🤩";
      case "happy": return "😊";
      case "content": return "😌";
      case "thoughtful": return "🤔";
      case "concerned": return "😟";
      case "sad": return "😢";
      default: return "😐";
    }
  };

  const getInteractionEmoji = (type) => {
    switch (type) {
      case "call": return "📞";
      case "text": return "💬";
      case "email": return "📧";
      case "meeting": return "🤝";
      case "coffee": return "☕";
      case "birthday": return "🎂";
      case "event": return "🎉";
      default: return "📝";
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card className="tactile-card rounded-3xl overflow-hidden shadow-xl">
        <CardHeader className="bg-gradient-to-br from-[var(--teal-light)]/30 to-[var(--coral-light)]/20 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 vivid-accent-bg rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-3xl text-white">{getInteractionEmoji(interactionType)}</span>
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-[var(--text-primary)]">
                  Capture a Moment
                </CardTitle>
                <p className="text-[var(--text-secondary)] mt-1">Record your meaningful interactions</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Home"))}
              className="rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Contact Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--text-primary)]">Who did you connect with?</Label>
            <Select value={selectedContact} onValueChange={setSelectedContact}>
              <SelectTrigger className="rounded-2xl h-12 border-gray-200 text-base focus:border-[var(--vivid-teal)]">
                <SelectValue placeholder="Choose a person..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 vivid-accent-bg rounded-xl flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                         {contact.photo_url ? (
                          <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover" />
                        ) : (
                          contact.name?.charAt(0)?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        {contact.company && (
                          <div className="text-xs text-gray-500">{contact.company}</div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interaction Type and Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-[var(--text-primary)]">What kind of moment?</Label>
              <Select value={interactionType} onValueChange={setInteractionType}>
                <SelectTrigger className="rounded-2xl h-11 border-gray-200 focus:border-[var(--vivid-teal)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">📝 Personal Note</SelectItem>
                  <SelectItem value="call">📞 Phone Call</SelectItem>
                  <SelectItem value="text">💬 Text/Message</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="meeting">🤝 Meeting</SelectItem>
                  <SelectItem value="coffee">☕ Coffee/Meal</SelectItem>
                  <SelectItem value="birthday">🎂 Birthday</SelectItem>
                  <SelectItem value="event">🎉 Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-[var(--text-primary)]">How did it feel?</Label>
              <Select value={sentiment} onValueChange={setSentiment}>
                <SelectTrigger className="rounded-2xl h-11 border-gray-200 focus:border-[var(--vivid-teal)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">😊 Positive & Uplifting</SelectItem>
                  <SelectItem value="neutral">😐 Neutral & Informative</SelectItem>
                  <SelectItem value="negative">😔 Challenging or Difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mood Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--text-primary)]">More specifically, how did you feel?</Label>
            <div className="flex flex-wrap gap-2">
              {["excited", "happy", "content", "thoughtful", "concerned", "sad"].map((moodOption) => (
                <button
                  key={moodOption}
                  type="button"
                  onClick={() => setMood(mood === moodOption ? "" : moodOption)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm ${
                    mood === moodOption 
                      ? "vivid-accent-bg text-white border-[var(--teal-dark)] shadow-sm" 
                      : "bg-white border-gray-200 hover:border-gray-300 text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="text-lg">{getMoodEmoji(moodOption)}</span>
                  <span className="font-medium capitalize">{moodOption}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--text-primary)]">Tell the story</Label>
            <Textarea
              placeholder="What happened? How did it go? What did you learn about them? Any follow-ups needed?&#10;&#10;Write freely - this is your space to remember the moment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-36 rounded-2xl border-gray-200 resize-none focus:border-[var(--vivid-teal)] text-base p-4"
              rows={7}
            />
          </div>
          
          {/* Attachments (Placeholder UI) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--text-primary)]">Add attachments (optional)</Label>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 flex-1">
                <ImageIcon className="w-4 h-4 mr-2" /> Add Photos
              </Button>
              <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 flex-1">
                <Mic className="w-4 h-4 mr-2" /> Record Voice Note
              </Button>
            </div>
          </div>


          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Where did this happen?
              </Label>
              <Input
                placeholder="e.g., Coffee shop, office, their home"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl border-gray-200 h-11 focus:border-[var(--vivid-teal)]"
              />
            </div>

            {(interactionType === "call" || interactionType === "meeting" || interactionType === "coffee") && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  How long? (minutes)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="rounded-xl border-gray-200 h-11 focus:border-[var(--vivid-teal)]"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              Add tags to remember
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., follow-up, great idea"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                className="rounded-xl border-gray-200 h-11 focus:border-[var(--vivid-teal)]"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                className="rounded-xl px-6 h-11 border-gray-200"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="vivid-accent-border vivid-accent-text bg-[var(--teal-light)]/20 rounded-full px-3 py-1.5 text-sm cursor-pointer hover:bg-[var(--teal-light)]/40"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} <X className="w-3 h-3 ml-1.5"/>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Home"))}
              className="rounded-xl px-6 py-3 text-base border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedContact || !content.trim() || saving}
              className="vivid-accent-bg hover:bg-[var(--teal-dark)] rounded-xl px-8 py-3 text-base shadow-md hover:shadow-lg transition-shadow"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2.5"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2.5" />
                  Save Moment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
