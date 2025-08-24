
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Phone,
  FileText,
  Clock,
  Shield,
  Zap,
  Droplets,
  Wrench,
  Users,
  MessageSquare,
  Star,
  Mail,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Play
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion"; // Fixed syntax error here
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import HeroSection from "../components/landing/HeroSection";
import AITriageSection from "../components/landing/AITriageSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import ServicesGrid from "../components/landing/ServicesGrid";
import PricingSection from "../components/landing/PricingSection";
import AboutSection from "../components/landing/AboutSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import FAQSection from "../components/landing/FAQSection";
import EmailCaptureSection from "../components/landing/EmailCaptureSection";
import Footer from "../components/landing/Footer";
import BookingModal from "../components/booking/BookingModal";
import AITriageModal from "../components/triage/AITriageModal";
import AuthModal from "../components/auth/AuthModal";
import WaitingListModal from "../components/waitlist/WaitingListModal";
import WaitingListPopup from "../components/landing/WaitingListPopup";
import { User as UserEntity } from '@/api/entities';
import { Appointment } from "@/api/entities";
import { EmailSubscriber } from "@/api/entities";
import { format } from "date-fns";

export default function Home() {
  const [user, setUser] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWaitingListModal, setShowWaitingListModal] = useState(false);
  const [waitingListPrefill, setWaitingListPrefill] = useState(null);
  const [isJoiningWithOffer, setIsJoiningWithOffer] = useState(false);
  const [showWaitingListPopup, setShowWaitingListPopup] = useState(false);
  const [userStatusChecked, setUserStatusChecked] = useState(false);
  const [launchOfferData, setLaunchOfferData] = useState({ available: true, remaining: 500 });

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setUserStatusChecked(true);
      }
    };
    checkUserStatus();
    fetchLaunchOfferStatus();
  }, []);

  const fetchLaunchOfferStatus = async () => {
    try {
      const claimedSubscribers = await EmailSubscriber.filter({ claimed_launch_offer: true });
      const offersClaimed = claimedSubscribers.length;
      const totalOffers = 500;
      setLaunchOfferData({
        available: offersClaimed < totalOffers,
        remaining: totalOffers - offersClaimed,
      });
    } catch (error) {
      console.error("Error fetching launch offer status:", error);
      setLaunchOfferData({ available: true, remaining: 500 });
    }
  };

  useEffect(() => {
    if (!userStatusChecked) {
      return;
    }

    const shouldShowPopup = !user || !user.is_on_waiting_list;

    if (shouldShowPopup) {
      const timer = setTimeout(() => {
        setShowWaitingListPopup(true);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [user, userStatusChecked]);
  
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const handleBookingClick = async (isOffer = false) => {
    setIsJoiningWithOffer(isOffer);
    try {
      await UserEntity.me();
      setShowBookingModal(true);
    } catch (error) {
      setShowAuthModal(true);
    }
  };

  const handleTriageClick = async () => {
    try {
      const currentUser = await UserEntity.me();
      if (currentUser.has_used_ai_triage) {
        setShowWaitingListModal(true);
        return;
      }
    } catch (error) {
    }
    setShowTriageModal(true);
  };

  const handleBookingConfirm = (details) => {
    setWaitingListPrefill({ email: details.email, fullName: details.fullName });
    setShowBookingModal(false);
    setShowWaitingListModal(true);
  };

  const handleTriageBookingRequest = (triageData) => {
    setShowTriageModal(false);
    setShowWaitingListModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection onTriageClick={handleTriageClick} onBookClick={handleBookingClick} />
        <AITriageSection onTriageClick={handleTriageClick} />
        <HowItWorksSection />
        <ServicesGrid />
        <PricingSection onBookClick={handleBookingClick} launchOfferData={launchOfferData} />
        <AboutSection />
        <TestimonialsSection />
        <FAQSection />
        <EmailCaptureSection />
      </main>

      <Footer />

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleBookingConfirm}
        isLaunchOfferAvailable={launchOfferData.available}
      />

      <AITriageModal
        isOpen={showTriageModal}
        onClose={() => setShowTriageModal(false)}
        onBookingRequested={handleTriageBookingRequest} />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          const checkUserStatus = async () => {
            try {
              const currentUser = await UserEntity.me();
              setUser(currentUser);
            } catch (error) {
              setUser(null);
            }
          };
          checkUserStatus();
        }} />

      <WaitingListModal
        isOpen={showWaitingListModal}
        onClose={() => {
          setShowWaitingListModal(false);
          setWaitingListPrefill(null);
          setIsJoiningWithOffer(false);
        }}
        preFilledEmail={waitingListPrefill?.email || user?.email || ""}
        preFilledName={waitingListPrefill?.fullName || user?.full_name || ""}
        isJoiningWithOffer={isJoiningWithOffer}
        onSuccess={fetchLaunchOfferStatus}
      />

      <WaitingListPopup
        isOpen={showWaitingListPopup}
        onClose={() => setShowWaitingListPopup(false)}
        onJoinWaitingList={() => {
          setShowWaitingListPopup(false);
          setShowWaitingListModal(true);
        }}
      />
    </div>
  );
}
