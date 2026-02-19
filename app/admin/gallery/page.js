"use client";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import { CldImage, CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';
import withAdminAuth from '../../components/withAdminAuth';

function AdminGalleryPage() {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mediaType: 'image',
        mediaUrl: '',
        thumbnailUrl: '',
        alt: '',
        order: 0,
        isActive: true,
        tags: []
    });

    useEffect(() => {
        fetchGalleryItems();
    }, []);

    const fetchGalleryItems = async () => {
        try {
            const res = await fetch('/api/gallery');
            if (res.ok) {
                const data = await res.json();
                setGalleryItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch gallery items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = '/api/gallery';
            const method = editingItem ? 'PUT' : 'POST';
            const body = editingItem 
                ? { id: editingItem._id, ...formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                await fetchGalleryItems();
                resetForm();
            } else {
                toast.error('Failed to save gallery item');
            }
        } catch (error) {
            console.error('Error saving gallery item:', error);
            toast.error('Failed to save gallery item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            mediaType: item.mediaType,
            mediaUrl: item.mediaUrl,
            thumbnailUrl: item.thumbnailUrl || '',
            alt: item.alt || '',
            order: item.order,
            isActive: item.isActive,
            tags: item.tags || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await fetch(`/api/gallery?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchGalleryItems();
            } else {
                toast.error('Failed to delete gallery item');
            }
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            toast.error('Failed to delete gallery item');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            mediaType: 'image',
            mediaUrl: '',
            thumbnailUrl: '',
            alt: '',
            order: 0,
            isActive: true,
            tags: []
        });
        setEditingItem(null);
        setShowForm(false);
    };

    const openCloudinaryWidget = (fieldName = 'mediaUrl') => {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = formData.mediaType === 'video' 
            ? 'video/mp4,video/webm,video/mov,video/avi'
            : 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploadingMedia(true);

            try {
                // Create FormData
                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('folder', 'gallery');

                console.log('Uploading file:', file.name, 'Type:', file.type);

                // Upload to your backend API
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

                // Update form data with public ID
                setFormData(prev => ({
                    ...prev,
                    [fieldName]: result.publicId,
                    alt: prev.alt || file.name.replace(/\.[^/.]+$/, '') // Filename without extension
                }));

                toast.success('Upload successful!');
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Upload failed: ' + error.message);
            } finally {
                setUploadingMedia(false);
            }
        };

        input.click();
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Model Gallery</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-[#D4AF76] text-white rounded-lg hover:bg-[#C19A65] transition"
                    >
                        {showForm ? 'Cancel' : '+ Add Media'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingItem ? 'Edit Media' : 'Add New Media'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Media Type *
                                    </label>
                                    <select
                                        value={formData.mediaType}
                                        onChange={(e) => setFormData({...formData, mediaType: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                    >
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Media URL (Cloudinary Public ID) *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={formData.mediaUrl}
                                            onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                            placeholder="e.g., gallery/carousel1_abc123 or upload using button"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => openCloudinaryWidget('mediaUrl')}
                                            disabled={uploadingMedia}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {uploadingMedia ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    Upload {formData.mediaType === 'video' ? 'Video' : 'Image'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Click &quot;Upload&quot; to select from your computer or paste Cloudinary public ID directly
                                    </p>
                                    
                                    {/* Preview */}
                                    {formData.mediaUrl && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                            <div className="relative w-64 h-80 bg-gray-100 rounded-lg overflow-hidden">
                                                {formData.mediaType === 'image' ? (
                                                    <CldImage
                                                        src={formData.mediaUrl}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {formData.mediaType === 'video' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Thumbnail URL (Optional - for video preview)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.thumbnailUrl}
                                                onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                                placeholder="Optional: Upload a thumbnail image"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => openCloudinaryWidget('thumbnailUrl')}
                                                disabled={uploadingMedia}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Upload Thumbnail
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alt Text
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.alt}
                                        onChange={(e) => setFormData({...formData, alt: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                        placeholder="Descriptive text for accessibility"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                    placeholder="Optional description shown in the gallery"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="w-4 h-4 text-[#D4AF76] border-gray-300 rounded focus:ring-[#D4AF76]"
                                />
                                <label className="ml-2 text-sm text-gray-700">
                                    Active (Display on website)
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#D4AF76] text-white rounded-lg hover:bg-[#C19A65] transition"
                                >
                                    {editingItem ? 'Update' : 'Create'}
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

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="aspect-[4/5] bg-gray-200 shimmer"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 w-3/4 bg-gray-200 rounded shimmer"></div>
                                        <div className="h-3 w-1/2 bg-gray-100 rounded shimmer"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : galleryItems.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No media items yet. Add your first one!
                        </div>
                    ) : (
                        galleryItems.map((item) => (
                            <div key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden group">
                                <div className="relative aspect-[4/5] bg-gray-100">
                                    {item.mediaType === 'image' ? (
                                        <CldImage
                                            src={item.mediaUrl}
                                            alt={item.alt || item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {!item.isActive && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                            Inactive
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                        <span className="capitalize">{item.mediaType}</span>
                                        <span>Order: {item.order}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default withAdminAuth(AdminGalleryPage);
