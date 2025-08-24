
import React, { useState, useEffect } from "react";
import { Contact, Interaction, Reminder } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isToday, addDays, differenceInDays } from "date-fns";
import { Star, Clock, MessageCircle, Calendar, ArrowRight, Sparkles, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [todaysReminders, setTodaysReminders] = useState([]);
  const [starredContacts, setStarredContacts] = useState([]);
  const [recentInteractions, setRecentInteractions] = useState([]);
  const [contactsMap, setContactsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contacts, reminders, interactions] = await Promise.all([
        Contact.list(),
        Reminder.filter({ completed: false }),
        Interaction.list("-created_date", 10)
      ]);

      // Create contacts map for quick lookup
      const contactsMapping = {};
      contacts.forEach(contact => {
        contactsMapping[contact.id] = contact;
      });
      setContactsMap(contactsMapping);

      // Filter today's reminders
      const today = new Date().toISOString().split('T')[0];
      const todayReminders = reminders.filter(reminder => 
        reminder.due_date <= today // Show overdue and today's reminders
      ).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)); // Sort by due date
      setTodaysReminders(todayReminders);

      // Get starred contacts
      const starred = contacts.filter(contact => contact.starred);
      setStarredContacts(starred);

      setRecentInteractions(interactions);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const days = differenceInDays(new Date(), new Date(date));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "bg-[var(--coral-light)]/30 text-[var(--coral-dark)] border-[var(--coral-light)]";
      case "negative": return "bg-rose-100 text-rose-700 border-rose-200"; // Keep rose for distinct negative
      default: return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getInteractionIcon = (type) => {
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
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-stone-200 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
        </h1>
        <p className="text-[var(--text-secondary)]">Here's what's happening with your connections today</p>
      </div>

      {/* Today's Reminders */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-5 h-5 vivid-accent-text" />
            Today's Focus
          </h2>
          {todaysReminders.length > 0 && (
            <Badge variant="outline" className="vivid-accent-border vivid-accent-text">
              {todaysReminders.length} pending
            </Badge>
          )}
        </div>
        
        {todaysReminders.length === 0 ? (
          <Card className="tactile-card rounded-3xl p-8 text-center">
            <Sparkles className="w-10 h-10 vivid-accent-text mx-auto mb-4" />
            <p className="text-[var(--text-primary)] font-medium text-lg mb-2">All Clear!</p>
            <p className="text-sm text-[var(--text-secondary)]">No pressing reminders. Enjoy the calm or plan your next connection.</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {todaysReminders.slice(0, 3).map((reminder) => (
              <Card key={reminder.id} className="tactile-card rounded-2xl p-4 hover:scale-[1.01] transition-transform">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--text-primary)] mb-1">
                        {reminder.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">
                        {contactsMap[reminder.contact_id]?.name}
                      </p>
                      {reminder.description && (
                        <p className="text-sm text-gray-500">
                          {reminder.description}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`ml-3 text-xs rounded-full px-2 py-1 ${
                        reminder.priority === 'high' ? 'border-rose-400 text-rose-700 bg-rose-50' :
                        reminder.priority === 'medium' ? 'border-amber-400 text-amber-700 bg-amber-50' :
                        'border-stone-300 text-stone-600 bg-stone-50'
                      }`}
                    >
                      {reminder.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Starred Contacts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Star className="w-5 h-5 vivid-accent-text fill-current" />
            Key People
          </h2>
          <Link to={createPageUrl("Contacts")}>
            <Button variant="ghost" size="sm" className="text-[var(--text-secondary)] hover:text-[var(--teal-dark)]">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {starredContacts.length === 0 ? (
          <Card className="tactile-card rounded-3xl p-8 text-center">
            <Star className="w-10 h-10 vivid-accent-text fill-current opacity-50 mx-auto mb-4" />
            <p className="text-[var(--text-primary)] font-medium text-lg mb-2">No key people yet</p>
            <p className="text-sm text-[var(--text-secondary)]">Star your important contacts to see them here.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredContacts.slice(0, 6).map((contact) => (
              <Link key={contact.id} to={createPageUrl(`ContactDetail?id=${contact.id}`)}>
                <Card className="tactile-card rounded-2xl p-4 hover:scale-[1.02] transition-all">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl vivid-accent-bg flex items-center justify-center text-white font-medium text-xl overflow-hidden shrink-0">
                        {contact.photo_url ? (
                          <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover" />
                        ) : (
                          contact.name?.charAt(0)?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[var(--text-primary)] truncate">
                          {contact.nickname || contact.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] truncate">
                          {contact.company || contact.role || contact.location || "No details"}
                        </p>
                        {contact.last_contact && (
                          <p className="text-xs text-gray-400">
                            Last contact: {getTimeAgo(contact.last_contact)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-[var(--text-primary)] flex items-center gap-2">
            <MessageCircle className="w-5 h-5 vivid-accent-text" />
            Recent Moments
          </h2>
          <Link to={createPageUrl("Timeline")}>
            <Button variant="ghost" size="sm" className="text-[var(--text-secondary)] hover:text-[var(--teal-dark)]">
              View timeline <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {recentInteractions.length === 0 ? (
          <Card className="tactile-card rounded-3xl p-8 text-center">
            <MessageCircle className="w-10 h-10 vivid-accent-text opacity-50 mx-auto mb-4" />
            <p className="text-[var(--text-primary)] font-medium text-lg mb-2">No recent activity</p>
            <p className="text-sm text-[var(--text-secondary)]">Start adding notes and interactions to see them here.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentInteractions.slice(0, 5).map((interaction) => (
              <Card key={interaction.id} className="tactile-card rounded-2xl p-4">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl mt-1">
                      {getInteractionIcon(interaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {contactsMap[interaction.contact_id]?.name || "Unknown Contact"}
                        </h3>
                        <Badge className={`${getSentimentColor(interaction.sentiment)} text-xs px-2 py-0.5 rounded-full`}>
                          {interaction.sentiment}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(interaction.created_date)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                        {interaction.content}
                      </p>
                      {interaction.location && (
                        <p className="text-xs text-gray-400 mt-1">
                          📍 {interaction.location}
                        </p>
                      )}
                      {interaction.photo_urls && interaction.photo_urls.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {interaction.photo_urls.slice(0,3).map((url, idx) => (
                            <img key={idx} src={url} alt="Interaction" className="w-12 h-12 rounded-lg object-cover border border-gray-200"/>
                          ))}
                          {interaction.photo_urls.length > 3 && (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                              +{interaction.photo_urls.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
