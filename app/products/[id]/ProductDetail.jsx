"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SafeImage from '../../components/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function ProductDetail({ productId }) {
    const router = useRouter();
    const { addToCart, setIsCartOpen } = useCart();
    const { user, triggerLoginModal } = useAuth();
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/products/${productId}`);
            
            if (response.ok) {
                const data = await response.json();
                setProduct(data);
                
                // Fetch related products
                if (data.category) {
                    fetchRelatedProducts(data.category, productId);
                }
            } else {
                setError('Product not found');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (category, currentProductId) => {
        try {
            const response = await fetch(`/api/products?category=${category}&limit=4`);
            if (response.ok) {
                const data = await response.json();
                // Filter out current product
                const filtered = data.filter(p => p._id !== currentProductId);
                setRelatedProducts(filtered.slice(0, 4));
            }
        } catch (error) {
            console.error('Error fetching related products:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            triggerLoginModal();
            return;
        }

        setAddingToCart(true);
        try {
            await addToCart(product, quantity);
            setIsCartOpen(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    const images = product?.images || (product?.image ? [product.image] : []);
    const currentImage = images[selectedImage] || images[0];

    if (loading) {
        return (
            <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-gradient-to-b from-white to-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="relative mb-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D4AF76]/20"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#D4AF76] absolute top-0 left-0"></div>
                        </div>
                        <p className="text-gray-600 font-light">Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-gradient-to-b from-white to-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="bg-red-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-light text-gray-900 mb-3">Product Not Found</h3>
                        <p className="text-gray-600 font-light mb-6">
                            The product you're looking for doesn't exist or has been removed.
                        </p>
                        <Link href="/collections">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-[#8B6B4C] text-white rounded-full hover:bg-[#7A5D42] transition-colors font-light shadow-lg"
                            >
                                Browse Collections
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    const discount = product.mrp && product.sellingPrice && product.mrp > product.sellingPrice
        ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white pt-4 md:pt-6 lg:pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <motion.nav 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-sm text-gray-500 mb-8"
                >
                    <Link href="/" className="hover:text-[#D4AF76] transition-colors">Home</Link>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <Link href="/collections" className="hover:text-[#D4AF76] transition-colors">Collections</Link>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[#2C2C2C] font-light line-clamp-1">{product.name}</span>
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
                        {/* Main Image */}
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
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
                                {product.stock <= 5 && product.stock > 0 && (
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-4 py-2 shadow-lg">
                                        <span className="text-sm font-medium">Only {product.stock} left!</span>
                                    </div>
                                )}
                                {product.stock === 0 && (
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

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-2xl overflow-hidden transition-all ${
                                            selectedImage === index 
                                                ? 'ring-4 ring-[#D4AF76] shadow-lg' 
                                                : 'ring-2 ring-gray-200 hover:ring-[#D4AF76]/50'
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
                        {/* Category */}
                        <div className="inline-flex items-center gap-2 bg-[#D4AF76]/10 text-[#8B6B4C] px-4 py-2 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-sm font-light tracking-wide">{product.category}</span>
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] leading-tight">
                            {product.name}
                        </h1>

                        {/* SKU */}
                        {product.sku && (
                            <p className="text-sm text-gray-500 font-light">
                                SKU: <span className="font-medium">{product.sku}</span>
                            </p>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-4 py-4 border-y border-gray-200">
                            <span className="text-4xl font-light text-[#2C2C2C]">
                                ₹{product.sellingPrice?.toLocaleString('en-IN')}
                            </span>
                            {product.mrp && product.mrp > product.sellingPrice && (
                                <>
                                    <span className="text-xl text-gray-400 line-through font-light">
                                        ₹{product.mrp.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                                        Save {discount}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-light text-[#2C2C2C] mb-3">Description</h3>
                            <p className="text-gray-600 font-light leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Specifications */}
                        {(product.metal || product.weight || product.purity) && (
                            <div className="bg-gradient-to-br from-[#FAFAFA] to-white rounded-2xl p-6 space-y-3">
                                <h3 className="text-lg font-light text-[#2C2C2C] mb-4">Specifications</h3>
                                {product.metal && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-light">Metal:</span>
                                        <span className="text-[#2C2C2C] font-medium">{product.metal}</span>
                                    </div>
                                )}
                                {product.purity && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-light">Purity:</span>
                                        <span className="text-[#2C2C2C] font-medium">{product.purity}</span>
                                    </div>
                                )}
                                {product.weight && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-light">Weight:</span>
                                        <span className="text-[#2C2C2C] font-medium">{product.weight}g</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="space-y-3">
                            <label className="text-lg font-light text-[#2C2C2C]">Quantity</label>
                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-[#D4AF76] text-[#2C2C2C] flex items-center justify-center transition-colors shadow-sm"
                                    disabled={quantity <= 1}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </motion.button>
                                <span className="text-2xl font-light text-[#2C2C2C] min-w-[3rem] text-center">{quantity}</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                                    className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-[#D4AF76] text-[#2C2C2C] flex items-center justify-center transition-colors shadow-sm"
                                    disabled={quantity >= (product.stock || 999)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || addingToCart}
                            className={`w-full py-4 px-8 rounded-full font-light text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                                product.stock === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : addingToCart
                                    ? 'bg-[#D4AF76] text-white'
                                    : 'bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white hover:shadow-xl'
                            }`}
                        >
                            {addingToCart ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Adding to Cart...
                                </>
                            ) : product.stock === 0 ? (
                                'Out of Stock'
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </motion.button>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C]">Authentic</p>
                                    <p className="text-xs text-gray-500 font-light">100% Genuine</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C]">Warranty</p>
                                    <p className="text-xs text-gray-500 font-light">1 Year</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C]">Secure</p>
                                    <p className="text-xs text-gray-500 font-light">Safe Payment</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C]">Free Shipping</p>
                                    <p className="text-xs text-gray-500 font-light">On All Orders</p>
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
                    >
                        <h2 className="text-3xl font-light text-[#2C2C2C] mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link 
                                    key={relatedProduct._id} 
                                    href={`/products/${relatedProduct._id}`}
                                >
                                    <motion.div
                                        whileHover={{ y: -8 }}
                                        className="group"
                                    >
                                        <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                                            <div className="aspect-square relative overflow-hidden">
                                                <SafeImage
                                                    src={relatedProduct.images?.[0] || relatedProduct.image}
                                                    alt={relatedProduct.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-sm font-light text-[#2C2C2C] mb-2 line-clamp-1 group-hover:text-[#D4AF76] transition-colors">
                                                    {relatedProduct.name}
                                                </h3>
                                                <p className="text-lg font-light text-[#2C2C2C]">
                                                    ₹{relatedProduct.sellingPrice?.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
