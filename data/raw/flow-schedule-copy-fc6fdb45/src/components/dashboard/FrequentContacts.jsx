import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Phone, Mail, MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FrequentContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const allContacts = await Contact.list();
      const sortedContacts = allContacts
        .sort((a, b) => (b.interaction_count || 0) - (a.interaction_count || 0))
        .slice(0, 4); // Show top 4 for compactness
      setContacts(sortedContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
    setLoading(false);
  };

  const handleQuickAction = async (contact, action) => {
    try {
      await Contact.update(contact.id, {
        interaction_count: (contact.interaction_count || 0) + 1,
        last_contact_date: new Date().toISOString()
      });
      loadContacts(); // Refresh list to show updated count if needed, or just for consistency
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const getRelationshipColor = (relationship) => {
    const colors = {
      colleague: "bg-blue-100 text-blue-600",
      friend: "bg-green-100 text-green-600",
      family: "bg-purple-100 text-purple-600",
      client: "bg-orange-100 text-orange-600",
      mentor: "bg-indigo-100 text-indigo-600",
      other: "bg-gray-100 text-gray-600"
    };
    return colors[relationship] || colors.other;
  };


  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-white/20">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Frequent Contacts</h3>
        <div className="space-y-2">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded-xl w-3/4 mb-1.5"></div>
                <div className="h-2.5 bg-slate-200 rounded-xl w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-white/20">
      <h3 className="text-base font-semibold text-slate-900 mb-3">Frequent Contacts</h3>
      
      {contacts.length === 0 ? (
        <div className="text-center py-6">
          <MessageCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 text-sm">No contacts yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50/50 transition-colors duration-200 group"
            >
              <div className="relative shrink-0">
                {contact.avatar_url ? (
                  <img
                    src={contact.avatar_url}
                    alt={contact.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
                    <span className="text-slate-600 font-medium text-xs">
                      {getInitials(contact.name)}
                    </span>
                  </div>
                )}
                {/* Optional: Online indicator, smaller */}
                {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white"></div> */}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 text-sm truncate">{contact.name}</h4>
                 <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getRelationshipColor(contact.relationship)}`}>
                    {contact.relationship}
                  </span>
              </div>

              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-7 h-7 rounded-lg p-0 hover:bg-blue-100"
                  title={`Call ${contact.name}`}
                  onClick={() => handleQuickAction(contact, 'call')}
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-7 h-7 rounded-lg p-0 hover:bg-green-100"
                   title={`Email ${contact.name}`}
                  onClick={() => handleQuickAction(contact, 'email')}
                >
                  <Mail className="w-3.5 h-3.5 text-green-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}