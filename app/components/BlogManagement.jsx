'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Eye, Search, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
    'jewellery-care',
    'fashion-trends',
    'buying-guide',
    'company-news',
    'lifestyle',
    'other'
];

export default function BlogManagement() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [pagination, setPagination] = useState({});
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'other',
        tags: '',
        featuredImage: { url: '', alt: '' },
        isPublished: false,
        seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: ''
        }
    });

    useEffect(() => {
        fetchBlogs();
    }, [statusFilter, categoryFilter, searchTerm]);

    const fetchBlogs = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });
            
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/admin/blogs?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setBlogs(data.blogs);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                seo: {
                    ...formData.seo,
                    keywords: formData.seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
                }
            };

            const url = editingBlog 
                ? `/api/admin/blogs/${editingBlog._id}`
                : '/api/admin/blogs';
            
            const method = editingBlog ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                setShowForm(false);
                setEditingBlog(null);
                resetForm();
                fetchBlogs();
            } else {
                toast.error(data.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving blog:', error);
            toast.error('Failed to save blog');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;

        try {
            const response = await fetch(`/api/admin/blogs/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                fetchBlogs();
            } else {
                toast.error(data.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error('Failed to delete blog');
        }
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            content: blog.content,
            category: blog.category,
            tags: blog.tags?.join(', ') || '',
            featuredImage: blog.featuredImage || { url: '', alt: '' },
            isPublished: blog.isPublished,
            seo: {
                metaTitle: blog.seo?.metaTitle || '',
                metaDescription: blog.seo?.metaDescription || '',
                keywords: blog.seo?.keywords?.join(', ') || ''
            }
        });
        setImagePreview(blog.featuredImage?.url || '');
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            category: 'other',
            tags: '',
            featuredImage: { url: '', alt: '' },
            isPublished: false,
            seo: {
                metaTitle: '',
                metaDescription: '',
                keywords: ''
            }
        });
        setImagePreview('');
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'blogs');

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    featuredImage: {
                        ...prev.featuredImage,
                        url: data.url
                    }
                }));
                setImagePreview(data.url);
                toast.success('Image uploaded successfully');
            } else {
                toast.error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            featuredImage: { ...prev.featuredImage, url: '' }
        }));
        setImagePreview('');
    };

    if (showForm) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-light tracking-wide text-gray-900">
                        {editingBlog ? 'Edit Article' : 'Create New Article'}
                    </h2>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowForm(false);
                            setEditingBlog(null);
                            resetForm();
                        }}
                        className="rounded-full px-6 font-light border-gray-300 hover:border-[#D4AF76] hover:text-[#8B6B4C]"
                    >
                        Cancel
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <div>
                        <label className="block text-sm font-light mb-3 text-gray-700">Title *</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                    slug: generateSlug(e.target.value)
                                });
                            }}
                            required
                            className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-light mb-3 text-gray-700">Slug *</label>
                        <Input
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            required
                            className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-light mb-3 text-gray-700">Excerpt *</label>
                        <Textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows={3}
                            maxLength={500}
                            required
                            className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                        />
                        <p className="text-xs text-gray-500 mt-2 font-light">
                            {formData.excerpt.length}/500 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-light mb-3 text-gray-700">Content *</label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={18}
                            required
                            className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-light mb-3 text-gray-700">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-2xl focus:border-[#D4AF76] focus:ring-[#D4AF76] focus:outline-none font-light"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-light mb-3 text-gray-700">Tags</label>
                            <Input
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="gold, silver, trends (comma separated)"
                                className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-light mb-3 text-gray-700">Featured Image</label>
                        
                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-full h-64 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex gap-4">
                            <label className="flex-1">
                                <div className={`
                                    flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-2xl cursor-pointer
                                    transition-all hover:border-[#D4AF76] hover:bg-[#D4AF76]/5
                                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${imagePreview ? 'border-gray-200' : 'border-gray-300'}
                                `}>
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-[#D4AF76]"></div>
                                            <span className="text-sm font-light text-gray-600">Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 text-[#8B6B4C]" />
                                            <span className="text-sm font-light text-gray-700">
                                                {imagePreview ? 'Change Image' : 'Upload Image'}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 font-light">Maximum file size: 5MB. Supported formats: JPG, PNG, WebP</p>

                        {/* Alternative: URL Input */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-light">or enter URL</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    value={formData.featuredImage.url}
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        setFormData({
                                            ...formData,
                                            featuredImage: { ...formData.featuredImage, url }
                                        });
                                        setImagePreview(url);
                                    }}
                                    placeholder="https://..."
                                    className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                                />
                            </div>

                            <div>
                                <Input
                                    value={formData.featuredImage.alt}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        featuredImage: { ...formData.featuredImage, alt: e.target.value }
                                    })}
                                    placeholder="Image Alt Text"
                                    className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-light tracking-wide mb-6 text-gray-900">SEO Settings</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-light mb-3 text-gray-700">Meta Title</label>
                                <Input
                                    value={formData.seo.metaTitle}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        seo: { ...formData.seo, metaTitle: e.target.value }
                                    })}
                                    maxLength={60}
                                    className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                                />
                                <p className="text-xs text-gray-500 mt-2 font-light">
                                    {formData.seo.metaTitle.length}/60 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-light mb-3 text-gray-700">Meta Description</label>
                                <Textarea
                                    value={formData.seo.metaDescription}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        seo: { ...formData.seo, metaDescription: e.target.value }
                                    })}
                                    rows={2}
                                    maxLength={160}
                                    className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                                />
                                <p className="text-xs text-gray-500 mt-2 font-light">
                                    {formData.seo.metaDescription.length}/160 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-light mb-3 text-gray-700">Keywords</label>
                                <Input
                                    value={formData.seo.keywords}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        seo: { ...formData.seo, keywords: e.target.value }
                                    })}
                                    placeholder="jewellery, gold, fashion (comma separated)"
                                    className="rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#D4AF76]/10 to-[#B8956A]/5 rounded-2xl border border-[#D4AF76]/30">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-5 h-5 rounded border-[#D4AF76] text-[#D4AF76] focus:ring-[#D4AF76]"
                        />
                        <label htmlFor="isPublished" className="text-sm font-light text-gray-700">
                            Publish this article immediately
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button 
                            type="submit" 
                            className="flex-1 bg-gradient-to-r from-[#D4AF76] to-[#B8956A] hover:from-[#B8956A] hover:to-[#D4AF76] text-[#2C2C2C] rounded-full py-6 font-light shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {editingBlog ? 'Update Article' : 'Create Article'}
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-4xl font-light tracking-wide text-gray-900 mb-2">
                        Article Management
                    </h2>
                    <p className="text-gray-600 font-light">
                        Create and manage your blog articles
                    </p>
                </div>
                <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-[#D4AF76] to-[#B8956A] hover:from-[#B8956A] hover:to-[#D4AF76] text-[#2C2C2C] rounded-full px-8 py-6 font-light shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Article
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-lg mb-8 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 rounded-2xl border-gray-200 focus:border-[#D4AF76] focus:ring-[#D4AF76] font-light"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-3 border border-gray-200 rounded-2xl focus:border-[#D4AF76] focus:ring-[#D4AF76] focus:outline-none font-light"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="p-3 border border-gray-200 rounded-2xl focus:border-[#D4AF76] focus:ring-[#D4AF76] focus:outline-none font-light"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>

                    <Button 
                        variant="outline" 
                        onClick={() => fetchBlogs()}
                        className="rounded-full font-light border-gray-300 hover:border-[#D4AF76] hover:bg-[#D4AF76]/5"
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Blog List */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 border-4 border-[#D4AF76] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-light mt-4">Loading articles...</p>
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF76]/20 to-[#B8956A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search size={40} className="text-[#8B6B4C]" />
                    </div>
                    <p className="text-gray-500 font-light text-lg">No articles found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {blogs.map((blog) => (
                        <div 
                            key={blog._id} 
                            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            <div className="p-8">
                                <div className="flex items-start gap-6">
                                    {blog.featuredImage?.url && (
                                        <img
                                            src={blog.featuredImage.url}
                                            alt={blog.featuredImage.alt || blog.title}
                                            className="w-48 h-32 object-cover rounded-2xl flex-shrink-0"
                                        />
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-2xl font-light tracking-wide text-gray-900">{blog.title}</h3>
                                                    <span className={`px-4 py-1.5 text-xs font-light rounded-full ${
                                                        blog.isPublished 
                                                            ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200' 
                                                            : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200'
                                                    }`}>
                                                        {blog.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-600 font-light mb-4 line-clamp-2">{blog.excerpt}</p>
                                                
                                                <div className="flex items-center gap-4 text-sm text-gray-500 font-light">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF76]"></span>
                                                        {blog.category.replace(/-/g, ' ')}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Eye size={14} />
                                                        {blog.views || 0} views
                                                    </span>
                                                    <span>By: {blog.author?.name || 'Admin'}</span>
                                                    {blog.publishedAt && (
                                                        <span>
                                                            {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 flex-shrink-0">
                                                {blog.isPublished && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}
                                                        className="rounded-full h-10 w-10 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                                                    >
                                                        <Eye size={16} className="text-blue-500" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEdit(blog)}
                                                    className="rounded-full h-10 w-10 border-gray-300 hover:border-[#D4AF76] hover:bg-[#D4AF76]/5 transition-colors duration-200"
                                                >
                                                    <Edit size={16} className="text-[#8B6B4C]" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(blog._id)}
                                                    className="rounded-full h-10 w-10 border-red-300 hover:border-red-400 hover:bg-red-50 transition-colors duration-200"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        onClick={() => fetchBlogs(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        className="rounded-full px-6 font-light border-gray-300 hover:border-[#D4AF76] hover:bg-[#D4AF76]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </Button>
                    <span className="px-6 py-2 bg-gradient-to-r from-[#D4AF76]/20 to-[#B8956A]/10 rounded-full font-light text-[#8B6B4C] border border-[#D4AF76]/30">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => fetchBlogs(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className="rounded-full px-6 font-light border-gray-300 hover:border-[#D4AF76] hover:bg-[#D4AF76]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
