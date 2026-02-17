"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '../../components/AdminLayout';
import withAdminAuth from '../../components/withAdminAuth';

function AdminHeroVideosPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchingProducts, setSearchingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        order: 0,
        isActive: true,
        duration: 0,
        linkedProductId: '',
        linkedProductSlug: ''
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                searchProducts(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/hero-videos');
            if (res.ok) {
                const data = await res.json();
                setVideos(data);
            }
        } catch (error) {
            console.error('Failed to fetch hero videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = async (query) => {
        setSearchingProducts(true);
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Failed to search products:', error);
        } finally {
            setSearchingProducts(false);
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setFormData({
            ...formData,
            linkedProductId: product._id,
            linkedProductSlug: product._id // Use product ID as the link
        });
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleProductRemove = () => {
        setSelectedProduct(null);
        setFormData({
            ...formData,
            linkedProductId: '',
            linkedProductSlug: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.videoUrl) {
            toast.warning('Please upload a video first');
            return;
        }

        try {
            const url = '/api/hero-videos';
            const method = editingVideo ? 'PUT' : 'POST';
            const body = editingVideo 
                ? { id: editingVideo._id, ...formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                await fetchVideos();
                resetForm();
                toast.success('Video saved successfully!');
            } else {
                const error = await res.json();
                toast.error('Failed to save video: ' + error.error);
            }
        } catch (error) {
            console.error('Error saving video:', error);
            toast.error('Failed to save video');
        }
    };

    const handleEdit = (video) => {
        setEditingVideo(video);
        setFormData({
            title: video.title,
            description: video.description || '',
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl || '',
            order: video.order,
            isActive: video.isActive,
            duration: video.duration || 0,
            linkedProductId: video.linkedProductId?._id || video.linkedProductId || '',
            linkedProductSlug: video.linkedProductSlug || (video.linkedProductId?._id || video.linkedProductId || '')
        });
        if (video.linkedProductId) {
            setSelectedProduct(video.linkedProductId);
        }
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const res = await fetch(`/api/hero-videos?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchVideos();
                toast.success('Video deleted successfully!');
            } else {
                toast.error('Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            toast.error('Failed to delete video');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            videoUrl: '',
            thumbnailUrl: '',
            order: 0,
            isActive: true,
            duration: 0,
            linkedProductId: '',
            linkedProductSlug: ''
        });
        setEditingVideo(null);
        setShowForm(false);
        setSelectedProduct(null);
        setSearchQuery('');
        setSearchResults([]);
    };

    const openCloudinaryWidget = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/mp4,video/webm,video/mov,video/avi';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file size (max 50MB for portrait videos)
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.size > maxSize) {
                toast.warning('Video file is too large. Please use a video under 50MB.');
                return;
            }

            setUploadingVideo(true);

            try {
                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('folder', 'hero-videos');

                console.log('Uploading video:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

                const response = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Upload failed');
                }

                const result = await response.json();
                console.log('Upload successful:', result);

                // Get video duration if available
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.onloadedmetadata = () => {
                    setFormData(prev => ({
                        ...prev,
                        videoUrl: result.publicId,
                        duration: Math.round(video.duration)
                    }));
                };

                setFormData(prev => ({
                    ...prev,
                    videoUrl: result.publicId
                }));

                toast.success('Video uploaded successfully!');
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Upload failed: ' + error.message);
            } finally {
                setUploadingVideo(false);
            }
        };

        input.click();
    };

    const toggleActive = async (video) => {
        try {
            const res = await fetch('/api/hero-videos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: video._id,
                    isActive: !video.isActive
                })
            });

            if (res.ok) {
                await fetchVideos();
            }
        } catch (error) {
            console.error('Error toggling video status:', error);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Hero Videos</h1>
                        <p className="text-gray-600 mt-2">Manage portrait videos showcasing jewelry on the homepage</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-[#D4AF76] text-white rounded-lg hover:bg-[#C19A65] transition"
                    >
                        {showForm ? 'Cancel' : '+ Add Video'}
                    </button>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Video Guidelines</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Use portrait/vertical videos (9:16 aspect ratio recommended)</li>
                                <li>• Keep videos short (10-30 seconds) for optimal engagement</li>
                                <li>• Maximum file size: 50MB</li>
                                <li>• Supported formats: MP4, WebM, MOV</li>
                                <li>• <strong>Link products:</strong> Search and link a product to make videos clickable and redirect users to that product</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingVideo ? 'Edit Video' : 'Add New Video'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Video Upload *
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={openCloudinaryWidget}
                                            disabled={uploadingVideo}
                                            className="px-6 py-3 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#75573F] transition disabled:opacity-50"
                                        >
                                            {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                                        </button>
                                        {formData.videoUrl && (
                                            <span className="text-green-600 flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Video uploaded
                                            </span>
                                        )}
                                    </div>
                                    {formData.videoUrl && (
                                        <p className="text-sm text-gray-500 mt-2">Public ID: {formData.videoUrl}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                        required
                                        placeholder="e.g., Gold Necklace Collection"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                        placeholder="Brief description of the video content..."
                                    />
                                </div>

                                {/* Product Linking */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link to Product (Optional)
                                    </label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        When users click on this video, they will be redirected to the linked product
                                    </p>
                                    
                                    {selectedProduct ? (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-start gap-4">
                                                {selectedProduct.images && selectedProduct.images[0] && (
                                                    <Image
                                                        src={selectedProduct.images[0]}
                                                        alt={selectedProduct.name}
                                                        width={80}
                                                        height={80}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                                                    {selectedProduct.sku && (
                                                        <p className="text-sm text-gray-600 mt-1">SKU: {selectedProduct.sku}</p>
                                                    )}
                                                    {selectedProduct.price && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Price: ₹{selectedProduct.price.toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleProductRemove}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                    title="Remove product link"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent pr-10"
                                                    placeholder="Search for products by name or SKU..."
                                                />
                                                {searchingProducts && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8B6B4C]"></div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Search Results Dropdown */}
                                            {searchResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                                                    {searchResults.map((product) => (
                                                        <button
                                                            key={product._id}
                                                            type="button"
                                                            onClick={() => handleProductSelect(product)}
                                                            className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-b-0"
                                                        >
                                                            {product.images && product.images[0] && (
                                                                <Image
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    width={64}
                                                                    height={64}
                                                                    className="w-16 h-16 object-cover rounded-lg"
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                                                                {product.sku && (
                                                                    <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
                                                                )}
                                                                {product.price && (
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        ₹{product.price.toLocaleString()}
                                                                    </p>
                                                                )}
                                                                {(product.category || product.subcategory) && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {typeof product.category === 'object' ? product.category?.name : product.category}
                                                                        {product.subcategory && ` / ${typeof product.subcategory === 'object' ? product.subcategory?.name : product.subcategory}`}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {searchQuery && !searchingProducts && searchResults.length === 0 && (
                                                <p className="text-sm text-gray-500 mt-2">No products found</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                        min="0"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#D4AF76] text-white rounded-lg hover:bg-[#C19A65] transition"
                                >
                                    {editingVideo ? 'Update Video' : 'Add Video'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Videos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div key={video._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="relative aspect-[9/16] bg-gray-100">
                                {video.videoUrl && (
                                    <video
                                        className="w-full h-full object-cover"
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        controls
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
                                )}
                            </div>
                            
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900">{video.title}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        video.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {video.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                {video.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                                )}
                                
                                {/* Linked Product Info */}
                                {video.linkedProductId && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            <span className="text-xs font-medium text-blue-900">Linked Product:</span>
                                        </div>
                                        <p className="text-sm text-blue-800 font-medium">
                                            {video.linkedProductId.name || 'Product'}
                                        </p>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span>Order: {video.order}</span>
                                    {video.duration > 0 && (
                                        <span>{video.duration}s</span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(video)}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => toggleActive(video)}
                                        className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                                    >
                                        {video.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(video._id)}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {videos.length === 0 && !showForm && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new hero video.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default withAdminAuth(AdminHeroVideosPage);
