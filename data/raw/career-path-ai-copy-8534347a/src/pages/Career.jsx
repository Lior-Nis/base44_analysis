import React from 'react';

import HeroSection from '@/components/career/HeroSection';
import StudiosSection from '@/components/career/StudiosSection';
import SkillsSection from '@/components/career/SkillsSection';
import ActionPlanSection from '@/components/career/ActionPlanSection';
import ContactSection from '@/components/career/ContactSection';
import Pagination from '@/components/shared/Pagination';

export default function CareerPage() {
    return (
        <div className="w-full max-w-7xl pt-20 pb-24 space-y-32 md:space-y-48">
            <HeroSection />
            <StudiosSection />
            <SkillsSection />
            <ActionPlanSection />
            <ContactSection />
            <Pagination currentPage="Career" />
        </div>
    );
}