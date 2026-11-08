import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { LandingFeatureGrid } from '../components/landing/LandingFeatureGrid';
import { InteractiveRateCalculator } from '../components/landing/InteractiveRateCalculator';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFaq } from '../components/landing/LandingFaq';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingPageProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onDemoLogin,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col antialiased transition-colors duration-200 selection:bg-slate-200 dark:selection:bg-zinc-800 selection:text-slate-900 dark:selection:text-zinc-100">
      {/* 1. Refined Minimal Navbar */}
      <LandingNavbar
        onOpenAuth={onOpenAuth}
        onDemoLogin={onDemoLogin}
      />

      {/* 2. Main Content Streamlined for Calm, Non-Slop Experience */}
      <main className="flex-1">
        {/* Hero: Plain copy, 2 action buttons, and real Collabio UI preview */}
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

        {/* Plain FAQ */}
        <LandingFaq />
      </main>

      {/* Quiet Minimal Footer */}
      <LandingFooter
        onOpenAuth={onOpenAuth}
        onDemoLogin={onDemoLogin}
      />
    </div>
  );
};
