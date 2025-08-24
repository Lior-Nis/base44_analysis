import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  QrCode, 
  Share2, 
  Copy, 
  Users, 
  Gift, 
  Trophy,
  Star,
  Link as LinkIcon,
  Download,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AmbassadorHub({ user }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const canvasRef = useRef(null);

  // Generate unique referral code based on user ID
  const referralCode = user?.id ? `ECO${user.id.slice(-6).toUpperCase()}` : 'ECOXXXXXX';
  const referralLink = `https://ecohustle.app/join/${referralCode}`;

  // Mock referral stats - in a real app, these would come from the database
  const referralStats = {
    totalReferrals: user?.referrals_count || 0,
    thisMonth: user?.monthly_referrals || 0,
    totalEarned: user?.referral_earnings || 0,
    pendingRewards: user?.pending_referral_rewards || 0
  };

  const generateQRCode = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 200;
    
    canvas.width = size;
    canvas.height = size;

    // Create a simple pattern QR code representation
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#10B981';
    
    // Create a simple QR-like pattern
    const blockSize = size / 25;
    const pattern = [
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,1,0,1,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
      [1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1],
      [0,1,0,1,1,0,0,0,1,0,1,1,0,1,1,0,0,1,0,1,0],
      [1,1,1,0,0,1,1,1,0,1,0,1,1,0,1,1,1,0,1,1,1],
      [0,0,0,1,1,0,0,0,1,0,1,0,1,1,0,0,0,1,0,0,0],
      [1,0,1,0,0,1,1,1,0,1,1,0,0,1,1,0,1,0,1,0,1],
      [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1]
    ];

    pattern.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      });
    });

    // Add EcoHustle logo in center
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(size/2 - 25, size/2 - 25, 50, 50);
    ctx.fillStyle = '#10B981';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ECO', size/2, size/2 - 5);
    ctx.fillText('HUSTLE', size/2, size/2 + 10);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join EcoHustle with me!',
          text: `Turn your eco-actions into rewards! Join me on EcoHustle and let's make the planet greener together.`,
          url: referralLink
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `ecohustle-qr-${referralCode}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  React.useEffect(() => {
    if (showQR) {
      setTimeout(generateQRCode, 100);
    }
  }, [showQR]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">Ambassador Hub</span>
            <p className="text-sm text-gray-600 font-normal">Share EcoHustle and earn rewards</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{referralStats.totalReferrals}</p>
            <p className="text-xs text-blue-700">Total Referrals</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <Trophy className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-900">{referralStats.thisMonth}</p>
            <p className="text-xs text-emerald-700">This Month</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
            <Gift className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{referralStats.totalEarned}</p>
            <p className="text-xs text-orange-700">Points Earned</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{referralStats.pendingRewards}</p>
            <p className="text-xs text-purple-700">Pending</p>
          </div>
        </div>

        {/* Referral Code & Link */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Referral Code
            </label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono text-center text-lg font-bold text-emerald-600"
              />
              <Button
                onClick={() => copyToClipboard(referralCode)}
                variant="outline"
                size="icon"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-sm"
              />
              <Button
                onClick={() => copyToClipboard(referralLink)}
                variant="outline"
                size="icon"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Share with QR Code</h4>
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              size="sm"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {showQR ? 'Hide QR' : 'Show QR'}
            </Button>
          </div>

          {showQR && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-6 bg-gray-50 rounded-xl"
            >
              <canvas
                ref={canvasRef}
                className="mx-auto mb-4 border border-gray-200 rounded-lg"
                style={{ maxWidth: '200px', height: 'auto' }}
              />
              <p className="text-sm text-gray-600 mb-4">
                Scan to join EcoHustle with code: <span className="font-mono font-bold">{referralCode}</span>
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={downloadQR} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={shareReferral} variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* How It Works */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
          <h4 className="font-semibold text-emerald-900 mb-2">How Ambassador Rewards Work</h4>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>• Share your code/link with friends and family</li>
            <li>• Earn <strong>50 points</strong> when someone joins with your code</li>
            <li>• Get <strong>10% bonus</strong> of their points for their first month</li>
            <li>• Both you and your referral get <strong>25 bonus points</strong> when they complete their first eco-action</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={shareReferral} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600">
            <Share2 className="w-4 h-4 mr-2" />
            Share EcoHustle
          </Button>
          <Button onClick={() => setShowQR(true)} variant="outline" className="flex-1">
            <QrCode className="w-4 h-4 mr-2" />
            Show QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}