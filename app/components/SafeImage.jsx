"use client";
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { useState, useCallback } from 'react';

export default function SafeImage({ 
    src, 
    alt, 
    fill = false,
    width,
    height,
    className = "",
    priority = false,
    loading = "lazy",
    fallbackSrc = "/product-placeholder.svg",
    quality = 80,
    ...props 
}) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Normalize the src to a string
    const getNormalizedSrc = useCallback((source) => {
        // Handle null/undefined
        if (!source) return null;
        
        // Handle objects (like MongoDB ObjectId or other objects)
        if (typeof source === 'object') {
            // If it has a toString method that returns something useful
            if (source.toString && source.toString() !== '[object Object]') {
                return source.toString();
            }
            // If it has a url or src property
            if (source.url) return String(source.url);
            if (source.src) return String(source.src);
            
            return null;
        }
        
        // Convert to string
        return String(source);
    }, []);

    const normalizedSrc = getNormalizedSrc(src);

    // Check if the URL is a local path (from public folder)
    const isLocalPath = useCallback((url) => {
        if (!url || typeof url !== 'string') return false;
        // Local paths start with / but not //
        return url.startsWith('/') && !url.startsWith('//');
    }, []);

    // Function to extract cloudinary public ID from various formats
    const getCloudinaryPublicId = useCallback((url) => {
        if (!url || typeof url !== 'string') return null;
        
        // If it's a local path, return null (not cloudinary)
        if (isLocalPath(url)) {
            return null;
        }
        
        // If it's a cloudinary URL, extract the public ID
        if (url.includes('cloudinary.com')) {
            const cloudinaryRegex = /cloudinary\.com\/[^\/]+\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
            const match = url.match(cloudinaryRegex);
            if (match) {
                return match[1];
            }
        }
        
        // If it starts with http but not cloudinary, it's an external URL
        if (url.startsWith('http')) {
            return null;
        }

        // Otherwise, treat it as a cloudinary public ID
        return url;
    }, [isLocalPath]);

    const handleError = useCallback(() => {
        if (!error) {
            setError(true);
            setIsLoading(false);
        }
    }, [error]);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    // If no valid source or error occurred, use fallback
    if (!normalizedSrc || error) {
        return (
            <img
                src={fallbackSrc}
                alt={alt}
                className={className}
                style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
                loading="lazy"
                {...props}
            />
        );
    }

    // Check if it's a local path first (from /public folder)
    if (isLocalPath(normalizedSrc)) {
        if (fill) {
            return (
                <Image
                    src={normalizedSrc}
                    alt={alt}
                    fill
                    className={className}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                    loading={priority ? undefined : loading}
                    quality={quality}
                    onError={handleError}
                    onLoad={handleLoad}
                    {...props}
                />
            );
        }
        return (
            <Image
                src={normalizedSrc}
                alt={alt}
                width={width || 400}
                height={height || 400}
                className={className}
                priority={priority}
                loading={priority ? undefined : loading}
                quality={quality}
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />
        );
    }

    const publicId = getCloudinaryPublicId(normalizedSrc);

    // If no valid public ID (not cloudinary), use regular img tag for external URLs
    if (!publicId) {
        return (
            <img
                src={normalizedSrc}
                alt={alt}
                className={className}
                style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
                loading={priority ? 'eager' : 'lazy'}
                onError={(e) => {
                    if (e.target.src !== fallbackSrc) {
                        e.target.src = fallbackSrc;
                    }
                }}
                onLoad={handleLoad}
                {...props}
            />
        );
    }

    // Use CldImage for cloudinary images with optimizations
    try {
        const cloudinaryProps = {
            src: publicId,
            alt: alt,
            className: className,
            priority: priority,
            crop: "fill",
            gravity: "auto",
            quality: quality,
            format: "auto",
            loading: priority ? 'eager' : 'lazy',
            onError: handleError,
            onLoad: handleLoad,
            ...props
        };

        // Add fill or width/height based on props
        if (fill) {
            cloudinaryProps.fill = true;
            cloudinaryProps.sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
        } else {
            // Provide default dimensions if not specified
            cloudinaryProps.width = width || 400;
            cloudinaryProps.height = height || 400;
        }

        return (
            <CldImage {...cloudinaryProps} />
        );
    } catch (err) {
        console.error('Error loading cloudinary image:', err);
        return (
            <img
                src={fallbackSrc}
                alt={alt}
                className={className}
                style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
                loading="lazy"
                {...props}
            />
        );
    }
}
