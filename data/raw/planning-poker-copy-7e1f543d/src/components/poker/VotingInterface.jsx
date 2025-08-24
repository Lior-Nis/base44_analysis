import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, RotateCcw, StopCircle } from "lucide-react";
import { motion } from "framer-motion";

const ESTIMATION_METHODS = {
  fibonacci_simplified: ["1", "2", "3", "5", "8", "13", "21", "?", "☕"],
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?", "☕"],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "?", "☕"]
};

export default function VotingInterface({ room, user, onUpdateRoom }) {
  const [selectedVote, setSelectedVote] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const currentUserParticipant = room.participants?.find(p => p.email === user.email);
  const allVoted = room.participants?.every(p => p.has_voted) && room.participants?.length > 0;
  const someVoted = room.participants?.some(p => p.has_voted);
  const isHost = room?.host_emails?.includes(user?.email);
  
  const votingOptions = ESTIMATION_METHODS[room.estimation_method || 'fibonacci'];

  React.useEffect(() => {
    if (currentUserParticipant) {
      setSelectedVote(currentUserParticipant.vote);
      setHasVoted(currentUserParticipant.has_voted);
    }
  }, [currentUserParticipant]);

  const submitVote = async (vote) => {
    const updatedParticipants = room.participants.map(p => 
      p.email === user.email 
        ? { ...p, vote, has_voted: true }
        : p
    );

    await onUpdateRoom({ participants: updatedParticipants });
  };

  const revealVotes = async () => {
    await onUpdateRoom({ 
      votes_revealed: true,
      voting_open: false 
    });
  };

  const endVoting = async () => {
    await onUpdateRoom({ 
      voting_open: false
    });
  };

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

  if (!room.current_story) {
    return (
      <Card className="glass-effect border-white/10">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Story Selected</h3>
          <p className="text-slate-400">Add a story to start the estimation session</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white mb-2">{room.current_story}</CardTitle>
            {room.current_story_description && (
              <p className="text-slate-400">{room.current_story_description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${
                room.voting_open 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
              }`}
            >
              {room.voting_open ? 'Voting Open' : 'Voting Closed'}
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {room.participants?.filter(p => p.has_voted).length || 0}/{room.participants?.length || 0} voted
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {room.voting_open ? (
          <div className="space-y-6">
            <div className={`grid gap-3 ${
              votingOptions.length <= 8 
                ? 'grid-cols-3 md:grid-cols-4' 
                : 'grid-cols-3 md:grid-cols-6'
            }`}>
              {votingOptions.map((value) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => submitVote(value)}
                  className={`aspect-square rounded-xl font-bold text-lg transition-all duration-200 ${
                    selectedVote === value
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                  disabled={hasVoted}
                >
                  {value}
                </motion.button>
              ))}
            </div>

            {hasVoted && (
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-green-400 font-medium">
                  ✓ You voted: <span className="font-bold">{selectedVote}</span>
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Waiting for others to vote...
                </p>
              </div>
            )}

            {isHost && (
              <div className="text-center space-y-3">
                {allVoted && (
                  <Button
                    onClick={revealVotes}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium px-8"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Reveal Votes
                  </Button>
                )}
                
                {someVoted && !allVoted && (
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={endVoting}
                      variant="outline"
                      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      End Voting
                    </Button>
                    <Button
                      onClick={revealVotes}
                      className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Reveal Votes
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <EyeOff className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Voting Closed</h3>
            <p className="text-slate-400 mb-6">Waiting for the host to start voting</p>
            
            {isHost && (
              <Button
                onClick={startNewRound}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Voting
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}