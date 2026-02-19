"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function VideoShowcaseSection() {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRefs = useRef([]);
    const videoElementRefs = useRef([]);
    const router = useRouter();

    useEffect(() => {
        fetchVideos();
    }, []);

    // Auto-play videos when they come into view
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(err => console.log('Auto-play prevented:', err));
                } else {
                    video.pause();
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        videoElementRefs.current.forEach(video => {
            if (video) observer.observe(video);
        });

        return () => {
            videoElementRefs.current.forEach(video => {
                if (video) observer.unobserve(video);
            });
        };
    }, [videos]);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/hero-videos?activeOnly=true');
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched videos:', data);
                setVideos(data);
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToVideo = (index) => {
        setCurrentIndex(index);
        videoRefs.current[index]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const handleVideoClick = (video) => {
        console.log('Video clicked:', video);
        console.log('Linked product slug:', video.linkedProductSlug);
        
        if (video.linkedProductSlug) {
            console.log('Navigating to:', `/products/${video.linkedProductSlug}`);
            router.push(`/products/${video.linkedProductSlug}`);
        } else {
            console.log('No product linked to this video');
        }
    };

    if (loading) {
        return (
            <section className="py-20 bg-gradient-to-b from-[#F8F6F3] to-white dark:from-black dark:to-[#0A0A0A]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 mx-auto mb-4 shimmer" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 mx-auto mb-3 shimmer" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-80 mx-auto shimmer" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden">
                                <div className="aspect-video bg-gray-200 dark:bg-gray-800 shimmer" />
                                <div className="p-4 space-y-2">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3 shimmer" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 shimmer" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (videos.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-gradient-to-b from-[#F8F6F3] to-white dark:from-black dark:to-[#0A0A0A] overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 mb-4">
                        Jewelry in <span className="text-[#D4AF76]">Motion</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Experience the elegance and craftsmanship of our collection through stunning videos
                    </p>
                </motion.div>

                {/* Video Carousel */}
                <div className="relative">
                    {/* Videos Container */}
                    <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 md:px-0">
                        {videos.map((video, index) => (
                            <motion.div
                                key={video._id}
                                ref={(el) => (videoRefs.current[index] = el)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex-shrink-0 snap-center w-[280px] md:w-[320px] lg:w-[360px]"
                            >
                                <div 
                                    className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 aspect-[9/16] group ${
                                        video.linkedProductSlug ? 'cursor-pointer hover:scale-[1.02]' : ''
                                    }`}
                                >
                                    {/* Video Player */}
                                    <video
                                        ref={(el) => (videoElementRefs.current[index] = el)}
                                        className="w-full h-full object-cover pointer-events-none"
                                        loop
                                        muted={isMuted}
                                        playsInline
                                        preload="metadata"
                                        poster={video.thumbnailUrl || undefined}
                                    >
                                        <source 
                                            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${video.videoUrl}.mp4`}
                                            type="video/mp4" 
                                        />
                                        <source 
                                            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${video.videoUrl}.webm`}
                                            type="video/webm" 
                                        />
                                        Your browser does not support the video tag.
                                    </video>

                                    {/* Clickable Overlay - Only if product is linked */}
                                    {video.linkedProductSlug && (
                                        <div 
                                            className="absolute inset-0 z-10"
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Overlay clicked!');
                                                handleVideoClick(video);
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    handleVideoClick(video);
                                                }
                                            }}
                                            title={`Click to view ${video.linkedProductId?.name || 'product'}`}
                                        />
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

                                    {/* Click Indicator - Show on hover if linked */}
                                    {video.linkedProductSlug && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                                            <div className="bg-white/90 rounded-full p-4 backdrop-blur-sm">
                                                <svg className="w-8 h-8 text-[#8B6B4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}

                                    {/* Video Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-20">
                                        <h3 className="text-xl font-semibold mb-2">
                                            {video.title}
                                        </h3>
                                        {video.description && (
                                            <p className="text-sm text-white/90 line-clamp-2">
                                                {video.description}
                                            </p>
                                        )}
                                        {video.linkedProductSlug ? (
                                            <div className="flex items-center gap-2 mt-3 text-xs text-white/80 bg-black/40 px-3 py-2 rounded-full w-fit">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                <span className="font-medium">Tap to view product</span>
                                            </div>
                                        ) : (
                                            <div className="mt-3 text-xs text-white/60">
                                                No product linked
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* Video Number Indicator */}
                                <div className="text-center mt-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {String(index + 1).padStart(2, '0')} / {String(videos.length).padStart(2, '0')}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    {videos.length > 1 && (
                        <>
                            <button
                                onClick={() => scrollToVideo(Math.max(0, currentIndex - 1))}
                                disabled={currentIndex === 0}
                                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-[#0A0A0A] shadow-lg dark:shadow-none items-center justify-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/[0.1] dark:border dark:border-white/[0.06] transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                aria-label="Previous video"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => scrollToVideo(Math.min(videos.length - 1, currentIndex + 1))}
                                disabled={currentIndex === videos.length - 1}
                                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-[#0A0A0A] shadow-lg dark:shadow-none items-center justify-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/[0.1] dark:border dark:border-white/[0.06] transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                aria-label="Next video"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center mt-16"
                >
                    <a
                        href="/products"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-full hover:shadow-xl transition-all duration-300 group"
                    >
                        <span className="font-medium">Shop the Collection</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </motion.div>
            </div>

            <style jsx>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
