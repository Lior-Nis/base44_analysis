
import React, { useState, useEffect } from "react";
import { User, Referral } from "@/api/entities";
import { ColourBet, CricketBet } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  Phone,
  CreditCard,
  TrendingUp,
  Award,
  Target,
  LogOut,
  Edit3,
  Save,
  Copy,
  Gift
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [gameStats, setGameStats] = useState({
    totalBets: 0,
    totalWinnings: 0,
    colourGamesPlayed: 0,
    cricketBetsPlayed: 0,
    winRate: 0
  });
  const [referrals, setReferrals] = useState([]);
  const [codeToRedeem, setCodeToRedeem] = useState('');

  useEffect(() => {
    loadData();
    generateReferralCode();
  }, []);

  const generateReferralCode = async () => {
    try {
      const userData = await User.me();
      if (userData && !userData.referral_code) {
        const code = `REF${userData.id.slice(-6).toUpperCase()}`;
        await User.updateMyUserData({ referral_code: code });
        // Reload user data to get the updated referral code
        loadData();
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
    }
  }

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setPhoneNumber(userData.phone_number || '');
      setUpiId(userData.upi_id || '');

      const userReferrals = await Referral.filter({ referrer_id: userData.id });
      setReferrals(userReferrals);

      // Load game statistics
      const colourBets = await ColourBet.filter({ user_id: userData.id });
      const cricketBets = await CricketBet.filter({ user_id: userData.id });

      const totalBets = colourBets.length + cricketBets.length;
      const wonBets = colourBets.filter(b => b.status === 'won').length +
                     cricketBets.filter(b => b.status === 'won').length;
      const totalWinnings = colourBets.reduce((sum, b) => sum + (b.actual_win || 0), 0) +
                           cricketBets.reduce((sum, b) => sum + (b.actual_win || 0), 0);

      setGameStats({
        totalBets,
        totalWinnings,
        colourGamesPlayed: colourBets.length,
        cricketBetsPlayed: cricketBets.length,
        winRate: totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(1) : 0
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSave = async () => {
    try {
      await User.updateMyUserData({
        phone_number: phoneNumber,
        upi_id: upiId
      });
      setIsEditing(false);
      loadData();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await User.logout();
    }
  };

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert("Referral code copied!");
    }
  };

  const handleRedeemCode = async () => {
    if (!codeToRedeem) return alert("Please enter a code.");
    if (!user) return alert("User data not loaded yet.");

    try {
      const referrers = await User.filter({ referral_code: codeToRedeem });
      const referrer = referrers[0];

      if (!referrer) return alert("Invalid referral code.");
      if (referrer.id === user.id) return alert("You cannot use your own code.");
      if (user.referred_by) return alert("You have already redeemed a code.");

      // Credit bonus to new user
      const bonusForNewUser = 2;
      const updatedUserWallet = (user.wallet_balance || 0) + bonusForNewUser;
      await User.updateMyUserData({
        wallet_balance: updatedUserWallet,
        referred_by: referrer.id
      });

      // Credit bonus to referrer
      const bonusForReferrer = 10;
      const updatedReferrerWallet = (referrer.wallet_balance || 0) + bonusForReferrer;
      const updatedReferrerEarnings = (referrer.referral_earnings || 0) + bonusForReferrer;
      await User.update(referrer.id, {
        wallet_balance: updatedReferrerWallet,
        referral_earnings: updatedReferrerEarnings
      });

      await Referral.create({
        referrer_id: referrer.id,
        referred_id: user.id,
        bonus_amount: bonusForReferrer,
        status: 'completed'
      });

      alert(`Successfully redeemed code! You received ₹${bonusForNewUser} and your friend received ₹${bonusForReferrer}.`);
      loadData();
      setCodeToRedeem('');

    } catch (error) {
      console.error("Error redeeming code:", error);
      alert("An error occurred while redeeming the code.");
    }
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-300">Manage your account and view gaming statistics</p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          {/* Refer and Earn Section */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                CashCraze: Refer & Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <Label className="text-gray-300">Your Unique Referral Code</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input readOnly value={user?.referral_code || 'Loading...'} className="bg-slate-800 border-slate-600 text-white font-bold text-lg"/>
                  <Button onClick={() => copyToClipboard(user?.referral_code)} size="icon"><Copy className="w-4 h-4" /></Button>
                </div>
              </div>

              <Alert className="border-green-500/30 bg-green-500/10">
                <Gift className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  Share your code! When a new user signs up and uses your code, you get <strong className="text-green-200">₹10</strong> and they get <strong className="text-green-200">₹2</strong> instantly.
                </AlertDescription>
              </Alert>

              {user && !user.referred_by && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <Label className="text-gray-300">Got a Referral Code?</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={codeToRedeem}
                      onChange={(e) => setCodeToRedeem(e.target.value.toUpperCase())}
                      placeholder="Enter code here"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <Button onClick={handleRedeemCode} className="bg-green-600 hover:bg-green-700">Redeem</Button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Your Referrals ({referrals.length})</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {referrals.length > 0 ? referrals.map(ref => (
                    <div key={ref.id} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-gray-300">User...{ref.referred_id.slice(-6)}</span>
                      <Badge className="bg-green-500/20 text-green-300">+₹{ref.bonus_amount}</Badge>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-center py-4">No referrals yet. Share your code!</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-white">{user?.full_name}</CardTitle>
                <p className="text-gray-400">{user?.email}</p>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mt-2">
                  {user?.role}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">₹{user?.wallet_balance || 0}</div>
                  <div className="text-sm text-gray-400">Wallet Balance</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{phoneNumber || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm">UPI ID</Label>
                    {isEditing ? (
                      <Input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                        placeholder="yourname@paytm"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{upiId || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="flex-1 border-slate-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}

                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Stats */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Gaming Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{gameStats.totalBets}</div>
                    <div className="text-sm text-gray-400">Total Bets</div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">₹{gameStats.totalWinnings}</div>
                    <div className="text-sm text-gray-400">Total Winnings</div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{gameStats.winRate}%</div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UserIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{user?.role === 'admin' ? 'Admin' : 'Player'}</div>
                    <div className="text-sm text-gray-400">Account Type</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-red-500/10 to-violet-500/10 border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Colour Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{gameStats.colourGamesPlayed}</div>
                  <div className="text-red-300">Games Played</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Cricket Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{gameStats.cricketBetsPlayed}</div>
                  <div className="text-blue-300">Bets Placed</div>
                </CardContent>
              </Card>
            </div>

            {/* Account Summary */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Deposited:</span>
                    <span className="text-green-400 font-medium">₹{user?.total_deposited || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Withdrawn:</span>
                    <span className="text-blue-400 font-medium">₹{user?.total_withdrawn || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since:</span>
                    <span className="text-white font-medium">
                      {user?.created_date ? new Date(user.created_date).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
