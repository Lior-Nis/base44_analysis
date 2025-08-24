
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Contact } from "@/api/entities";
import { 
  Tag as TagIcon, 
  Plus,
  X,
  Search,
  Edit,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "../components/EmptyState";
import { User } from "@/api/entities";

export default function TagsPage() {
  const [contacts, setContacts] = useState([]);
  const [tagStats, setTagStats] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState(null);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadContacts();
  }, []);
  
  useEffect(() => {
    if (contacts.length > 0) {
      generateTagStats();
    }
  }, [contacts, searchTerm]);
  
  const loadContacts = async () => {
    setLoading(true);
    try {
      // Only get contacts created by the current user
      const userEmail = await User.me().then(user => user.email);
      const allContacts = await Contact.filter({ created_by: userEmail });
      setContacts(allContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
    setLoading(false);
  };
  
  const generateTagStats = () => {
    const tagMap = new Map();
    
    // Count tags
    contacts.forEach(contact => {
      if (contact.tags && Array.isArray(contact.tags)) {
        contact.tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, {
              count: 1,
              contactIds: [contact.id]
            });
          } else {
            const stats = tagMap.get(tag);
            stats.count += 1;
            stats.contactIds.push(contact.id);
            tagMap.set(tag, stats);
          }
        });
      }
    });
    
    // Convert to array and sort by usage count
    let stats = Array.from(tagMap.entries()).map(([tag, stats]) => ({
      name: tag,
      count: stats.count,
      contactIds: stats.contactIds
    }));
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      stats = stats.filter(tag => 
        tag.name.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Sort by usage count (descending)
    stats.sort((a, b) => b.count - a.count);
    
    setTagStats(stats);
  };
  
  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    
    // For now, we'll just add the tag to a sample contact
    // In a real app, you might want a more structured approach
    if (contacts.length > 0) {
      const contact = contacts[0];
      const updatedTags = [...(contact.tags || [])];
      
      if (!updatedTags.includes(newTag.trim())) {
        updatedTags.push(newTag.trim());
        
        try {
          await Contact.update(contact.id, {
            ...contact,
            tags: updatedTags
          });
          
          setNewTag("");
          loadContacts();
        } catch (error) {
          console.error("Error creating tag:", error);
        }
      }
    }
  };
  
  const handleRenameTag = async () => {
    if (!editingTag || !editingTag.newName.trim() || editingTag.name === editingTag.newName) {
      setEditingTag(null);
      return;
    }
    
    // Update all contacts that have this tag
    const contactsToUpdate = contacts.filter(contact => 
      contact.tags && contact.tags.includes(editingTag.name)
    );
    
    try {
      for (const contact of contactsToUpdate) {
        const updatedTags = contact.tags.map(tag => 
          tag === editingTag.name ? editingTag.newName : tag
        );
        
        await Contact.update(contact.id, {
          ...contact,
          tags: updatedTags
        });
      }
      
      setEditingTag(null);
      loadContacts();
    } catch (error) {
      console.error("Error renaming tag:", error);
    }
  };
  
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    // Remove the tag from all contacts that have it
    const contactsToUpdate = contacts.filter(contact => 
      contact.tags && contact.tags.includes(tagToDelete)
    );
    
    try {
      for (const contact of contactsToUpdate) {
        const updatedTags = contact.tags.filter(tag => tag !== tagToDelete);
        
        await Contact.update(contact.id, {
          ...contact,
          tags: updatedTags
        });
      }
      
      setTagToDelete(null);
      loadContacts();
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Manage Tags
          </h1>
          <p className="text-gray-500">
            Organize your contacts with tags for easier grouping and searching
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft size={16} />
              Back
            </Button>
          </Link>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Add a new tag to organize your contacts.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex gap-4">
                  <Input 
                    id="name" 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name"
                    className="flex-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setNewTag("")}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTag}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle>All Tags</CardTitle>
              <CardDescription>
                {tagStats.length} tag{tagStats.length !== 1 ? 's' : ''} total
              </CardDescription>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-9"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : tagStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag Name</TableHead>
                  <TableHead className="w-32">Used By</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tagStats.map(tag => (
                  <TableRow key={tag.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TagIcon size={16} className="text-blue-500" />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {tag.count} contact{tag.count !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit size={16} className="text-gray-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Rename Tag</DialogTitle>
                              <DialogDescription>
                                Change the name of this tag across all contacts.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Current Name</label>
                                <Input 
                                  value={tag.name}
                                  readOnly
                                  className="bg-gray-50"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">New Name</label>
                                <Input 
                                  value={editingTag?.newName || ""}
                                  onChange={(e) => setEditingTag({
                                    name: tag.name,
                                    newName: e.target.value
                                  })}
                                  placeholder="Enter new tag name"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingTag(null)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleRenameTag}>
                                Rename
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="text-red-600">Delete Tag</DialogTitle>
                              <DialogDescription>
                                This will remove the tag "{tag.name}" from {tag.count} contact{tag.count !== 1 ? 's' : ''}.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setTagToDelete(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => {
                                  setTagToDelete(tag.name);
                                  handleDeleteTag();
                                }}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              icon={<TagIcon className="w-12 h-12 text-blue-500" />}
              title="No tags found"
              description={searchTerm ? "Try a different search term" : "Add tags to your contacts to get started"}
              actionLabel="Create Tag"
              actionComponent={
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus size={16} />
                      Create Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Tag</DialogTitle>
                      <DialogDescription>
                        Add a new tag to organize your contacts.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex gap-4">
                        <Input 
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Enter tag name"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setNewTag("")}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTag}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              }
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-gray-500">
            Tags help you organize contacts by categories, projects, or relationships.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
