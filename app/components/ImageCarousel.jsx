'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ImageCarousel({ 
    images, 
    productName = 'Product', 
    autoPlay = false, 
    autoPlayInterval = 3000,
    showThumbnails = true,
    showDots = true,
    className = ''
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [imageLoaded, setImageLoaded] = useState(false);
    const intervalRef = useRef(null);

    // Handle case where images is a single string (backward compatibility)
    const imageArray = (() => {
        if (Array.isArray(images)) {
            // Filter out null/undefined images and map them
            return images
                .filter(img => img !== null && img !== undefined)
                .map((img, index) => ({
                    url: typeof img === 'string' ? img : img.url,
                    alt: typeof img === 'string' ? `${productName} - Image ${index + 1}` : (img.alt || `${productName} - Image ${index + 1}`),
                    isPrimary: typeof img === 'object' && img !== null ? img.isPrimary : index === 0
                }));
        } else if (images) {
            return [{ url: images, alt: productName, isPrimary: true }];
        } else {
            return [];
        }
    })();



    // Auto-play functionality
    useEffect(() => {
        if (isPlaying && imageArray.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => 
                    prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1
                );
            }, autoPlayInterval);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, imageArray.length, autoPlayInterval]);

    // Reset to first image when images change
    useEffect(() => {
        setCurrentIndex(0);
        setImageLoaded(false);
    }, [images]);

    if (imageArray.length === 0) {
        return (
            <div className={`w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner ${className}`}>
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-16 w-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">No images available</p>
                    <p className="text-xs text-gray-400 mt-1">Upload images to see them here</p>
                </div>
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? imageArray.length - 1 : prevIndex - 1
        );
        setImageLoaded(false);
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1
        );
        setImageLoaded(false);
    };

    const goToSlide = (index) => {
        if (index !== currentIndex) {
            setCurrentIndex(index);
            setImageLoaded(false);
        }
    };

    const toggleAutoPlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div className={`relative w-full ${className}`}>
            {/* Main Image Display */}
            <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group shadow-lg">
                {/* Loading Skeleton */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                )}

                {/* Main Image */}
                <Image
                    src={imageArray[currentIndex].url}
                    alt={imageArray[currentIndex].alt}
                    fill
                    className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onLoad={handleImageLoad}
                    priority={currentIndex === 0}
                />

                {/* Gradient Overlays for Better Button Visibility */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Navigation Arrows - Only show if more than 1 image */}
                {imageArray.length > 1 && (
                    <>
                        {/* Previous Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/95 dark:bg-[#0A0A0A]/95 hover:bg-[#D4AF76] hover:text-white text-[#2C2C2C] dark:text-gray-100 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 backdrop-blur-sm z-10"
                            aria-label="Previous image"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/95 dark:bg-[#0A0A0A]/95 hover:bg-[#D4AF76] hover:text-white text-[#2C2C2C] dark:text-gray-100 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 backdrop-blur-sm z-10"
                            aria-label="Next image"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Auto-play Control */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleAutoPlay();
                            }}
                            className="absolute top-3 left-3 bg-[#2C2C2C]/70 hover:bg-[#D4AF76] text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </button>

                        {/* Image Counter with Progress */}
                        <div className="absolute top-3 right-3 bg-[#2C2C2C]/80 text-white text-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                            <span className="font-medium">{currentIndex + 1}</span>
                            <span className="text-white/70 mx-1">/</span>
                            <span className="text-white/90">{imageArray.length}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <div 
                                className="h-full bg-gradient-to-r from-[#D4AF76] to-[#B8956A] transition-all duration-500 ease-out"
                                style={{ width: `${((currentIndex + 1) / imageArray.length) * 100}%` }}
                            ></div>
                        </div>
                    </>
                )}

                {/* Primary Badge */}
                {imageArray[currentIndex].isPrimary && (
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
                        <span className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span>Primary</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Thumbnail Navigation - Only show if more than 1 image and showThumbnails is true */}
            {imageArray.length > 1 && showThumbnails && (
                <div className="mt-4">
                    <div className="flex space-x-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {imageArray.map((image, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    goToSlide(index);
                                }}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                                    currentIndex === index 
                                        ? 'ring-3 ring-[#D4AF76] ring-offset-2 shadow-lg transform scale-105' 
                                        : 'ring-2 ring-gray-200 hover:ring-[#D4AF76]/50 hover:shadow-md hover:scale-102'
                                }`}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt || `Thumbnail ${index + 1}`}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover transition-transform duration-300"
                                />
                                {/* Active Overlay */}
                                {currentIndex === index && (
                                    <div className="absolute inset-0 bg-[#D4AF76]/30 flex items-center justify-center">
                                        <div className="w-5 h-5 bg-[#D4AF76] rounded-full flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                {/* Image Number */}
                                <div className="absolute top-1 right-1 bg-[#2C2C2C]/80 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                                    {index + 1}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Dot Navigation - Only show if more than 1 image and showDots is true */}
            {imageArray.length > 1 && showDots && (
                <div className="mt-3 flex justify-center space-x-2">
                    {imageArray.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToSlide(index);
                            }}
                            className={`relative transition-all duration-300 ${
                                currentIndex === index 
                                    ? 'w-6 h-2 bg-gradient-to-r from-[#D4AF76] to-[#B8956A] scale-110' 
                                    : 'w-2 h-2 bg-gray-300 hover:bg-[#D4AF76]/60 hover:scale-110'
                            } rounded-full`}
                            aria-label={`Go to image ${index + 1}`}
                        >
                            {/* Active indicator with animation */}
                            {currentIndex === index && (
                                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Auto-play Settings (when not in auto-play mode) */}
            {imageArray.length > 1 && !isPlaying && (
                <div className="mt-3 flex justify-center">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleAutoPlay();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#2C2C2C] to-[#D4AF76] hover:from-[#D4AF76] hover:to-[#B8956A] text-white rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span>Start Slideshow</span>
                    </button>
                </div>
            )}

            {/* Keyboard Navigation - Only visible when focused */}
            <div
                className="sr-only focus:not-sr-only absolute inset-0 focus:outline-2 focus:outline-[#D4AF76] focus:outline-offset-2 rounded-xl pointer-events-none focus:pointer-events-auto"
                tabIndex={imageArray.length > 1 ? 0 : -1}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        goToPrevious();
                    } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        goToNext();
                    } else if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleAutoPlay();
                    }
                }}
                aria-label={`Image carousel for ${productName}. ${imageArray.length} images. Use arrow keys to navigate, Enter or Space to toggle slideshow.`}
            />
        </div>
    );
}