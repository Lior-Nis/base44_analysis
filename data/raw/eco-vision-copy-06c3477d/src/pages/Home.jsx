import React, { useEffect, useState } from "react"; // Removed unused useRef and AnimatePresence
import { User } from "@/api/entities";
// createPageUrl is used in NavigationBar, not directly here.
import HeroSection from "@/components/home/HeroSection";
import ImpactSection from "@/components/home/ImpactSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import GoalsSection from "@/components/home/GoalsSection";
import JoinSection from "@/components/home/JoinSection";
import FooterSection from "@/components/home/FooterSection";
import NavigationBar from "@/components/home/NavigationBar";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser); // user object itself is not directly used in Home's render, but isAdmin is derived.
        setIsAdmin(currentUser.role === 'admin');
      } catch (error) {
        console.log('No user logged in, or error fetching user.');
        setIsAdmin(false); // Explicitly set isAdmin to false if user fetch fails
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen font-sans bg-white overflow-x-hidden">
      <NavigationBar isAdmin={isAdmin} />
      <HeroSection />
      <ImpactSection />
      <ProjectsSection />
      <GoalsSection />
      <JoinSection />
      <FooterSection />
    </div>
  );
}