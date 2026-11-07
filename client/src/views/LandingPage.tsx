import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { InteractiveLivePreview } from '../components/landing/InteractiveLivePreview';
import { InteractiveRateCalculator } from '../components/landing/InteractiveRateCalculator';
import { LandingFeatureGrid } from '../components/landing/LandingFeatureGrid';
import { LandingTestimonials } from '../components/landing/LandingTestimonials';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFaq } from '../components/landing/LandingFaq';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingPageProps {
  onOpenAuth: () => void;
  onDemoLogin: (email: string) => void;
  onOpenAdmin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onDemoLogin,
  onOpenAdmin,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* Marketing Header Navigation */}
      <LandingNavbar
        onOpenAuth={onOpenAuth}
        onDemoLogin={onDemoLogin}
        onOpenAdmin={onOpenAdmin}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Value Proof & Key Metrics */}
        <HeroSection
          onOpenAuth={onOpenAuth}
          onDemoLogin={onDemoLogin}
        />

        {/* 2. Interactive Software Snapshot Preview */}
        <InteractiveLivePreview
          onDemoLogin={onDemoLogin}
        />

        {/* 3. Interactive Sponsorship Rate Estimator Widget */}
        <InteractiveRateCalculator
          onDemoLogin={onDemoLogin}
        />

        {/* 4. The 4 Core Feature Pillars */}
        <LandingFeatureGrid
          onDemoLogin={onDemoLogin}
          onOpenAuth={onOpenAuth}
        />

        {/* 5. Creator Social Proof & Testimonials */}
        <LandingTestimonials />

        {/* 6. Transparent SaaS Pricing Comparison */}
        <LandingPricing
          onOpenAuth={onOpenAuth}
          onDemoLogin={onDemoLogin}
        />

        {/* 7. Frequently Asked Questions */}
        <LandingFaq />
      </main>

      {/* Footer */}
      <LandingFooter
        onOpenAuth={onOpenAuth}
        onDemoLogin={onDemoLogin}
        onOpenAdmin={onOpenAdmin}
      />
    </div>
  );
};
