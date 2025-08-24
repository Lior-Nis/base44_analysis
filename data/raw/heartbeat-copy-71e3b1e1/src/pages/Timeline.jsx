
import React, { useState, useEffect } from "react";
import { Interaction, Contact } from "@/api/entities";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { Calendar, Heart, MessageCircle, Filter, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Timeline() {
  const [interactions, setInteractions] = useState([]);
  const [contactsMap, setContactsMap] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [interactionsData, contactsData] = await Promise.all([
        Interaction.list("-created_date", 50),
        Contact.list()
      ]);

      // Create contacts map
      const contactsMapping = {};
      contactsData.forEach(contact => {
        contactsMapping[contact.id] = contact;
      });
      setContactsMap(contactsMapping);
      setInteractions(interactionsData);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInteractions = interactions.filter(interaction => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "positive") return interaction.sentiment === "positive";
    if (selectedFilter === "recent") {
      const daysDiff = differenceInDays(new Date(), new Date(interaction.created_date));
      return daysDiff <= 7; // Last 7 days
    }
    return interaction.type === selectedFilter;
  }).sort((a,b) => new Date(b.created_date) - new Date(a.created_date)); // Ensure sorted by date desc

  const groupInteractionsByDate = (interactions) => {
    const groups = {};
    interactions.forEach(interaction => {
      const date = new Date(interaction.created_date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(interaction);
    });
    return groups;
  };

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff < 7) return `${daysDiff} days ago`;
    return format(date, "MMMM d, yyyy");
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "bg-[var(--coral-light)]/30 text-[var(--coral-dark)] border-[var(--coral-light)]";
      case "negative": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded-2xl w-48"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-stone-200 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const groupedInteractions = groupInteractionsByDate(filteredInteractions);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] flex items-center gap-3">
            <Heart className="w-8 h-8 vivid-accent-text fill-[var(--vivid-teal)]" />
            Memory Timeline
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Your relationship moments, captured and remembered</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-2xl h-11 text-base border-gray-200">
              <Filter className="w-4 h-4 mr-2" />
              {selectedFilter === "all" ? "All Moments" : 
               selectedFilter === "positive" ? "Happy Moments" :
               selectedFilter === "recent" ? "This Week" :
               selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
              All Moments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("positive")}>
              😊 Happy Moments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("recent")}>
              📅 This Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("call")}>
              📞 Calls
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("meeting")}>
              🤝 Meetings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("coffee")}>
              ☕ Coffee Chats
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("note")}>
              📝 Notes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timeline */}
      {Object.keys(groupedInteractions).length === 0 ? (
        <Card className="tactile-card rounded-3xl p-12 text-center min-h-[300px] flex flex-col justify-center items-center">
          <div className="w-20 h-20 vivid-accent-bg rounded-full flex items-center justify-center mx-auto mb-6 opacity-70">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
            {selectedFilter === "all" ? "No memories yet" : "No moments found for this filter"}
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md">
            {selectedFilter === "all" ? 
              "Start documenting your interactions to build your relationship timeline. Every note creates a lasting memory." :
              "Try adjusting your filter or add new moments to see them here."}
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedInteractions).map(([date, dayInteractions]) => (
            <div key={date} className="space-y-4">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 vivid-accent-bg rounded-full shadow-sm"></div>
                <h2 className="text-lg font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {getDateLabel(date)}
                </h2>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Interactions for this date */}
              <div className="space-y-4 ml-2 pl-5 border-l-2 border-gray-200/70">
                {dayInteractions.map((interaction) => (
                  <Card key={interaction.id} className="tactile-card rounded-2xl p-6 !ml-3"> {/* Added !ml-3 to pull card left slightly over line */}
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl mt-1 text-gray-500">
                          {getInteractionEmoji(interaction.type)}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-[var(--text-primary)] text-lg">
                                {contactsMap[interaction.contact_id]?.name || "Unknown Contact"}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {format(new Date(interaction.created_date), "h:mm a")}
                                {interaction.location && ` • 📍 ${interaction.location}`}
                                {interaction.duration && ` • ⏱️ ${interaction.duration}m`}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {interaction.mood && (
                                <span className="text-xl">{getMoodEmoji(interaction.mood)}</span>
                              )}
                              <Badge className={`${getSentimentColor(interaction.sentiment)} text-xs px-2 py-0.5 rounded-full border`}>
                                {interaction.sentiment}
                              </Badge>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="prose prose-sm prose-stone max-w-none">
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                              {interaction.content}
                            </p>
                          </div>

                          {/* Tags */}
                          {interaction.tags && interaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {interaction.tags.map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs rounded-full vivid-accent-border vivid-accent-text bg-[var(--teal-light)]/20 px-2.5 py-1"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Photos */}
                          {interaction.photo_urls && interaction.photo_urls.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pt-2">
                              {interaction.photo_urls.map((url, index) => (
                                <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                                  <img 
                                    src={url} 
                                    alt={`Memory ${index + 1}`}
                                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border-2 border-gray-100 hover:opacity-80 transition-opacity"
                                  />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Voice Note */}
                          {interaction.voice_note_url && (
                             <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="w-2 h-2 vivid-accent-bg rounded-full animate-pulse"></div>
                              <span className="text-sm text-gray-600">Voice note attached</span>
                              {/* In a real app, this would be a playable audio element */}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
