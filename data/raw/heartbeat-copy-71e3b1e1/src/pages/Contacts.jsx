
import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Plus, Star, Filter, MapPin, Briefcase, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await Contact.list("-updated_date");
      setContacts(data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
        (contact.name?.toLowerCase().includes(searchTermLower)) ||
        (contact.nickname?.toLowerCase().includes(searchTermLower)) ||
        (contact.company?.toLowerCase().includes(searchTermLower)) ||
        (contact.tags?.some(tag => tag.toLowerCase().includes(searchTermLower)));
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "starred" && contact.starred) ||
                         contact.relationship_type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => (a.name || "").localeCompare(b.name || ""));


  const getRelationshipColor = (type) => {
    switch (type) {
      case "family": return "bg-rose-100/70 text-rose-700 border-rose-200";
      case "friend": return "bg-[var(--coral-light)]/30 text-[var(--coral-dark)] border-[var(--coral-light)]";
      case "colleague": return "bg-sky-100/70 text-sky-700 border-sky-200";
      case "mentor": return "bg-purple-100/70 text-purple-700 border-purple-200";
      case "professional": return "bg-amber-100/70 text-amber-700 border-amber-200";
      default: return "bg-stone-100/70 text-stone-700 border-stone-200";
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded-2xl w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-stone-200 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Your People</h1>
          <p className="text-[var(--text-secondary)] mt-1">{contacts.length} connections shaping your world</p>
        </div>
        <Link to={createPageUrl("AddContact")}>
          <Button className="vivid-accent-bg hover:bg-[var(--teal-dark)] rounded-2xl px-6 py-3 text-base">
            <Plus className="w-5 h-5 mr-2" />
            Add Person
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, company, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 rounded-2xl border-gray-200 focus:border-[var(--vivid-teal)] h-12 text-base"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-2xl h-12 text-base border-gray-200">
              <Filter className="w-4 h-4 mr-2" />
              {selectedFilter === "all" ? "All People" : 
               selectedFilter === "starred" ? "Favorites" :
               selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
              All People
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("starred")}>
              ⭐ Favorites
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("family")}>
              👨‍👩‍👧‍👦 Family
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("friend")}>
              🤗 Friends
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("colleague")}>
              👔 Colleagues
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("mentor")}>
              🎓 Mentors
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("professional")}>
              🤝 Professional
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <Card className="tactile-card rounded-3xl p-12 text-center min-h-[300px] flex flex-col justify-center items-center">
          <div className="w-20 h-20 vivid-accent-bg rounded-full flex items-center justify-center mx-auto mb-6 opacity-70">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
            {searchTerm ? "No matches found" : "Your network awaits"}
          </h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md">
            {searchTerm ? 
              "Try a different search term or adjust your filters." : 
              "Start building your personal network by adding your first contact. Every connection is a new story."}
          </p>
          {!searchTerm && (
            <Link to={createPageUrl("AddContact")}>
              <Button className="vivid-accent-bg hover:bg-[var(--teal-dark)] rounded-2xl px-6 py-3">
                Add Your First Person
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContacts.map((contact) => (
            <Link key={contact.id} to={createPageUrl(`ContactDetail?id=${contact.id}`)}>
              <Card className="tactile-card rounded-3xl p-6 hover:scale-[1.02] transition-all h-full flex flex-col">
                <CardContent className="p-0 space-y-4 flex-grow">
                  {/* Avatar and Star */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-20 h-20 rounded-3xl vivid-accent-bg flex items-center justify-center text-white text-3xl font-medium overflow-hidden shrink-0 border-2 border-white shadow-md">
                      {contact.photo_url ? (
                        <img 
                          src={contact.photo_url} 
                          alt={contact.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        contact.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    {contact.starred && (
                      <Star className="w-6 h-6 text-amber-400 fill-current" />
                    )}
                  </div>

                  {/* Name and Relationship */}
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-xl mb-1 truncate">
                      {contact.nickname || contact.name}
                    </h3>
                    <Badge className={`${getRelationshipColor(contact.relationship_type)} rounded-full text-xs px-2.5 py-1 border`}>
                      {contact.relationship_type?.replace(/^\w/, c => c.toUpperCase())}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {contact.company && (
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Briefcase className="w-4 h-4 shrink-0" />
                        <span className="truncate">{contact.company}</span>
                      </div>
                    )}
                    {contact.location && (
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{contact.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {contact.tags.slice(0, 3).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs rounded-full vivid-accent-border vivid-accent-text bg-[var(--teal-light)]/20 px-2.5 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs rounded-full border-gray-300 text-gray-500 bg-gray-50 px-2.5 py-1">
                          +{contact.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                 {contact.bio && (
                    <p className="text-sm text-gray-500 line-clamp-2 pt-3 mt-auto border-t border-gray-100">
                      {contact.bio}
                    </p>
                  )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
