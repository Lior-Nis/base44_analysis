
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Check, Clock, Crown, Pencil, ShieldPlus, ShieldMinus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ParticipantRow({ participant, room, user, onUpdateRoom }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(participant.name);

  const isGuest = participant.email.startsWith('guest_');
  const isCurrentUser = participant.email === user?.email;
  const hostEmails = room.host_emails || [];
  const isPrimaryHost = user?.email === hostEmails[0];
  const isParticipantHost = hostEmails.includes(participant.email);

  const handleNameChange = async () => {
    if (!newName.trim() || newName.trim() === participant.name) {
      setIsEditing(false);
      return;
    }
    const updatedParticipants = room.participants.map(p =>
      p.email === participant.email ? { ...p, name: newName.trim() } : p
    );
    await onUpdateRoom({ participants: updatedParticipants });
    setIsEditing(false);
  };

  const promoteToHost = async () => {
    if (hostEmails.length >= 2 || isParticipantHost) return;
    const updatedHostEmails = [...hostEmails, participant.email];
    await onUpdateRoom({ host_emails: updatedHostEmails });
  };
  
  const demoteFromHost = async () => {
    if (participant.email === hostEmails[0]) return; // Cannot demote primary host
    const updatedHostEmails = hostEmails.filter(email => email !== participant.email);
    await onUpdateRoom({ host_emails: updatedHostEmails });
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        isCurrentUser 
          ? 'bg-blue-500/10 border border-blue-500/20' 
          : 'bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isGuest 
            ? 'bg-gradient-to-r from-gray-500 to-gray-600'
            : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}>
          <span className="text-white text-sm font-medium">
            {participant.name?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleNameChange}
                onKeyPress={(e) => e.key === 'Enter' && handleNameChange()}
                className="h-8 bg-white/10 border-white/20 text-white"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-white font-medium truncate">
                {participant.name}
                {isCurrentUser && !isEditing && <span className="text-blue-400 text-sm ml-1">(You)</span>}
              </p>
              {isParticipantHost && <Crown className="w-4 h-4 text-yellow-400 shrink-0" />}
              {isGuest && <span className="text-gray-400 text-xs ml-1 shrink-0">(Guest)</span>}
              {isCurrentUser && isGuest && !isEditing && (
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-3 h-3 text-slate-400" />
                </Button>
              )}
            </div>
          )}
          {!isGuest && (
            <p className="text-slate-400 text-xs truncate">{participant.email}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        {isPrimaryHost && !isParticipantHost && hostEmails.length < 2 && (
          <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-white/10" onClick={promoteToHost} title="Promote to host">
            <ShieldPlus className="w-4 h-4 text-green-400" />
          </Button>
        )}
        {isPrimaryHost && isParticipantHost && participant.email !== hostEmails[0] && (
           <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-white/10" onClick={demoteFromHost} title="Demote from host">
            <ShieldMinus className="w-4 h-4 text-red-400" />
          </Button>
        )}
        {room.voting_open ? (
          participant.has_voted ? (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Check className="w-3 h-3 mr-1" /> Voted
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Clock className="w-3 h-3 mr-1" /> Wait
            </Badge>
          )
        ) : room.votes_revealed && participant.vote ? (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-mono">
            {participant.vote}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export default function ParticipantsList({ room, user, onUpdateRoom }) {
  const participants = room.participants || [];
  const votedCount = participants.filter(p => p.has_voted).length;

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5" />
          Participants
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            {participants.length}/15
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <ParticipantRow 
              key={index}
              participant={participant}
              room={room}
              user={user}
              onUpdateRoom={onUpdateRoom}
            />
          ))}
        </div>

        {room.voting_open && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Voting Progress</span>
              <span className="text-white font-medium">{votedCount}/{participants.length}</span>
            </div>
            <div className="mt-2 bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${participants.length > 0 ? (votedCount / participants.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
