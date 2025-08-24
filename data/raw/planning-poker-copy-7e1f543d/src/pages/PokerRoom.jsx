import React, { useState, useEffect } from "react";
import { PokerRoom } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import VotingInterface from "../components/poker/VotingInterface";
import ParticipantsList from "../components/poker/ParticipantsList";
import StoryQueue from "../components/poker/StoryQueue";
import VoteResults from "../components/poker/VoteResults";
import RoomHeader from "../components/poker/RoomHeader";
import SessionEnded from "../components/poker/SessionEnded";

export default function PokerRoomPage() {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [guestName, setGuestName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEstimationMethodMinimized, setIsEstimationMethodMinimized] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const roomCode = urlParams.get('code');
  const guestParam = urlParams.get('guest');

  useEffect(() => {
    if (!roomCode) {
      navigate(createPageUrl("Home"));
      return;
    }
    
    initializeRoom();
    const interval = setInterval(loadRoom, 2000);
    
    return () => clearInterval(interval);
  }, [roomCode, navigate]);

  const initializeRoom = async () => {
    try {
      let currentUser = null;
      
      // Try to load authenticated user
      try {
        currentUser = await User.me();
        setUser(currentUser);
      } catch (err) {
        // User not authenticated - proceed as guest
        setUser(null);
      }

      // Load room data
      const rooms = await PokerRoom.filter({ room_code: roomCode });
      
      if (rooms.length === 0) {
        setError("Room not found");
        setLoading(false);
        return;
      }

      const roomData = rooms[0];

      // Handle guest access
      if (!currentUser) {
        // Auto-create guest if not provided
        let guestIdentifier = guestParam;
        if (!guestIdentifier) {
          guestIdentifier = `Guest${Math.floor(Math.random() * 10000)}`;
          // Update URL to include guest parameter
          const newUrl = `${window.location.pathname}?code=${roomCode}&guest=${guestIdentifier}`;
          window.history.replaceState({}, '', newUrl);
        }
        
        setGuestName(guestIdentifier);
        
        const guestEmail = `guest_${guestIdentifier}`;
        const isGuestParticipant = roomData.participants?.some(p => p.email === guestEmail);
        
        if (!isGuestParticipant) {
          // Check room capacity
          if (roomData.participants?.length >= 15) {
            setError("Room is full (max 15 participants)");
            setLoading(false);
            return;
          }

          // Add guest to room participants
          const updatedParticipants = [...(roomData.participants || []), {
            email: guestEmail,
            name: guestIdentifier,
            vote: null,
            has_voted: false
          }];

          await PokerRoom.update(roomData.id, {
            participants: updatedParticipants
          });
        }
      } else if (currentUser) {
        // Handle authenticated user
        const isParticipant = roomData.participants?.some(p => p.email === currentUser.email);
        if (!isParticipant) {
          // Check room capacity
          if (roomData.participants?.length >= 15) {
            setError("Room is full (max 15 participants)");
            setLoading(false);
            return;
          }

          // Add user to room participants
          const updatedParticipants = [...(roomData.participants || []), {
            email: currentUser.email,
            name: currentUser.full_name,
            vote: null,
            has_voted: false
          }];

          await PokerRoom.update(roomData.id, {
            participants: updatedParticipants
          });
        }
      }

      await loadRoom();
    } catch (error) {
      console.error("Error initializing room:", error);
      setError("Failed to load room");
      setLoading(false);
    }
  };

  const loadRoom = async () => {
    try {
      const rooms = await PokerRoom.filter({ room_code: roomCode });
      
      if (rooms.length === 0) {
        setError("Room not found");
        return;
      }

      setRoom(rooms[0]);
    } catch (error) {
      console.error("Error loading room:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = async (updates) => {
    try {
      await PokerRoom.update(room.id, updates);
      await loadRoom();
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate(createPageUrl("Home"))}
            className="text-blue-400 hover:text-blue-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (room && !room.is_active) {
    return <SessionEnded />;
  }

  const effectiveUser = user || (guestName ? {
    email: `guest_${guestName}`,
    name: guestName,
    role: 'guest'
  } : null);

  const isHost = room?.host_emails?.includes(effectiveUser?.email);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <RoomHeader 
          room={room}
          user={effectiveUser}
          onUpdateRoom={updateRoom}
          isEstimationMethodMinimized={isEstimationMethodMinimized}
          onToggleEstimationMethod={() => setIsEstimationMethodMinimized(!isEstimationMethodMinimized)}
        />

        <div className="grid lg:grid-cols-4 gap-6 mt-8">
          <div className="lg:col-span-3 space-y-6">
            {room.votes_revealed ? (
              <VoteResults 
                room={room}
                user={effectiveUser}
                onUpdateRoom={updateRoom}
              />
            ) : (
              <VotingInterface 
                room={room}
                user={effectiveUser}
                onUpdateRoom={updateRoom}
              />
            )}
            
            <StoryQueue 
              room={room}
              user={effectiveUser}
              onUpdateRoom={updateRoom}
            />
          </div>

          <div className="space-y-6">
            <ParticipantsList 
              room={room}
              user={effectiveUser}
              onUpdateRoom={updateRoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
}