import React, { useState, useEffect } from 'react';
import { Poll, PollVote } from '@/api/entities';
import { Plus, Edit3, Trash2, BarChart3, Users, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

export default function PollManagement({ polls, onPollsUpdate }) {
  const [showPollForm, setShowPollForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollForm, setPollForm] = useState({
    question: '',
    options: [{ text: '', votes: 0 }, { text: '', votes: 0 }],
    poll_type: 'multiple_choice',
    active: true,
    featured: false,
    category: 'food'
  });

  const handleAddPoll = () => {
    setEditingPoll(null);
    setPollForm({
      question: '',
      options: [{ text: '', votes: 0 }, { text: '', votes: 0 }],
      poll_type: 'multiple_choice',
      active: true,
      featured: false,
      category: 'food'
    });
    setShowPollForm(true);
  };

  const handleEditPoll = (poll) => {
    setEditingPoll(poll);
    setPollForm({
      question: poll.question,
      options: poll.options || [{ text: '', votes: 0 }, { text: '', votes: 0 }],
      poll_type: poll.poll_type || 'multiple_choice',
      active: poll.active !== undefined ? poll.active : true,
      featured: poll.featured || false,
      category: poll.category || 'food'
    });
    setShowPollForm(true);
  };

  const handleDeletePoll = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        await Poll.delete(pollId);
        const updatedPolls = polls.filter(poll => poll.id !== pollId);
        onPollsUpdate(updatedPolls);
      } catch (error) {
        console.error('Error deleting poll:', error);
      }
    }
  };

  const handleToggleActive = async (poll) => {
    try {
      await Poll.update(poll.id, { ...poll, active: !poll.active });
      const updatedPolls = polls.map(p => 
        p.id === poll.id ? { ...p, active: !p.active } : p
      );
      onPollsUpdate(updatedPolls);
    } catch (error) {
      console.error('Error toggling poll status:', error);
    }
  };

  const handleToggleFeatured = async (poll) => {
    try {
      // First, unfeatured all other polls if this one is being featured
      if (!poll.featured) {
        const otherPolls = polls.filter(p => p.id !== poll.id && p.featured);
        await Promise.all(otherPolls.map(p => Poll.update(p.id, { ...p, featured: false })));
      }
      
      await Poll.update(poll.id, { ...poll, featured: !poll.featured });
      const updatedPolls = polls.map(p => 
        p.id === poll.id ? { ...p, featured: !p.featured } : { ...p, featured: false }
      );
      onPollsUpdate(updatedPolls);
    } catch (error) {
      console.error('Error toggling poll featured status:', error);
    }
  };

  const addOption = () => {
    setPollForm(prev => ({
      ...prev,
      options: [...prev.options, { text: '', votes: 0 }]
    }));
  };

  const removeOption = (index) => {
    if (pollForm.options.length > 2) {
      setPollForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index, text) => {
    setPollForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, text } : option
      )
    }));
  };

  const handleSubmitPoll = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const pollData = {
        ...pollForm,
        options: pollForm.options.filter(option => option.text.trim() !== ''),
        total_votes: editingPoll ? editingPoll.total_votes || 0 : 0
      };

      if (editingPoll) {
        await Poll.update(editingPoll.id, pollData);
        const updatedPolls = polls.map(poll => 
          poll.id === editingPoll.id ? { ...poll, ...pollData } : poll
        );
        onPollsUpdate(updatedPolls);
      } else {
        const newPoll = await Poll.create(pollData);
        onPollsUpdate([...polls, newPoll]);
      }

      setShowPollForm(false);
    } catch (error) {
      console.error('Error saving poll:', error);
    }
    setIsSubmitting(false);
  };

  const getPollMetrics = () => {
    const totalVotes = polls.reduce((sum, poll) => sum + (poll.total_votes || 0), 0);
    const activePolls = polls.filter(poll => poll.active).length;
    const featuredPoll = polls.find(poll => poll.featured);
    const avgVotesPerPoll = polls.length > 0 ? (totalVotes / polls.length).toFixed(0) : 0;

    return { totalVotes, activePolls, featuredPoll, avgVotesPerPoll };
  };

  const getPercentage = (votes, totalVotes) => {
    if (!totalVotes || totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const metrics = getPollMetrics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Poll Management</h2>
          <p className="text-gray-600">Create and manage weekly food polls</p>
        </div>
        <Button onClick={handleAddPoll} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Poll
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Total Votes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.totalVotes.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Active Polls</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.activePolls}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Featured Poll</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {metrics.featuredPoll ? 'Active' : 'None'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600">Avg Votes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.avgVotesPerPoll}</p>
          </CardContent>
        </Card>
      </div>

      {/* Polls List */}
      <div className="space-y-4">
        {polls.length > 0 ? (
          polls.map((poll) => (
            <Card key={poll.id} className="tropical-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {poll.question}
                        </h3>
                        <div className="flex gap-2">
                          <Badge className={poll.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {poll.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {poll.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        Total votes: {poll.total_votes || 0} | 
                        Created: {new Date(poll.created_date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(poll)}
                        className={poll.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {poll.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFeatured(poll)}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        {poll.featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPoll(poll)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePoll(poll.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Poll Results */}
                  <div className="space-y-3">
                    {poll.options && poll.options.map((option, index) => {
                      const percentage = getPercentage(option.votes || 0, poll.total_votes || 0);
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {option.text}
                            </span>
                            <span className="text-sm text-gray-600">
                              {option.votes || 0} votes ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
              <p className="text-gray-600 mb-6">Create your first food poll to engage your community</p>
              <Button onClick={handleAddPoll} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Poll
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Poll Form Dialog */}
      <Dialog open={showPollForm} onOpenChange={setShowPollForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPoll ? 'Edit Poll' : 'Create New Poll'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitPoll} className="space-y-6">
            <div>
              <Label htmlFor="question">Poll Question *</Label>
              <Input
                id="question"
                value={pollForm.question}
                onChange={(e) => setPollForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="e.g., What's your favorite Maldivian breakfast?"
                required
              />
            </div>

            <div>
              <Label className="text-base font-medium">Poll Options *</Label>
              <div className="space-y-3 mt-2">
                {pollForm.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {pollForm.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={pollForm.category}
                onChange={(e) => setPollForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="food, restaurant, etc."
              />
            </div>

            {/* Poll Settings */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={pollForm.active}
                    onCheckedChange={(checked) => setPollForm(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={pollForm.featured}
                    onCheckedChange={(checked) => setPollForm(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured (Homepage)</Label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPollForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !pollForm.question || pollForm.options.filter(o => o.text.trim() !== '').length < 2}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {editingPoll ? 'Update Poll' : 'Create Poll'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}