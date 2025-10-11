"use client";
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { useState } from 'react';

export default function SafeImage({ 
    src, 
    alt, 
    fill = false,
    width,
    height,
    className = "",
    priority = false,
    fallbackSrc = "/product-placeholder.svg",
    ...props 
}) {
    const [error, setError] = useState(false);

    // Normalize the src to a string
    const getNormalizedSrc = (source) => {
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
            
            console.warn('SafeImage: Invalid image source (object):', source);
            return null;
        }
        
        // Convert to string
        return String(source);
    };

    const normalizedSrc = getNormalizedSrc(src);

    // Check if the URL is a local path (from public folder)
    const isLocalPath = (url) => {
        if (!url || typeof url !== 'string') return false;
        // Local paths start with / but not //
        return url.startsWith('/') && !url.startsWith('//');
    };

    // Function to extract cloudinary public ID from various formats
    const getCloudinaryPublicId = (url) => {
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
    };

    const handleError = () => {
        if (!error) {
            setError(true);
        }
    };

    // If no valid source or error occurred, use fallback
    if (!normalizedSrc || error) {
        return (
            <img
                src={fallbackSrc}
                alt={alt}
                className={className}
                style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
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
                    style={{ objectFit: 'cover' }}
                    priority={priority}
                    onError={handleError}
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
                onError={handleError}
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
                onError={(e) => {
                    if (e.target.src !== fallbackSrc) {
                        e.target.src = fallbackSrc;
                    }
                }}
                {...props}
            />
        );
    }

    // Use CldImage for cloudinary images
    try {
        const cloudinaryProps = {
            src: publicId,
            alt: alt,
            className: className,
            priority: priority,
            crop: "fill",
            gravity: "auto",
            quality: "auto",
            format: "auto",
            onError: handleError,
            ...props
        };

        // Add fill or width/height based on props
        if (fill) {
            cloudinaryProps.fill = true;
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
                {...props}
            />
        );
    }
}
