'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Star, ArrowLeft, Check, Play } from 'lucide-react';
import { Button } from '@aanandini/ui';
import { useCart } from '@/providers/cart-provider';
import * as api from '@/lib/api';

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { addItem } = useCart();

    const [product, setProduct] = useState<api.Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [added, setAdded] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(0);

    // Combine images and videos into a single media array
    const mediaItems: { type: 'image' | 'video'; url: string }[] = [];
    if (product) {
        product.images.forEach((url) => mediaItems.push({ type: 'image', url }));
        if (product.videos) {
            product.videos.forEach((url) => mediaItems.push({ type: 'video', url }));
        }
    }

    useEffect(() => {
        api
            .getProduct(id)
            .then(setProduct)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '',
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
                    <div className="aspect-square rounded-2xl bg-slate-200" />
                    <div className="space-y-4 py-4">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                        <div className="h-8 w-3/4 bg-slate-200 rounded" />
                        <div className="h-4 w-full bg-slate-200 rounded" />
                        <div className="h-4 w-2/3 bg-slate-200 rounded" />
                        <div className="h-10 w-32 bg-slate-200 rounded mt-6" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="text-6xl mb-4">😕</div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h1>
                <p className="text-slate-500 mb-6">{error || 'This product does not exist.'}</p>
                <Link href="/products">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Products
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-20">
            {/* Breadcrumb - Minimal */}
            <div className="bg-white border-b border-stone-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-medium">
                        <Link href="/" className="hover:text-brand-800 transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-brand-800 transition-colors">
                            Collection
                        </Link>
                        <span>/</span>
                        <span className="text-stone-900 truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Media Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative">
                            {mediaItems[selectedMedia] ? (
                                mediaItems[selectedMedia].type === 'video' ? (
                                    <video
                                        key={mediaItems[selectedMedia].url}
                                        src={mediaItems[selectedMedia].url}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={mediaItems[selectedMedia].url}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-opacity duration-300"
                                    />
                                )
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <span className="text-8xl font-serif text-stone-300">
                                        {product.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                        {mediaItems.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {mediaItems.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedMedia(idx)}
                                        className={`shrink-0 h-24 w-20 overflow-hidden border transition-all relative ${selectedMedia === idx
                                            ? 'border-brand-800 opacity-100'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        {media.type === 'video' ? (
                                            <>
                                                <video src={media.url} preload="metadata" muted className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <Play className="h-5 w-5 text-white fill-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <img src={media.url} alt="" className="h-full w-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col pt-4">
                        <div className="flex-1">
                            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-800 mb-4">
                                {product.category?.name || 'Exclusive Handloom'}
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mb-4 leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating summary */}
                            {product.reviews && product.reviews.length > 0 && (
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const avg =
                                                product.reviews!.reduce((s, r) => s + r.rating, 0) /
                                                product.reviews!.length;
                                            return (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${star <= avg
                                                        ? 'fill-brand-700 text-brand-700'
                                                        : 'text-stone-300'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className="text-xs text-stone-500 uppercase tracking-wide">
                                        ({product.reviews.length} review{product.reviews.length !== 1 && 's'})
                                    </span>
                                </div>
                            )}

                            <div className="text-2xl font-serif text-stone-900 mb-8">
                                ₹{product.price.toLocaleString()}
                                <span className="text-sm text-stone-500 font-sans font-light ml-2">
                                    (Inclusive of all taxes)
                                </span>
                            </div>

                            <div className="prose prose-stone prose-sm mb-10 text-stone-600 font-light leading-relaxed">
                                {product.description}
                                <p className="mt-4">
                                    Handwoven with precision, this piece represents the heritage of Indian craftsmanship.
                                    Perfect for weddings, festivities, and special occasions.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-8 text-sm">
                                {product.stock > 0 ? (
                                    <div className="flex items-center gap-2 text-emerald-800">
                                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                        In Stock & Ready to Ship
                                    </div>
                                ) : (
                                    <span className="text-red-800 font-medium">
                                        Currently Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4 max-w-md">
                                <Button
                                    size="lg"
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className="w-full bg-stone-900 hover:bg-brand-900 text-white rounded-none uppercase tracking-widest text-xs font-bold py-6"
                                >
                                    {added ? (
                                        <span className="flex items-center gap-2">
                                            <Check className="h-4 w-4" /> Added to Bag
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Add to Shopping Bag
                                        </span>
                                    )}
                                </Button>
                                <div className="grid grid-cols-2 gap-4 text-center text-xs text-stone-500 mt-2 font-medium">
                                    <div className="border border-stone-200 py-3 uppercase tracking-wider">
                                        Free Shipping
                                    </div>
                                    <div className="border border-stone-200 py-3 uppercase tracking-wider">
                                        Authentic Handloom
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="mt-24 border-t border-stone-200 pt-16 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-serif text-stone-900 mb-10 text-center">
                            Client Stories & Reviews
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="bg-stone-50 p-8 relative">
                                    {/* Quote Icon */}
                                    <div className="absolute top-4 left-4 text-stone-200 text-6xl font-serif leading-none opacity-50">"</div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-serif font-bold text-lg">
                                                    {review.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block font-medium text-stone-900 text-sm">{review.user.name}</span>
                                                    <div className="flex text-brand-600">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-stone-300 !fill-none'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-stone-400">Verified Buyer</span>
                                        </div>
                                        <p className="text-stone-600 text-sm leading-relaxed italic">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
