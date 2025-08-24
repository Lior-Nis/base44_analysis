import React from "react";
import { motion } from "framer-motion";
import { Coins, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function RewardCard({ reward, userPoints, onRedeem }) {
  const canAfford = userPoints >= reward.points_cost;

  return (
    <Card className={`flex flex-col h-full bg-white/80 backdrop-blur-sm border-pink-100 shadow-md hover:shadow-lg transition-all duration-300 ${!canAfford ? 'opacity-70' : ''}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <img 
            src={reward.image_url} 
            alt={reward.title} 
            className="w-full h-40 object-cover rounded-t-2xl"
          />
          <Badge className="absolute top-3 right-3 bg-black/50 text-white">
            {reward.brand}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{reward.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
      </CardContent>
      
      <CardFooter className="p-4 flex items-center justify-between border-t border-pink-100">
        <div className="flex items-center gap-1">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-800">{reward.points_cost.toLocaleString()}</span>
        </div>
        <Button
          onClick={onRedeem}
          disabled={!canAfford}
          className="bg-gradient-to-r from-pink-500 to-rose-600 disabled:from-gray-400 disabled:to-gray-500"
        >
          {canAfford ? "Redeem" : "Not Enough Points"}
        </Button>
      </CardFooter>
    </Card>
  );
}