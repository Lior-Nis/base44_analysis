
import React, { useState, useEffect } from "react";
import { PokerRoom } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LogIn, Users, Clock, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [recentRooms, setRecentRooms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      await loadUser();
      await loadRecentRooms(); // ensure user is loaded before fetching rooms
    };
    init();
  }, [user?.email]); // Rerun when user email becomes available

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      console.log("User not authenticated");
    }
  };

  const loadRecentRooms = async () => {
    if (!user) {
      setRecentRooms([]);
      return;
    }
    try {
      // Filter rooms by host_emails containing the current user's email
      const rooms = await PokerRoom.filter({ host_emails: user.email }, "-created_date", 5);
      setRecentRooms(rooms);
    } catch (error) {
      console.error("Error loading recent rooms:", error);
    }
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    if (!user) {
      await User.login();
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const roomCode = generateRoomCode();
      const room = await PokerRoom.create({
        room_code: roomCode,
        room_name: roomName.trim(),
        host_emails: [user.email], // Changed to an array
        estimation_method: "fibonacci",
        participants: [{
          email: user.email,
          name: user.full_name,
          vote: null,
          has_voted: false
        }],
        stories: [],
        voting_open: false,
        votes_revealed: false,
        current_story: "",
        current_story_description: ""
      });

      navigate(createPageUrl(`PokerRoom?code=${roomCode}`));
    } catch (error) {
      setError("Failed to create room. Please try again.");
      console.error("Error creating room:", error);
    }

    setIsCreating(false);
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const rooms = await PokerRoom.filter({
        room_code: joinCode.toUpperCase().trim(),
        is_active: true
      });

      if (rooms.length === 0) {
        setError("Room not found or inactive");
        setIsJoining(false);
        return;
      }

      const room = rooms[0];

      // If user is not authenticated, allow guest access
      if (!user) {
        // Generate a guest name and redirect
        const guestName = `Guest${Math.floor(Math.random() * 1000)}`;
        navigate(createPageUrl(`PokerRoom?code=${joinCode.toUpperCase().trim()}&guest=${guestName}`));
        setIsJoining(false); // Ensure loading state is reset before navigation
        return;
      }

      // Check if user is already in room
      const isAlreadyParticipant = room.participants?.some(p => p.email === user.email);

      if (!isAlreadyParticipant) {
        // Check room capacity
        if (room.participants?.length >= 15) {
          setError("Room is full (max 15 participants)");
          setIsJoining(false);
          return;
        }

        // Add user to room
        const updatedParticipants = [...(room.participants || []), {
          email: user.email,
          name: user.full_name,
          vote: null,
          has_voted: false
        }];

        await PokerRoom.update(room.id, {
          participants: updatedParticipants
        });
      }

      navigate(createPageUrl(`PokerRoom?code=${joinCode.toUpperCase().trim()}`));
    } catch (error) {
      setError("Failed to join room. Please try again.");
      console.error("Error joining room:", error);
    }

    setIsJoining(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Planning Poker
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Estimate user stories with your team using Fibonacci sequence.
            Simple, fast, and collaborative.
          </p>
        </div>

        {error && (
          <Alert className="mb-8 bg-red-500/10 border-red-500/20 text-red-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Create Room */}
          <Card className="glass-effect card-hover border-white/10">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Create Room</CardTitle>
              <p className="text-slate-400">Start a new estimation session</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName" className="text-slate-300">Session Name</Label>
                <Input
                  id="roomName"
                  placeholder="Sprint Planning Session"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                />
              </div>
              <Button
                onClick={createRoom}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Room
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="glass-effect card-hover border-white/10">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Join Room</CardTitle>
              <p className="text-slate-400">Enter a room code to participate</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-slate-300">Room Code</Label>
                <Input
                  id="joinCode"
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-center font-mono text-lg"
                  maxLength={6}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                />
              </div>
              <Button
                onClick={joinRoom}
                disabled={isJoining}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-3"
              >
                {isJoining ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Join Room
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-slate-400">
                  No account needed - you can join as a guest
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Rooms */}
        {user && recentRooms.length > 0 && (
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recentRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{room.room_name}</h3>
                        <p className="text-sm text-slate-400">
                          Code: {room.room_code} • {room.participants?.length || 0} participants
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(createPageUrl(`PokerRoom?code=${room.room_code}`))}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Up to 15 People</h3>
            <p className="text-slate-400">Perfect for small to medium teams</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-purple-400 font-bold">1,2,3,5</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fibonacci Sequence</h3>
            <p className="text-slate-400">Standard agile estimation points</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Sync</h3>
            <p className="text-slate-400">Everyone votes simultaneously</p>
          </div>
        </div>
      </div>
    </div>
  );
}
