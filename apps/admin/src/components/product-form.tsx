'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AdminShell } from '@/components/admin-shell';
import { Button, Input } from '@aanandini/ui';
import * as api from '@/lib/api';
import { ArrowLeft, Save, Upload, X, GripVertical, Video, ImagePlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
    productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [videos, setVideos] = useState<string[]>([]);
    const [categories, setCategories] = useState<api.Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [error, setError] = useState('');
    const [loadingProduct, setLoadingProduct] = useState(!!productId);
    const [dragOver, setDragOver] = useState(false);
    const [dragIdx, setDragIdx] = useState<number | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!user || user.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        if (token) {
            api.getCategories(token).then(setCategories).catch(() => { });
            if (productId) {
                api.getProduct(token, productId)
                    .then((p) => {
                        setName(p.name);
                        setDescription(p.description);
                        setPrice(String(p.price));
                        setStock(String(p.stock));
                        setCategoryId(p.categoryId);
                        setImages(p.images || []);
                        setVideos((p as any).videos || []);
                    })
                    .catch((err) => setError(err.message))
                    .finally(() => setLoadingProduct(false));
            }
        }
    }, [user, token, isLoading, productId, router]);

    const handleImageUpload = useCallback(async (files: FileList | File[]) => {
        if (!token) return;
        const fileArray = Array.from(files).filter(f =>
            ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(f.type)
        );
        if (fileArray.length === 0) return;

        setUploading(true);
        setError('');
        try {
            const urls = await api.uploadImages(token, fileArray);
            setImages(prev => [...prev, ...urls]);
        } catch (err: any) {
            setError(err.message || 'Failed to upload images');
        } finally {
            setUploading(false);
        }
    }, [token]);

    const handleVideoUpload = useCallback(async (file: File) => {
        if (!token) return;
        if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
            setError('Only MP4, WebM, and MOV videos are supported');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setError('Video must be under 50MB');
            return;
        }

        setUploadingVideo(true);
        setError('');
        try {
            const url = await api.uploadVideo(token, file);
            setVideos(prev => [...prev, url]);
        } catch (err: any) {
            setError(err.message || 'Failed to upload video');
        } finally {
            setUploadingVideo(false);
        }
    }, [token]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) handleImageUpload(files);
    }, [handleImageUpload]);

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeVideo = (idx: number) => {
        setVideos(prev => prev.filter((_, i) => i !== idx));
    };

    // Simple drag reorder for images
    const handleDragStart = (idx: number) => setDragIdx(idx);
    const handleDragOverItem = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) return;
        setImages(prev => {
            const updated = [...prev];
            const [moved] = updated.splice(dragIdx, 1);
            updated.splice(idx, 0, moved);
            return updated;
        });
        setDragIdx(idx);
    };
    const handleDragEnd = () => setDragIdx(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSaving(true);
        setError('');

        const data: any = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            categoryId,
            images,
            videos,
        };

        try {
            if (productId) {
                await api.updateProduct(token, productId, data);
            } else {
                await api.createProduct(token, data);
            }
            router.push('/products');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/products"
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {productId ? 'Edit Product' : 'New Product'}
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200 mb-6">
                        {error}
                    </div>
                )}

                {loadingProduct ? (
                    <div className="animate-pulse space-y-6">
                        <div className="h-10 bg-slate-200 rounded w-full" />
                        <div className="h-32 bg-slate-200 rounded w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 bg-slate-200 rounded" />
                            <div className="h-10 bg-slate-200 rounded" />
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-5">
                            <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Basic Info</h2>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Product Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kanjivaram Silk — Peacock Teal" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the product..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Price (₹)</label>
                                    <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Stock</label>
                                    <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Category</label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white h-10"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Images Upload */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="font-semibold text-slate-900">Product Images</h2>
                                <span className="text-xs text-slate-400">{images.length} image{images.length !== 1 && 's'}</span>
                            </div>

                            {/* Drop zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
                                        <span className="text-sm text-brand-600 font-medium">Uploading images...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <ImagePlus className="h-8 w-8 text-slate-400" />
                                        <span className="text-sm text-slate-600 font-medium">Drop images here or click to browse</span>
                                        <span className="text-xs text-slate-400">JPEG, PNG, WebP • Max 5MB each</span>
                                    </div>
                                )}
                            </div>

                            {/* Image previews */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {images.map((url, idx) => (
                                        <div
                                            key={`${url}-${idx}`}
                                            draggable
                                            onDragStart={() => handleDragStart(idx)}
                                            onDragOver={(e) => handleDragOverItem(e, idx)}
                                            onDragEnd={handleDragEnd}
                                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${dragIdx === idx ? 'border-brand-500 opacity-50' : 'border-transparent hover:border-slate-300'
                                                }`}
                                        >
                                            <img src={url} alt="" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical className="h-3 w-3 inline-block" /> {idx === 0 ? 'Main' : idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Video Upload */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="font-semibold text-slate-900">Product Videos</h2>
                                <span className="text-xs text-slate-400">30 sec max • MP4, WebM</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                disabled={uploadingVideo}
                                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-400 hover:bg-slate-50 transition-colors"
                            >
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/mp4,video/webm,video/quicktime"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                                />
                                {uploadingVideo ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
                                        <span className="text-sm text-brand-600 font-medium">Uploading video...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Video className="h-8 w-8 text-slate-400" />
                                        <span className="text-sm text-slate-600 font-medium">Add product video</span>
                                        <span className="text-xs text-slate-400">Max 50MB • 30 seconds</span>
                                    </div>
                                )}
                            </button>

                            {videos.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {videos.map((url, idx) => (
                                        <div key={`${url}-${idx}`} className="relative group rounded-lg overflow-hidden border border-slate-200">
                                            <video src={url} controls className="w-full aspect-video object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeVideo(idx)}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <Link href="/products" className="w-full sm:w-auto">
                                <Button type="button" variant="outline" className="w-full">Cancel</Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={saving || uploading || uploadingVideo}
                                className="bg-slate-900 hover:bg-slate-800 text-white gap-2 w-full sm:w-auto"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AdminShell>
    );
}
