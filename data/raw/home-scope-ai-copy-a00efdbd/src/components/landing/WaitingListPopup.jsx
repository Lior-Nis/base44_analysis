import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Users, Bell, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WaitingListPopup({ isOpen, onClose, onJoinWaitingList }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md mx-auto shadow-2xl border-0 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🚀 HomeScope is launching soon!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Be among the first to access expert home consultations. Join our waiting list for exclusive early access and special launch pricing.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-green-700 bg-green-50 rounded-lg p-3">
                  <Zap className="w-4 h-4 mr-2 text-green-600" />
                  <span>50% off your first consultation</span>
                </div>
                <div className="flex items-center text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Priority access when we launch</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={onJoinWaitingList}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join the Waiting List
                </Button>
                <Button 
                  onClick={onClose}
                  variant="ghost" 
                  className="text-gray-500 hover:text-gray-700"
                >
                  Maybe later
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link 
                  to={createPageUrl('ApplyAsExpert')}
                  onClick={onClose}
                  className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Are you an expert? Apply to join our team →
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}