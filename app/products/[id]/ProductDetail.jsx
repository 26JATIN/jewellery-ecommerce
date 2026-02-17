"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SafeImage from '../../components/SafeImage';
import ProductVariantSelector from '../../components/ProductVariantSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { isProductOutOfStock, getEffectiveStock, hasLowStock } from '@/lib/productUtils';
import { toast } from 'sonner';

// Mobile swipeable image gallery — touch-controlled, strictly 1 image per swipe
function MobileImageGallery({ images, productName, isOutOfStock, effectiveStock, discount }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState(new Set([0]));
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
    const containerRef = useRef(null);
    const isHorizontalSwipeRef = useRef(null);

    // Preload adjacent images
    useEffect(() => {
        setLoadedImages(prev => {
            const next = new Set(prev);
            next.add(activeIndex);
            if (activeIndex > 0) next.add(activeIndex - 1);
            if (activeIndex < images.length - 1) next.add(activeIndex + 1);
            return next;
        });
    }, [activeIndex, images.length]);

    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        isHorizontalSwipeRef.current = null;
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const diffX = touch.clientX - touchStartRef.current.x;
        const diffY = touch.clientY - touchStartRef.current.y;

        // Determine swipe direction on first significant move
        if (isHorizontalSwipeRef.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
            isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
        }

        // Only handle horizontal swipes
        if (isHorizontalSwipeRef.current) {
            e.preventDefault();
            // Clamp drag at edges with rubber-band effect
            let offset = diffX;
            if ((activeIndex === 0 && diffX > 0) || (activeIndex === images.length - 1 && diffX < 0)) {
                offset = diffX * 0.3; // Rubber band
            }
            setDragOffset(offset);
        }
    }, [isDragging, activeIndex, images.length]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.2 : 80;
        const timeDiff = Date.now() - touchStartRef.current.time;
        const velocity = Math.abs(dragOffset) / timeDiff;

        // Swipe if dragged past threshold OR fast flick
        if (dragOffset < -threshold || (dragOffset < -30 && velocity > 0.3)) {
            // Swipe left → next
            if (activeIndex < images.length - 1) {
                setActiveIndex(prev => prev + 1);
            }
        } else if (dragOffset > threshold || (dragOffset > 30 && velocity > 0.3)) {
            // Swipe right → prev
            if (activeIndex > 0) {
                setActiveIndex(prev => prev - 1);
            }
        }
        setDragOffset(0);
        isHorizontalSwipeRef.current = null;
    }, [isDragging, dragOffset, activeIndex, images.length]);

    const goToIndex = useCallback((index) => {
        setActiveIndex(index);
    }, []);

    return (
        <div className="relative">
            {/* Gallery container */}
            <div 
                ref={containerRef}
                className="overflow-hidden rounded-3xl shadow-lg dark:shadow-none dark:border dark:border-white/[0.06]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div 
                    className="flex"
                    style={{ 
                        transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
                        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
                        willChange: 'transform',
                    }}
                >
                    {images.map((img, index) => (
                        <div 
                            key={index} 
                            className="w-full flex-shrink-0"
                        >
                            <div className="aspect-square relative bg-white dark:bg-[#0A0A0A]">
                                {loadedImages.has(index) ? (
                                    <SafeImage
                                        src={img}
                                        alt={`${productName} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        quality={80}
                                        draggable={false}
                                    />
                                ) : (
                                    <SafeImage
                                        src={img}
                                        alt={`${productName} ${index + 1}`}
                                        fill
                                        className="object-cover blur-sm scale-105"
                                        quality={1}
                                        loading="lazy"
                                        draggable={false}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges */}
            {!isOutOfStock && effectiveStock > 0 && effectiveStock <= 5 && (
                <div className="absolute top-4 right-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-4 py-2 shadow-lg z-20">
                    <span className="text-sm font-medium">Only {effectiveStock} left!</span>
                </div>
            )}
            {isOutOfStock && (
                <div className="absolute top-4 right-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-4 py-2 shadow-lg z-20">
                    <span className="text-sm font-medium">Out of Stock</span>
                </div>
            )}
            {discount > 0 && (
                <div className="absolute top-4 left-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-4 py-2 shadow-lg z-20">
                    <span className="text-sm font-medium">{discount}% OFF</span>
                </div>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToIndex(index)}
                            className={`rounded-full transition-all duration-300 ${
                                activeIndex === index 
                                    ? 'w-6 h-2 bg-[#D4AF76]' 
                                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
                            }`}
                            aria-label={`View image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute bottom-4 right-5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full z-20">
                    {activeIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}

export default function ProductDetail({ productId }) {
    const router = useRouter();
    const { addToCart, setIsCartOpen } = useCart();
    const { user, triggerRegisterModal } = useAuth();
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [variantImages, setVariantImages] = useState([]);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async (retry = 0) => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/api/products/${productId}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setProduct(data);
                setRetryCount(0);
                
                // Fetch related products
                if (data.category) {
                    fetchRelatedProducts(data.category, productId);
                }
            } else if (response.status === 404) {
                setError('Product not found');
            } else if (response.status === 400) {
                setError('Invalid product ID');
            } else {
                // Retry on server errors (500, 503, etc.)
                if (retry < 3) {
                    console.log(`Retrying... attempt ${retry + 1}`);
                    setTimeout(() => {
                        setRetryCount(retry + 1);
                        fetchProduct(retry + 1);
                    }, 1000 * (retry + 1)); // Exponential backoff
                } else {
                    setError('Failed to load product. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            
            // Retry on network errors
            if (retry < 3) {
                console.log(`Retrying... attempt ${retry + 1}`);
                setTimeout(() => {
                    setRetryCount(retry + 1);
                    fetchProduct(retry + 1);
                }, 1000 * (retry + 1)); // Exponential backoff
            } else {
                setError('Failed to load product. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (category, currentProductId) => {
        try {
            // First try to get products from same subcategory
            if (product?.subcategory) {
                const subcategoryId = typeof product.subcategory === 'object' 
                    ? product.subcategory._id 
                    : product.subcategory;
                
                const response = await fetch(`/api/products?subcategory=${subcategoryId}&limit=8`);
                if (response.ok) {
                    const data = await response.json();
                    const productsData = data.success ? data.data : data;
                    // Filter out current product
                    const filtered = productsData.filter(p => p._id !== currentProductId);
                    
                    if (filtered.length >= 4) {
                        setRelatedProducts(filtered.slice(0, 4));
                        return;
                    }
                }
            }
            
            // Fallback to category-based recommendations
            const response = await fetch(`/api/products?category=${category}&limit=8`);
            if (response.ok) {
                const data = await response.json();
                const productsData = data.success ? data.data : data;
                // Filter out current product
                const filtered = productsData.filter(p => p._id !== currentProductId);
                setRelatedProducts(filtered.slice(0, 4));
            }
        } catch (error) {
            console.error('Error fetching related products:', error);
        }
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        
        // Reset quantity if it exceeds the new variant's stock
        if (variant && variant.stock < quantity) {
            setQuantity(Math.min(quantity, variant.stock));
        }
        
        // Update images if variant has specific images
        if (variant?.images && variant.images.length > 0) {
            setVariantImages(variant.images);
            setSelectedImage(0);
        } else {
            setVariantImages([]);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            triggerRegisterModal();
            return;
        }

        // Check if product has variants and a variant is selected
        if (product?.hasVariants && !selectedVariant) {
            toast.warning('Please select all product options before adding to cart');
            return;
        }

        // Check stock availability
        const availableStock = product?.hasVariants && selectedVariant 
            ? selectedVariant.stock 
            : effectiveStock;

        if (availableStock < quantity) {
            const stockMessage = selectedVariant 
                ? `Only ${availableStock} items available for this variant`
                : `Only ${availableStock} items available`;
            toast.warning(stockMessage);
            return;
        }

        if (availableStock === 0) {
            toast.error('This item is currently out of stock');
            return;
        }

        setAddingToCart(true);
        try {
            // Include variant info in cart item
            const cartItem = {
                ...product,
                selectedVariant: selectedVariant,
                variantId: selectedVariant?._id,
                // Override price if variant has different price
                sellingPrice: selectedVariant?.price?.sellingPrice || product.sellingPrice,
                mrp: selectedVariant?.price?.mrp || product.mrp,
                // Use variant stock if available
                availableStock: availableStock,
                // Generate unique cart key for variants
                cartKey: selectedVariant ? `${product._id}_${selectedVariant._id}` : product._id
            };

            await addToCart(cartItem, quantity);
            setIsCartOpen(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = product?.name || 'Check out this product';
        const price = selectedVariant?.price?.sellingPrice || product?.sellingPrice;
        const text = `✨ ${product?.name} - Nandika Jewellers${price ? `\n💰 ₹${price.toLocaleString('en-IN')}` : ''}\n🔗 ${url}`;

        // Always try navigator.share first — works on mobile Chrome, PWA, Safari
        if (navigator.share) {
            try {
                await navigator.share({ 
                    title, 
                    text,
                    url 
                });
                return;
            } catch (err) {
                // User cancelled or share failed
                if (err.name === 'AbortError') return;
            }
        }
        
        // Fallback: copy link to clipboard
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        } catch {
            // Final fallback: manual copy
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Link copied to clipboard!');
        }
    };

    // Use variant images if available, otherwise use product images
    const displayImages = variantImages.length > 0 ? variantImages : (product?.images || (product?.image ? [{url: product.image, alt: product.name}] : []));
    const currentImage = displayImages[selectedImage] || displayImages[0];

    if (loading) {
        return (
            <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-gradient-to-b from-white to-[#FAFAFA] dark:from-black dark:to-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="relative mb-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D4AF76]/20"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#D4AF76] absolute top-0 left-0"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-light">Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-gradient-to-b from-white to-[#FAFAFA] dark:from-black dark:to-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="bg-red-50 dark:bg-red-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">
                            {error === 'Invalid product ID' ? 'Invalid Product' : 'Product Not Found'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 font-light mb-6">
                            {error === 'Invalid product ID' 
                                ? 'The product link appears to be invalid.'
                                : error || "The product you're looking for doesn't exist or has been removed."}
                        </p>
                        <div className="flex gap-4 justify-center">
                            {retryCount < 3 && error !== 'Product not found' && error !== 'Invalid product ID' && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fetchProduct(0)}
                                    className="px-6 py-3 bg-[#D4AF76] text-white rounded-full hover:bg-[#C19A65] transition-colors font-light shadow-lg"
                                >
                                    Try Again
                                </motion.button>
                            )}
                            <Link href="/products">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-[#8B6B4C] text-white rounded-full hover:bg-[#7A5D42] transition-colors font-light shadow-lg"
                                >
                                    Browse Collections
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Calculate prices based on variant or product
    const currentPrice = {
        mrp: selectedVariant?.price?.mrp || product?.mrp,
        sellingPrice: selectedVariant?.price?.sellingPrice || product?.sellingPrice,
        stock: selectedVariant?.stock ?? product?.stock ?? product?.totalStock ?? 0
    };

    // For products with variants, use total stock if no variant is selected
    // Otherwise use the selected variant's stock or the product's stock
    let effectiveStock;
    if (product?.hasVariants && !selectedVariant) {
        // Product has variants but none selected - show total stock
        effectiveStock = product?.totalStock ?? 0;
    } else if (selectedVariant) {
        // A variant is selected - use variant stock
        effectiveStock = selectedVariant?.stock ?? 0;
    } else {
        // Regular product without variants - use product stock
        effectiveStock = product?.stock ?? 0;
    }

    const discount = currentPrice.mrp && currentPrice.sellingPrice && currentPrice.mrp > currentPrice.sellingPrice
        ? Math.round(((currentPrice.mrp - currentPrice.sellingPrice) / currentPrice.mrp) * 100)
        : 0;
    
    // Check if product is out of stock
    const isOutOfStock = effectiveStock <= 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] pt-4 md:pt-6 lg:pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <motion.nav 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8"
                >
                    <Link href="/" className="hover:text-[#D4AF76] transition-colors">Home</Link>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <Link href="/products" className="hover:text-[#D4AF76] transition-colors">Collections</Link>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[#2C2C2C] dark:text-gray-200 font-light line-clamp-1">{product.name}</span>
                </motion.nav>

                {/* Product Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                    {/* Images Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        {/* Mobile Swipeable Gallery */}
                        <div className="lg:hidden">
                            <MobileImageGallery 
                                images={displayImages} 
                                productName={product.name}
                                isOutOfStock={isOutOfStock}
                                effectiveStock={effectiveStock}
                                discount={discount}
                            />
                        </div>

                        {/* Desktop Main Image */}
                        <div className="hidden lg:block bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-lg dark:shadow-none dark:border dark:border-white/[0.06] overflow-hidden">
                            <div className="aspect-square relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full"
                                    >
                                        <SafeImage
                                            src={currentImage}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    </motion.div>
                                </AnimatePresence>
                                
                                {/* Stock Badge */}
                                {!isOutOfStock && effectiveStock > 0 && effectiveStock <= 5 && (
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-4 py-2 shadow-lg">
                                        <span className="text-sm font-medium">Only {effectiveStock} left!</span>
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-4 py-2 shadow-lg">
                                        <span className="text-sm font-medium">Out of Stock</span>
                                    </div>
                                )}
                                
                                {/* Discount Badge */}
                                {discount > 0 && (
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-4 py-2 shadow-lg">
                                        <span className="text-sm font-medium">{discount}% OFF</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Thumbnail Images */}
                        {displayImages.length > 1 && (
                            <div className="hidden lg:grid grid-cols-4 gap-4">
                                {displayImages.map((img, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-2xl overflow-hidden transition-all ${
                                            selectedImage === index 
                                                ? 'ring-4 ring-[#D4AF76] shadow-lg' 
                                                : 'ring-2 ring-gray-200 dark:ring-white/[0.06] hover:ring-[#D4AF76]/50'
                                        }`}
                                    >
                                        <SafeImage
                                            src={img}
                                            alt={`${product.name} ${index + 1}`}
                                            width={200}
                                            height={200}
                                            className="object-cover w-full h-full"
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Category & Share */}
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 bg-[#D4AF76]/10 text-[#8B6B4C] px-4 py-2 rounded-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span className="text-sm font-light tracking-wide">{typeof product.category === 'object' ? (typeof product.category.name === 'object' ? product.category.name?.name : product.category.name) : product.category}</span>
                            </div>
                            <button
                                onClick={handleShare}
                                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.08] hover:bg-[#D4AF76]/15 dark:hover:bg-[#D4AF76]/15 text-gray-600 dark:text-gray-400 hover:text-[#D4AF76] dark:hover:text-[#D4AF76] transition-all duration-200"
                                aria-label="Share product"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] dark:text-gray-100 leading-tight">
                            {product.name}
                        </h1>

                        {/* SKU */}
                        {product.sku && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                                SKU: <span className="font-medium">{product.sku}</span>
                            </p>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-4 py-4 border-y border-gray-200 dark:border-white/[0.06]">
                            <span className="text-4xl font-light text-[#2C2C2C] dark:text-gray-100">
                                ₹{currentPrice.sellingPrice?.toLocaleString('en-IN')}
                            </span>
                            {currentPrice.mrp && currentPrice.mrp > currentPrice.sellingPrice && (
                                <>
                                    <span className="text-xl text-gray-400 line-through font-light">
                                        ₹{currentPrice.mrp.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full">
                                        Save {discount}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Product Variants */}
                        {product?.hasVariants && (
                            <div className="bg-gradient-to-br from-[#FAFAFA] to-white dark:from-[#0A0A0A] dark:to-[#111] rounded-2xl p-6 dark:border dark:border-white/[0.06]">
                                <h3 className="text-lg font-light text-[#2C2C2C] dark:text-gray-100 mb-4">Select Options</h3>
                                <ProductVariantSelector
                                    product={product}
                                    selectedVariant={selectedVariant}
                                    onVariantChange={handleVariantChange}
                                />
                            </div>
                        )}

                        {/* Stock Information */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-2xl p-4 dark:border dark:border-white/[0.06]">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300 font-light">Availability:</span>
                                <span className={`font-medium ${effectiveStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {effectiveStock > 0 ? (
                                        selectedVariant ? `${effectiveStock} in stock` : 
                                        product?.hasVariants ? `Total ${effectiveStock} available` :
                                        `${effectiveStock} in stock`
                                    ) : 'Out of stock'}
                                </span>
                            </div>
                            {product?.hasVariants && !selectedVariant && effectiveStock > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select a variant to see specific availability</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-light text-[#2C2C2C] dark:text-gray-100 mb-3">Description</h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Specifications */}
                        {(product.metal || product.metalType || product.weight || product.goldWeight || product.silverWeight || product.purity || product.goldPurity || product.silverPurity) && (
                            <div className="bg-gradient-to-br from-[#FAFAFA] to-white dark:from-[#0A0A0A] dark:to-[#111] rounded-2xl p-6 space-y-3 dark:border dark:border-white/[0.06]">
                                <h3 className="text-lg font-light text-[#2C2C2C] dark:text-gray-100 mb-4">Specifications</h3>
                                
                                {/* Metal Type */}
                                {(product.metal || product.metalType) && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-light">Metal:</span>
                                        <span className="text-[#2C2C2C] dark:text-gray-200 font-medium capitalize">
                                            {product.metal || product.metalType}
                                        </span>
                                    </div>
                                )}

                                {/* Gold specifications */}
                                {product.goldWeight > 0 && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400 font-light">Gold Weight:</span>
                                            <span className="text-[#2C2C2C] dark:text-gray-200 font-medium">{product.goldWeight}g</span>
                                        </div>
                                        {product.goldPurity && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400 font-light">Gold Purity:</span>
                                                <span className="text-[#2C2C2C] dark:text-gray-200 font-medium">{product.goldPurity}K</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Silver specifications */}
                                {product.silverWeight > 0 && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400 font-light">Silver Weight:</span>
                                            <span className="text-[#2C2C2C] dark:text-gray-200 font-medium">{product.silverWeight}g</span>
                                        </div>
                                        {product.silverPurity && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400 font-light">Silver Purity:</span>
                                                <span className="text-[#2C2C2C] dark:text-gray-200 font-medium">{product.silverPurity}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Legacy purity and weight fields */}
                                {product.purity && !product.goldPurity && !product.silverPurity && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-light">Purity:</span>
                                        <span className="text-[#2C2C2C] dark:text-gray-200 font-medium">{product.purity}</span>
                                    </div>
                                )}
                                {product.weight && !product.goldWeight && !product.silverWeight && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-light">Weight:</span>
                                        <span className="text-[#2C2C2C] dark:text-gray-200 font-medium">{product.weight}g</span>
                                    </div>
                                )}



                                {/* Stone value */}
                                {product.stoneValue > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-light">Stone Value:</span>
                                        <span className="text-[#2C2C2C] dark:text-gray-200 font-medium">₹{product.stoneValue.toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                {/* Dynamic pricing indicator */}
                                {product.isDynamicPricing && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-light">Pricing:</span>
                                        <span className="font-medium text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                                            Live Gold Rate
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {!isOutOfStock && (
                            <div className="space-y-3">
                                <label className="text-lg font-light text-[#2C2C2C] dark:text-gray-100">Quantity</label>
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 rounded-full bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] hover:border-[#D4AF76] text-[#2C2C2C] dark:text-gray-200 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={quantity <= 1}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </motion.button>
                                    <span className="text-2xl font-light text-[#2C2C2C] dark:text-gray-100 min-w-[3rem] text-center">{quantity}</span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setQuantity(Math.min(effectiveStock || 999, quantity + 1))}
                                        className="w-12 h-12 rounded-full bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] hover:border-[#D4AF76] text-[#2C2C2C] dark:text-gray-200 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={quantity >= (effectiveStock || 999)}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        {!isOutOfStock ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCart}
                                disabled={addingToCart || (product?.hasVariants && !selectedVariant)}
                                className={`w-full py-4 px-8 rounded-full font-light text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                                    addingToCart
                                        ? 'bg-[#D4AF76] text-white'
                                        : (product?.hasVariants && !selectedVariant)
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white hover:shadow-xl'
                                }`}
                            >
                                {addingToCart ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Adding to Cart...
                                    </>
                                ) : product?.hasVariants && !selectedVariant ? (
                                    'Please Select Options'
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Add to Cart
                                    </>
                                )}
                            </motion.button>
                        ) : (
                            <div className="w-full py-4 px-8 rounded-full font-light text-lg flex items-center justify-center gap-3 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Out of Stock
                            </div>
                        )}

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Authentic</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">100% Genuine</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Warranty</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">1 Year</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Secure</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Safe Payment</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Free Shipping</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">On All Orders</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mt-16"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-light text-[#2C2C2C] dark:text-gray-100 mb-2">
                                    Similar Products
                                </h2>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-light">
                                    {product?.subcategory?.name || product?.category 
                                        ? `More from ${product?.subcategory?.name || product?.category}` 
                                        : 'You may also like these'
                                    }
                                </p>
                            </div>
                            <Link 
                                href={`/products${
                                    product?.subcategory?._id 
                                        ? `?category=${encodeURIComponent(typeof product.category === 'object' ? product.category?.name : product.category)}&subcategory=${product.subcategory._id}` 
                                        : product?.category 
                                        ? `?category=${encodeURIComponent(typeof product.category === 'object' ? product.category?.name : product.category)}` 
                                        : ''
                                }`}
                                className="hidden md:flex items-center gap-2 text-sm text-[#D4AF76] hover:text-[#8B6B4C] transition-colors font-medium"
                            >
                                View All
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {relatedProducts.map((relatedProduct, index) => (
                                <Link 
                                    key={relatedProduct._id} 
                                    href={`/products/${relatedProduct._id}`}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -8 }}
                                        className="group cursor-pointer"
                                    >
                                        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-white/[0.06]">
                                            <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                                                <SafeImage
                                                    src={relatedProduct.images?.[0]?.url || relatedProduct.image}
                                                    alt={relatedProduct.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                {/* Quick View Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                                    <span className="text-white text-sm font-medium">View Details</span>
                                                </div>
                                            </div>
                                            <div className="p-3 md:p-4">
                                                <h3 className="text-sm md:text-base font-light text-[#2C2C2C] dark:text-gray-200 mb-1 md:mb-2 line-clamp-2 group-hover:text-[#D4AF76] transition-colors leading-tight">
                                                    {relatedProduct.name}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-base md:text-lg font-medium text-[#2C2C2C] dark:text-gray-100">
                                                        ₹{relatedProduct.sellingPrice?.toLocaleString('en-IN')}
                                                    </p>
                                                    {relatedProduct.mrp && relatedProduct.mrp > relatedProduct.sellingPrice && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ₹{relatedProduct.mrp.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                        {/* Mobile View All Button */}
                        <div className="md:hidden mt-6 text-center">
                            <Link 
                                href={`/products${
                                    product?.subcategory?._id 
                                        ? `?category=${encodeURIComponent(typeof product.category === 'object' ? product.category?.name : product.category)}&subcategory=${product.subcategory._id}` 
                                        : product?.category 
                                        ? `?category=${encodeURIComponent(typeof product.category === 'object' ? product.category?.name : product.category)}` 
                                        : ''
                                }`}
                                className="inline-flex items-center gap-2 text-sm text-[#D4AF76] hover:text-[#8B6B4C] transition-colors font-medium"
                            >
                                View All Similar Products
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
