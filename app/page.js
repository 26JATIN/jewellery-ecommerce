"use client";
import { Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NewArrivals from './components/NewArrivals';
import Benefits from './components/Benefits';
import PromoBanner from './components/PromoBanner';
import FeaturedCollections from './components/FeaturedCollections';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import LoginModalHandler from './components/LoginModalHandler';

// Force dynamic rendering to avoid SSG issues with useSearchParams
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Suspense fallback={null}>
        <LoginModalHandler />
      </Suspense>
      <Hero />
      <NewArrivals />
      <Benefits />
      <PromoBanner />
      <FeaturedCollections />
      <Testimonials />
      <Footer />
    </main>
  );
}