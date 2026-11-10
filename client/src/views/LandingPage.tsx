import React, { useState } from 'react';
import { LandingBanner } from '../components/landing/LandingBanner';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { LandingFeatureGrid } from '../components/landing/LandingFeatureGrid';
import { InteractiveRateCalculator } from '../components/landing/InteractiveRateCalculator';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFaq } from '../components/landing/LandingFaq';
import { LandingFooter } from '../components/landing/LandingFooter';
import { AdminCmsModal } from '../components/admin/AdminCmsModal';

interface LandingPageProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onDemoLogin,
}) => {
  const [cmsModalOpen, setCmsModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-charcoal-950 text-sand-100 flex flex-col antialiased transition-colors duration-200 selection:bg-sand-400/20 selection:text-sand-100 relative overflow-hidden">
      {/* Tactile Sand-Charcoal Noise Texture Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 luxury-noise opacity-40 mix-blend-overlay" />

      {/* Ambient Sand Glow Backdrop */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] sand-glow-hero rounded-full blur-3xl opacity-75" />
      <div className="pointer-events-none absolute top-[900px] -left-48 w-[600px] h-[600px] bg-sand-400/5 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-[1800px] -right-48 w-[700px] h-[700px] bg-sand-500/5 rounded-full blur-[160px]" />

      {/* 0. Live Announcement Banner (CMS Configurable) */}
      <LandingBanner />

      {/* 1. Refined Minimal Luxury Navbar */}
      <LandingNavbar
        onOpenAuth={onOpenAuth}
        onDemoLogin={onDemoLogin}
        onOpenCms={() => setCmsModalOpen(true)}
      />

      {/* 2. Main Content Streamlined for Dark Luxury Experience */}
      <main className="flex-1 relative z-10">
        {/* Hero: Editorial typography, sand-gold badge accents, and real live Collabio pipeline preview */}
        <HeroSection
          onOpenAuth={onOpenAuth}
          onDemoLogin={onDemoLogin}
        />

        {/* 3 Core Capabilities: Deals Pipeline, Exclusivity Scanner, Invoicing */}
        <LandingFeatureGrid
          onDemoLogin={onDemoLogin}
          onOpenAuth={onOpenAuth}
        />

        {/* Commercial Rate Estimator */}
        <InteractiveRateCalculator
          onOpenAuth={onOpenAuth}
          onDemoLogin={onDemoLogin}
        />

        {/* Transparent Pricing: Free Solo ($0) vs Pro ($19) */}
        <LandingPricing
          onOpenAuth={onOpenAuth}
          onDemoLogin={onDemoLogin}
        />

        {/* Essential FAQ */}
        <LandingFaq />
      </main>

      {/* 3. Luxury Sand-Charcoal Footer */}
      <LandingFooter onOpenAuth={onOpenAuth} />

      {/* Admin CMS Studio Modal */}
      <AdminCmsModal
        isOpen={cmsModalOpen}
        onClose={() => setCmsModalOpen(false)}
      />
    </div>
  );
};
