
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, TrendingUp, Users, Target } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function VoteResults({ room, user, onUpdateRoom }) {
  const [finalPoints, setFinalPoints] = useState("");
  const isHost = room?.host_emails?.includes(user?.email);
  const votes = room.participants?.filter(p => p.has_voted) || [];
  
  // Calculate vote statistics
  const voteCount = {};
  
  votes.forEach(participant => {
    const vote = participant.vote;
    voteCount[vote] = (voteCount[vote] || 0) + 1;
  });

  const consensus = Object.keys(voteCount).length === 1 && votes.length > 0;
  const mostCommonVote = consensus ? Object.keys(voteCount)[0] : null;

  const startNewRound = async () => {
    const resetParticipants = room.participants.map(p => ({
      ...p,
      vote: null,
      has_voted: false
    }));

    await onUpdateRoom({
      participants: resetParticipants,
      votes_revealed: false,
      voting_open: true
    });
  };

  const finalizeStory = async (points) => {
    if (!points) return;
    
    // Update current story with points
    const updatedStories = room.stories?.map(story => 
      story.title === room.current_story
        ? { ...story, estimated_points: points, is_completed: true }
        : story
    ) || [];

    // Reset for next story
    const resetParticipants = room.participants.map(p => ({
      ...p,
      vote: null,
      has_voted: false
    }));

    await onUpdateRoom({
      stories: updatedStories,
      participants: resetParticipants,
      votes_revealed: false,
      voting_open: false,
      current_story: "",
      current_story_description: ""
    });
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center justify-between text-white">
          <span>Vote Results</span>
          {consensus ? (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              Consensus Reached
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              No Consensus
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Vote Distribution */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Individual Votes
            </h3>
            <div className="space-y-2">
              {votes.map((participant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-300">{participant.name}</span>
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-mono text-lg"
                  >
                    {participant.vote}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Vote Summary
            </h3>
            <div className="space-y-3">
              {Object.entries(voteCount).map(([vote, count]) => (
                <div key={vote} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3 w-full">
                    <span className="font-mono text-lg text-white w-8">{vote}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(count / votes.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-slate-300 font-medium ml-4">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        {isHost && (
          <div className="border-t border-white/10 pt-4 mt-4 flex flex-col sm:flex-row items-center gap-4">
            <Button
              onClick={startNewRound}
              variant="outline"
              className="border-white/20 text-slate-300 hover:bg-white/10 w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Vote Again
            </Button>
            
            <div className="flex-grow w-full sm:w-auto" />
            
            {consensus && (
              <Button
                onClick={() => finalizeStory(mostCommonVote)}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium w-full sm:w-auto"
              >
                <Target className="w-4 h-4 mr-2" />
                Finalize with {mostCommonVote} points
              </Button>
            )}
            
            {!consensus && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 w-full sm:w-auto">
                <Input 
                  type="text"
                  placeholder="Final points" 
                  value={finalPoints}
                  onChange={(e) => setFinalPoints(e.target.value)}
                  className="w-28 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
                <Button
                  onClick={() => finalizeStory(finalPoints)}
                  disabled={!finalPoints.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium flex-1"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Finalize
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
