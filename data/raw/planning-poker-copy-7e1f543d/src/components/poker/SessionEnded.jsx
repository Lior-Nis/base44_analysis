import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function SessionEnded() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate(createPageUrl("Home"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const goHomeNow = () => {
    navigate(createPageUrl("Home"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="glass-effect border-white/10 text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Clock className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Session Has Ended!
            </h1>
            
            <p className="text-slate-300 mb-6">
              The host has ended this planning session. You will be redirected to the home page automatically.
            </p>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {countdown}
              </div>
              <div className="text-sm text-slate-400">
                seconds remaining
              </div>
            </div>
            
            <Button
              onClick={goHomeNow}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home Now
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}