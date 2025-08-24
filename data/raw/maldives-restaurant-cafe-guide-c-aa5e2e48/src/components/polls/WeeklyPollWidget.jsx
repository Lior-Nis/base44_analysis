import React, { useState, useEffect } from 'react';
import { Poll as PollEntity, PollVote } from '@/api/entities';
import { BarChart3, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function WeeklyPollWidget({ className = "" }) {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadCurrentPoll();
  }, []);

  const loadCurrentPoll = async () => {
    try {
      const activePolls = await PollEntity.filter({ active: true, featured: true }, '-created_date', 1);
      if (activePolls.length > 0) {
        const poll = activePolls[0];
        setCurrentPoll(poll);
        
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
        const hasUserVoted = votedPolls.includes(poll.id);
        setHasVoted(hasUserVoted);
        setShowResults(hasUserVoted);
      }
    } catch (error) {
      console.error('Error loading current poll:', error);
    }
  };

  const handleVote = async () => {
    if (!currentPoll || selectedOption === null || hasVoted) return;
    
    setIsVoting(true);
    try {
      await PollVote.create({
        poll_id: currentPoll.id,
        option_index: selectedOption,
        user_ip: 'anonymous'
      });

      const updatedOptions = [...currentPoll.options];
      updatedOptions[selectedOption].votes = (updatedOptions[selectedOption].votes || 0) + 1;
      
      const updatedPoll = {
        ...currentPoll,
        options: updatedOptions,
        total_votes: (currentPoll.total_votes || 0) + 1
      };

      await PollEntity.update(currentPoll.id, updatedPoll);
      setCurrentPoll(updatedPoll);

      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
      votedPolls.push(currentPoll.id);
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
      
      setHasVoted(true);
      setShowResults(true);
    } catch (error) {
      console.error('Error voting:', error);
    }
    setIsVoting(false);
  };

  const getPercentage = (votes) => {
    if (!currentPoll?.total_votes || currentPoll.total_votes === 0) return 0;
    return Math.round((votes / currentPoll.total_votes) * 100);
  };

  if (!currentPoll) {
    return null;
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <Card className="soft-shadow border-2 border-[var(--highlights-accents)]/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg md:text-xl font-poppins text-[var(--headings-labels)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--primary-cta)]" />
              Weekly Food Poll
            </CardTitle>
            <Badge className="bg-[var(--highlights-accents)] text-black w-fit">
              This Week
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <h3 className="font-medium text-[var(--text-body)] mb-6 text-lg md:text-xl text-center">
            {currentPoll.question}
          </h3>

          {!showResults ? (
            <div className="space-y-4">
              {currentPoll.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-[var(--primary-cta)] cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="text-[var(--primary-cta)] focus:ring-[var(--primary-cta)] w-4 h-4"
                  />
                  <span className="ml-3 text-[var(--text-body)] flex-1">{option.text}</span>
                </label>
              ))}
              
              <Button
                onClick={handleVote}
                disabled={selectedOption === null || isVoting}
                className="w-full mt-6 cta-button"
              >
                {isVoting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Voting...
                  </>
                ) : (
                  'Vote Now!'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Thanks for voting! Here's how others voted:
                </p>
              </div>
              
              <div className="space-y-4">
                {currentPoll.options.map((option, index) => {
                  const percentage = getPercentage(option.votes || 0);
                  const isUserChoice = selectedOption === index && hasVoted;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[var(--text-body)] ${isUserChoice ? 'font-medium' : ''}`}>
                          {option.text}
                          {isUserChoice && (
                            <Badge variant="outline" className="ml-2 text-xs">Your choice</Badge>
                          )}
                        </span>
                        <span className="text-sm font-medium text-[var(--primary-cta)]">
                          {percentage}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                      <div className="text-xs text-[var(--text-muted)] text-right">
                        {option.votes || 0} votes
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-sm text-[var(--text-muted)] flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Total votes: {currentPoll.total_votes || 0}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}