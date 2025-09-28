import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NewArrivals from './components/NewArrivals';
import Benefits from './components/Benefits';
import PromoBanner from './components/PromoBanner';
import FeaturedCollections from './components/FeaturedCollections';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

export default function Home() {
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