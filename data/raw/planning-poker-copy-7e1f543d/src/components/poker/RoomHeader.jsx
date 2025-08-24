import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Settings, LogOut, Users, Check, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EstimationMethodSelector from "./EstimationMethodSelector";

export default function RoomHeader({ room, user, onUpdateRoom, isEstimationMethodMinimized, onToggleEstimationMethod }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };
  
  const shareLink = () => {
    const baseUrl = window.location.origin;
    const roomUrl = `${baseUrl}${createPageUrl(`PokerRoom?code=${room.room_code}`)}`;
    copyToClipboard(roomUrl, 'share');
  };

  const leaveRoom = () => {
    navigate(createPageUrl("Home"));
  };

  const endSession = async () => {
    if (confirm("Are you sure you want to end this session?")) {
      await onUpdateRoom({ is_active: false });
      navigate(createPageUrl("Home"));
    }
  };

  const isHost = room?.host_emails?.includes(user?.email);
  const isGuest = user?.email?.startsWith('guest_');

  const changeEstimationMethod = async (method) => {
    if (!isHost) return;
    
    const resetParticipants = room.participants.map(p => ({
      ...p,
      vote: null,
      has_voted: false
    }));

    await onUpdateRoom({
      estimation_method: method,
      participants: resetParticipants,
      votes_revealed: false,
      voting_open: false
    });
  };

  return (
    <>
      <Card className="glass-effect border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{room.room_name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => copyToClipboard(room.room_code, 'code')}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <span className="font-mono text-white font-semibold">{room.room_code}</span>
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {room.participants?.length || 0}/15 participants
                  </Badge>
                  {isHost && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      Host
                    </Badge>
                  )}
                  {isGuest && (
                    <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                      Guest
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareLink}
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                {shareCopied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                {shareCopied ? 'Copied!' : 'Share'}
              </Button>
              {isHost && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={endSession}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={leaveRoom}
                className="border-white/20 text-slate-300 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <EstimationMethodSelector
        currentMethod={room.estimation_method || 'fibonacci'}
        onMethodChange={changeEstimationMethod}
        isHost={isHost}
        isMinimized={isEstimationMethodMinimized}
        onToggleMinimize={onToggleEstimationMethod}
      />
    </>
  );
}