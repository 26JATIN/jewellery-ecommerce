"use client";
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NewArrivals from './components/NewArrivals';
import Benefits from './components/Benefits';
import PromoBanner from './components/PromoBanner';
import FeaturedCollections from './components/FeaturedCollections';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

export default function Home() {
  const searchParams = useSearchParams();
  const { triggerLoginModal, user } = useAuth();

  useEffect(() => {
    // Check if we need to show login modal
    const loginRequired = searchParams.get('login');
    const redirectPath = searchParams.get('redirect');
    
    if (loginRequired === 'required' && !user) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        triggerLoginModal();
      }, 500);
    }
  }, [searchParams, triggerLoginModal, user]);

  return (
    <main className="min-h-screen">
      <Navbar />
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