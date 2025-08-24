
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Contact } from "@/api/entities";
import { User } from "@/api/entities";
import { 
  Search as SearchIcon, 
  Filter, 
  X, 
  PlusCircle,
  Building,
  MapPin,
  Calendar,
  Tag,
  Download,
  CheckSquare,
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactCard from "../components/ContactCard";
import ContactTable from "../components/ContactTable";
import EmptyState from "../components/EmptyState";
import { downloadMultipleVCards } from "../components/utils/ContactUtils";

export default function SearchPage() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [initialLoad, setInitialLoad] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [events, setEvents] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  // Filter states
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  
  useEffect(() => {
    // Load contacts only once on initial mount
    const loadInitialData = async () => {
      try {
        const userEmail = await User.me().then(user => user.email);
        const allContacts = await Contact.filter({ created_by: userEmail }, "-created_date");
        
        // Extract unique filter options
        const companySet = new Set();
        const locationSet = new Set();
        const eventSet = new Set();
        const tagSet = new Set();
        
        allContacts.forEach(contact => {
          if (contact.company) companySet.add(contact.company);
          if (contact.location_met) locationSet.add(contact.location_met);
          if (contact.event_met) eventSet.add(contact.event_met);
          if (contact.tags && Array.isArray(contact.tags)) {
            contact.tags.forEach(tag => tagSet.add(tag));
          }
        });

        // Set all state at once
        setContacts(allContacts);
        setFilteredContacts(allContacts);
        setCompanies(Array.from(companySet));
        setLocations(Array.from(locationSet));
        setEvents(Array.from(eventSet));
        setAllTags(Array.from(tagSet));
      } catch (error) {
        console.error("Error loading contacts:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array - only run once on mount

  // Apply filters when filter criteria change
  useEffect(() => {
    if (!initialLoad) {
      applyFilters();
    }
  }, [searchTerm, selectedCompanies, selectedLocations, selectedEvents, selectedTags]);

  const applyFilters = () => {
    let filtered = [...contacts];
    
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => 
        (contact.full_name && contact.full_name.toLowerCase().includes(lowercaseSearch)) || 
        (contact.company && contact.company.toLowerCase().includes(lowercaseSearch)) || 
        (contact.email && contact.email.toLowerCase().includes(lowercaseSearch)) ||
        (contact.phone && contact.phone.toLowerCase().includes(lowercaseSearch)) ||
        (contact.job_title && contact.job_title.toLowerCase().includes(lowercaseSearch))
      );
    }
    
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter(contact => 
        contact.company && selectedCompanies.includes(contact.company)
      );
    }
    
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(contact => 
        contact.location_met && selectedLocations.includes(contact.location_met)
      );
    }
    
    if (selectedEvents.length > 0) {
      filtered = filtered.filter(contact => 
        contact.event_met && selectedEvents.includes(contact.event_met)
      );
    }
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contact => 
        contact.tags && contact.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    setFilteredContacts(filtered);
  };

  const clearFilters = () => {
    setSelectedCompanies([]);
    setSelectedLocations([]);
    setSelectedEvents([]);
    setSelectedTags([]);
  };
  
  const toggleCompanyFilter = (company) => {
    setSelectedCompanies(prev => 
      prev.includes(company) 
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };
  
  const toggleLocationFilter = (location) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };
  
  const toggleEventFilter = (event) => {
    setSelectedEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };
  
  const toggleTagFilter = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const isFilterActive = () => {
    return selectedCompanies.length > 0 || 
           selectedLocations.length > 0 || 
           selectedEvents.length > 0 || 
           selectedTags.length > 0;
  };

  const refreshContacts = async () => {
    try {
      const userEmail = await User.me().then(user => user.email);
      const allContacts = await Contact.filter({ created_by: userEmail }, "-created_date");
      setContacts(allContacts);
      applyFilters();
    } catch (error) {
      console.error("Error refreshing contacts:", error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const toggleContactSelection = (contactId, selected) => {
    const newSelected = new Set(selectedContacts);
    if (selected) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const downloadSelected = () => {
    const contactsToDownload = filteredContacts.filter(c => selectedContacts.has(c.id));
    downloadMultipleVCards(contactsToDownload);
    setSelectedContacts(new Set());
    setSelectionMode(false);
  };

  if (initialLoad) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-full mt-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Find Contacts
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {selectionMode ? (
            <>
              <Button
                variant="outline"
                className="gap-2 text-sm"
                onClick={toggleSelectAll}
              >
                {selectedContacts.size === filteredContacts.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedContacts.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              <Button
                variant="outline"
                className="gap-2 text-sm"
                onClick={() => setSelectionMode(false)}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              
              <Button
                className="gap-2 bg-slate-600 hover:bg-slate-700 text-white text-sm"
                onClick={downloadSelected}
                disabled={selectedContacts.size === 0}
              >
                <Download className="w-4 h-4" />
                Download ({selectedContacts.size})
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="gap-2 text-sm"
                onClick={() => setSelectionMode(true)}
              >
                <CheckSquare className="w-4 h-4" />
                Select Multiple
              </Button>
              
              <Link to={createPageUrl("Scan")}>
                <Button className="gap-2 bg-slate-600 hover:bg-slate-700 text-white text-sm w-full sm:w-auto">
                  <PlusCircle size={18} />
                  Add New Contact
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10 h-11"
              placeholder="Search by name, company, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchTerm("")}
              >
                <X size={16} />
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 text-sm">
                  <Filter size={16} /> 
                  Filter
                  {isFilterActive() && (
                    <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 text-xs">
                      {selectedCompanies.length + selectedLocations.length + selectedEvents.length + selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <Dropdown
                  icon={<Building size={16} />}
                  title="Companies"
                  items={companies}
                  selectedItems={selectedCompanies}
                  toggleItem={toggleCompanyFilter}
                />
                
                <DropdownMenuSeparator />
                
                <Dropdown
                  icon={<MapPin size={16} />}
                  title="Locations"
                  items={locations}
                  selectedItems={selectedLocations}
                  toggleItem={toggleLocationFilter}
                />
                
                <DropdownMenuSeparator />
                
                <Dropdown
                  icon={<Calendar size={16} />}
                  title="Events"
                  items={events}
                  selectedItems={selectedEvents}
                  toggleItem={toggleEventFilter}
                />
                
                <DropdownMenuSeparator />
                
                <Dropdown
                  icon={<Tag size={16} />}
                  title="Tags"
                  items={allTags}
                  selectedItems={selectedTags}
                  toggleItem={toggleTagFilter}
                />
                
                {isFilterActive() && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={clearFilters}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Tabs defaultValue="grid" onValueChange={setViewMode} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                <TabsTrigger value="grid" className="text-sm">Grid</TabsTrigger>
                <TabsTrigger value="table" className="text-sm">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Active filters */}
          {isFilterActive() && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCompanies.map(company => (
                <FilterBadge 
                  key={`company-${company}`}
                  label={company}
                  icon={<Building size={12} />}
                  onRemove={() => toggleCompanyFilter(company)}
                />
              ))}
              
              {selectedLocations.map(location => (
                <FilterBadge 
                  key={`location-${location}`}
                  label={location}
                  icon={<MapPin size={12} />}
                  onRemove={() => toggleLocationFilter(location)}
                />
              ))}
              
              {selectedEvents.map(event => (
                <FilterBadge 
                  key={`event-${event}`}
                  label={event}
                  icon={<Calendar size={12} />}
                  onRemove={() => toggleEventFilter(event)}
                />
              ))}
              
              {selectedTags.map(tag => (
                <FilterBadge 
                  key={`tag-${tag}`}
                  label={tag}
                  icon={<Tag size={12} />}
                  onRemove={() => toggleTagFilter(tag)}
                />
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Export button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="gap-2 text-sm"
          onClick={() => downloadMultipleVCards(filteredContacts)}
        >
          <Download size={16} />
          Export All
        </Button>
      </div>
      
      {/* Results counter */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-1">
        <span>
          {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'} found
        </span>
      </div>
      
      {/* Contact list */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredContacts.map(contact => (
            <ContactCard 
              key={contact.id} 
              contact={contact} 
              onRefresh={refreshContacts}
              selected={selectionMode && selectedContacts.has(contact.id)}
              onSelect={selectionMode ? toggleContactSelection : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ContactTable 
            contacts={filteredContacts} 
            onRefresh={refreshContacts}
            selectionMode={selectionMode}
            selectedContacts={selectedContacts}
            onSelect={toggleContactSelection}
          />
        </div>
      )}
      
      {filteredContacts.length === 0 && (
        <EmptyState 
          icon={<SearchIcon className="w-12 h-12 text-gray-400" />}
          title="No contacts found"
          description={searchTerm || isFilterActive() ? "Try adjusting your search or filters" : "Add your first contact to get started"}
          actionLabel="Add Contact"
          actionHref={createPageUrl("Scan")}
        />
      )}
    </div>
  );
}

const Dropdown = ({ icon, title, items, selectedItems, toggleItem }) => {
  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        {icon}
        {title}
      </DropdownMenuLabel>
      <div className="max-h-40 overflow-y-auto">
        {items.length > 0 ? (
          items.map(item => (
            <DropdownMenuCheckboxItem
              key={item}
              checked={selectedItems.includes(item)}
              onCheckedChange={() => toggleItem(item)}
            >
              {item}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <div className="px-2 py-1 text-sm text-gray-500">No items</div>
        )}
      </div>
    </>
  );
};

const FilterBadge = ({ label, icon, onRemove }) => {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 pr-1">
      {icon}
      <span>{label}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 rounded-full ml-1"
        onClick={onRemove}
      >
        <X size={10} />
      </Button>
    </Badge>
  );
};
