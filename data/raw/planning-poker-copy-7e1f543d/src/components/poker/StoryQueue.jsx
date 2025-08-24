
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Check, Trash2, ListTodo, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StoryQueue({ room, user, onUpdateRoom }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStory, setNewStory] = useState({ title: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);

  const isHost = room?.host_emails?.includes(user?.email);
  const stories = room.stories || [];
  const pendingStories = stories.filter(s => !s.is_completed);
  const completedStories = stories.filter(s => s.is_completed);

  const addStory = async () => {
    if (!newStory.title.trim()) return;
    
    setIsAdding(true);
    
    const updatedStories = [...stories, {
      title: newStory.title.trim(),
      description: newStory.description.trim(),
      estimated_points: null,
      is_completed: false
    }];

    await onUpdateRoom({ stories: updatedStories });
    
    setNewStory({ title: "", description: "" });
    setShowAddForm(false);
    setIsAdding(false);
  };

  const selectStory = async (story) => {
    // Reset voting state and select new story
    const resetParticipants = room.participants.map(p => ({
      ...p,
      vote: null,
      has_voted: false
    }));

    await onUpdateRoom({
      current_story: story.title,
      current_story_description: story.description,
      participants: resetParticipants,
      voting_open: true,
      votes_revealed: false
    });
  };

  const deleteStory = async (storyIndex) => {
    const updatedStories = stories.filter((_, index) => index !== storyIndex);
    await onUpdateRoom({ stories: updatedStories });
  };

  const exportToCsv = () => {
    const completed = room.stories?.filter(s => s.is_completed);
    if (!completed || completed.length === 0) {
      alert("No completed stories to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Title,Description,Estimated Points\r\n";

    completed.forEach(story => {
      const title = `"${story.title.replace(/"/g, '""')}"`;
      const description = `"${(story.description || '').replace(/"/g, '""')}"`;
      const points = story.estimated_points || "";
      csvContent += [title, description, points].join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${room.room_name}_estimations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <ListTodo className="w-5 h-5" />
            Story Queue
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {pendingStories.length} pending
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {isHost && (
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Story
              </Button>
            )}
            {isHost && completedStories.length > 0 && (
              <Button onClick={exportToCsv} variant="outline" size="sm" className="border-white/20 text-slate-300 hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="space-y-3">
                <Input
                  placeholder="Story title (e.g., User login functionality)"
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
                <Textarea
                  placeholder="Story description (optional)"
                  value={newStory.description}
                  onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-20"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={addStory}
                    disabled={isAdding || !newStory.title.trim()}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isAdding ? "Adding..." : "Add Story"}
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-slate-300 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {/* Pending Stories */}
          {pendingStories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                Pending Stories
              </h3>
              <div className="space-y-2">
                {pendingStories.map((story, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border transition-all ${
                      room.current_story === story.title
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white mb-1">{story.title}</h4>
                        {story.description && (
                          <p className="text-sm text-slate-400 line-clamp-2">{story.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isHost && room.current_story !== story.title && (
                          <Button
                            onClick={() => selectStory(story)}
                            size="sm"
                            variant="outline"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {isHost && ( // Only host can delete stories
                          <Button
                            onClick={() => deleteStory(index)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Stories */}
          {completedStories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                Completed Stories
              </h3>
              <div className="space-y-2">
                {completedStories.map((story, index) => (
                  <div
                    key={index}
                    className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          {story.title}
                        </h4>
                        {story.description && (
                          <p className="text-sm text-slate-400 ml-6">{story.description}</p>
                        )}
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className="bg-green-500/20 text-green-300 border-green-500/30 font-mono"
                      >
                        {story.estimated_points}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stories.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ListTodo className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Stories Yet</h3>
              <p className="text-slate-400">Add your first user story to start estimating</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
