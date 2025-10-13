"use client";
import { Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import LoginModalHandler from './components/LoginModalHandler';
import NewArrivals from './components/NewArrivals';
import CategoryStoryBadges from './components/CategoryStoryBadges';
import FeaturedCollections from './components/FeaturedCollections';
import ModelShowcase from './components/ModelShowcase';
import PremiumCTA from './components/PremiumCTA';
import TrustIndicators from './components/TrustIndicators';
import Newsletter from './components/Newsletter';

// Force dynamic rendering to avoid SSG issues with useSearchParams
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-[#FEFEFE] to-[#F8F6F3] -z-10" />
      
      <Navbar />
      <Suspense fallback={null}>
        <LoginModalHandler />
      </Suspense>
      
      {/* Hero Section */}
      <Hero />
      
      {/* Category Story Badges - Mobile Only */}
      <div className="md:hidden">
        <CategoryStoryBadges />
      </div>
      
      {/* Featured Collections - Desktop Only */}
      <div className="hidden md:block">
        <FeaturedCollections />
      </div>
      
      {/* New Arrivals Section */}
      <NewArrivals />
      
      {/* Model Showcase Section - Dynamic Gallery */}
      <ModelShowcase />
      
      {/* Premium Benefits */}
      <Benefits />
      
      {/* Trust Indicators - New */}
      <TrustIndicators />
      
      {/* Premium CTA Section - New */}
      <PremiumCTA />
      
      {/* Enhanced Testimonials */}
      <Testimonials />
      
      {/* Newsletter Signup - New */}
      <Newsletter />
      
      <Footer />
    </main>
  );
}