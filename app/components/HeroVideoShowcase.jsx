"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function VideoShowcaseSection() {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRefs = useRef([]);
    const videoElementRefs = useRef([]);

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

    if (loading) {
        return (
            <section className="py-20 bg-gradient-to-b from-[#F8F6F3] to-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (videos.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-gradient-to-b from-[#F8F6F3] to-white overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                        Jewelry in <span className="text-[#D4AF76]">Motion</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300 aspect-[9/16] group">
                                    {/* Video Player */}
                                    <video
                                        ref={(el) => (videoElementRefs.current[index] = el)}
                                        className="w-full h-full object-cover"
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

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

                                    {/* Video Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h3 className="text-xl font-semibold mb-2">
                                            {video.title}
                                        </h3>
                                        {video.description && (
                                            <p className="text-sm text-white/90 line-clamp-2">
                                                {video.description}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                {/* Video Number Indicator */}
                                <div className="text-center mt-4">
                                    <span className="text-sm text-gray-500">
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
                                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center text-gray-900 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                aria-label="Previous video"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => scrollToVideo(Math.min(videos.length - 1, currentIndex + 1))}
                                disabled={currentIndex === videos.length - 1}
                                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center text-gray-900 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                aria-label="Next video"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                {/* Sound Toggle */}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={toggleMute}
                        className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                        {isMuted ? (
                            <>
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Tap to Unmute</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Sound On</span>
                            </>
                        )}
                    </button>
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
