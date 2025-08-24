
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '@/api/entities';
import { Friendship } from '@/api/entities';
import { MultiplayerGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, UserCheck, UserX, Users, Search, Mail, X, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FriendsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [users, friendshipsData] = await Promise.all([
      User.list(),
      Friendship.list()]
      );

      setAllUsers(users.filter((u) => u.email !== user.email));
      setFriendships(friendshipsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Could not load friends data.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const { friends, pendingRequests, sentRequests, sentRequestEmails, otherUsers } = useMemo(() => {
    if (!currentUser) return { friends: [], pendingRequests: [], sentRequests: [], sentRequestEmails: new Set(), otherUsers: [] };

    const myEmail = currentUser.email;
    const friends = friendships.
    filter((f) => f.status === 'accepted' && (f.requester_email === myEmail || f.recipient_email === myEmail)).
    map((f) => {
      const friendEmail = f.requester_email === myEmail ? f.recipient_email : f.requester_email;
      return allUsers.find((u) => u.email === friendEmail);
    }).
    filter(Boolean);

    const pendingRequests = friendships.filter((f) => f.status === 'pending' && f.recipient_email === myEmail);
    const sentRequests = friendships.filter((f) => f.status === 'pending' && f.requester_email === myEmail);
    const sentRequestEmails = new Set(sentRequests.map((f) => f.recipient_email));

    const friendEmails = new Set(friends.map((f) => f.email));
    const pendingEmails = new Set([...pendingRequests.map((f) => f.requester_email), ...sentRequests.map((f) => f.recipient_email)]);

    const otherUsers = allUsers.filter((u) => u.email && !friendEmails.has(u.email) && !pendingEmails.has(u.email));

    return { friends, pendingRequests, sentRequests, sentRequestEmails, otherUsers };
  }, [currentUser, friendships, allUsers]);

  const generateQuestions = () => {
    // Simplified question generation for the challenge
    const questions = [];
    for (let i = 0; i < 5; i++) {
      const num1 = Math.floor(Math.random() * 20) + 1;
      const num2 = Math.floor(Math.random() * 20) + 1;
      questions.push({ num1, num2, operation: "+", answer: num1 + num2 });
    }
    return questions;
  };

  const handleChallenge = async (friend) => {
    try {
      await MultiplayerGame.create({
        challenger_email: currentUser.email,
        challenger_nickname: currentUser.nickname || currentUser.full_name,
        opponent_email: friend.email,
        opponent_nickname: friend.nickname || friend.full_name,
        level: 'medium', // Default level for challenges
        operation: 'addition', // Default operation
        questions: generateQuestions(),
        status: 'pending',
        challenger_progress: { score: 0, question_index: 0 },
        opponent_progress: { score: 0, question_index: 0 }
      });
      toast({
        title: "Challenge Sent!",
        description: `You challenged ${friend.nickname || friend.full_name}. Go to the Challenges page to see its status.`
      });
      navigate(createPageUrl('Challenges'));
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({ title: "Error", description: "Could not send challenge.", variant: "destructive" });
    }
  };

  const handleSendRequest = async (recipient) => {
    try {
      await Friendship.create({
        requester_email: currentUser.email,
        requester_name: currentUser.nickname || currentUser.full_name,
        recipient_email: recipient.email,
        status: 'pending'
      });
      toast({ title: "Success", description: `Friend request sent to ${recipient.nickname || recipient.full_name}.` });
      fetchData();
    } catch (error) {
      console.error("Error sending request:", error);
      toast({ title: "Error", description: "Could not send friend request.", variant: "destructive" });
    }
  };

  const handleRequestResponse = async (request, status) => {
    try {
      // Only send the 'status' field for the update
      await Friendship.update(request.id, { status });
      toast({ title: "Success", description: `Request ${status}.` });
      fetchData();
    } catch (error) {
      console.error("Error responding to request:", error);
      toast({ title: "Error", description: "Could not respond to request.", variant: "destructive" });
    }
  };

  const handleUnfriend = async (friendEmail) => {
    const friendship = friendships.find((f) =>
    f.status === 'accepted' && (
    f.requester_email === currentUser.email && f.recipient_email === friendEmail ||
    f.requester_email === friendEmail && f.recipient_email === currentUser.email)
    );
    if (friendship) {
      try {
        await Friendship.delete(friendship.id);
        toast({ title: "Success", description: "Friend removed." });
        fetchData();
      } catch (error) {
        console.error("Error unfriending:", error);
        toast({ title: "Error", description: "Could not remove friend.", variant: "destructive" });
      }
    }
  };

  const handleCancelRequest = async (recipientEmail) => {
    const requestToCancel = sentRequests.find((req) => req.recipient_email === recipientEmail);
    if (!requestToCancel) {
      toast({ title: "Error", description: "Could not find the request to cancel.", variant: "destructive" });
      return;
    }
    try {
      await Friendship.delete(requestToCancel.id);
      toast({ title: "Success", description: "Friend request cancelled." });
      fetchData();
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({ title: "Error", description: "Could not cancel friend request.", variant: "destructive" });
    }
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) return otherUsers; // Show all potential friends if search is empty
    const lowerCaseQuery = searchQuery.toLowerCase();
    return otherUsers.filter((user) =>
    user.full_name && user.full_name.toLowerCase().includes(lowerCaseQuery) ||
    user.nickname && user.nickname.toLowerCase().includes(lowerCaseQuery) ||
    user.email && user.email.toLowerCase().includes(lowerCaseQuery) ||
    user.phone_number && user.phone_number.includes(searchQuery)
    );
  }, [searchQuery, otherUsers]);

  if (isLoading) {
    return <div className="p-8 text-center text-white">Loading Friends...</div>;
  }

  return (
    <div className="bg-blue-600 text-slate-50 p-4 min-h-screen md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="game-title text-4xl md:text-6xl text-white mb-4 drop-shadow-lg flex items-center justify-center gap-4">
            <Users className="w-12 h-12" /> Friends
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            Connect with friends and get ready to challenge them!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Friends */}
          <Card className="bg-white/95 backdrop-blur-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCheck /> My Friends ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {friends.length > 0 ? friends.map((friend) =>
              <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/6.x/bottts/svg?seed=${friend.email}`} />
                      <AvatarFallback>{(friend.nickname || friend.full_name || 'F').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-800">{friend.nickname || friend.full_name}</p>
                      <p className="text-xs text-gray-500">{friend.points || 0} points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleChallenge(friend)} title={`Challenge ${friend.nickname || friend.full_name}`}>
                        <Swords className="w-4 h-4 text-purple-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleUnfriend(friend.email)} title={`Remove ${friend.nickname || friend.full_name} as a friend`}>
                        <UserX className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ) : <p className="text-gray-500 text-center py-4">No friends yet. Add some!</p>}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-8">
            {/* Friend Requests */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail /> Friend Requests ({pendingRequests.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRequests.length > 0 ? pendingRequests.map((req) =>
                <div key={req.id} className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="mb-2 sm:mb-0 text-gray-800"><span className="font-semibold">{req.requester_name}</span> wants to be your friend.</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleRequestResponse(req, 'accepted')} className="bg-green-500 hover:bg-green-600"><UserCheck className="w-4 h-4 mr-1" /> Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleRequestResponse(req, 'declined')}><UserX className="w-4 h-4 mr-1" />Decline</Button>
                    </div>
                  </div>
                ) : <p className="text-gray-500 text-center py-4">No new friend requests.</p>}
              </CardContent>
            </Card>

            {/* Find Friends */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search /> Find Other Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Input
                    placeholder="Search by name, nickname, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10" />

                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {searchResults.length === 0 && <p className="text-gray-500 text-center pt-4">No users found matching your search.</p>}
                  {searchResults.map((user) => {
                    const isPending = sentRequestEmails.has(user.email);
                    return (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                         <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/6.x/bottts/svg?seed=${user.email}`} />
                            <AvatarFallback>{(user.nickname || user.full_name || 'U').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-800">{user.nickname || user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        {isPending ?
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelRequest(user.email)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700">

                            <X className="w-4 h-4 mr-1" /> Cancel Request
                          </Button> :

                        <Button size="sm" onClick={() => handleSendRequest(user)} className="text-gray-800">
                            <UserPlus className="w-4 h-4 mr-1" /> Add Friend
                          </Button>
                        }
                      </div>);

                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>);

}
