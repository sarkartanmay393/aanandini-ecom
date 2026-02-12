'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Star, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@anandibi/ui';
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
    const [selectedImage, setSelectedImage] = useState(0);

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
        <div className="animate-fade-in">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-sm text-slate-500">
                        <Link href="/" className="hover:text-brand-600 transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-brand-600 transition-colors">
                            Products
                        </Link>
                        <span>/</span>
                        <span className="text-slate-900 font-medium truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                            {product.images[selectedImage] ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <span className="text-8xl font-bold text-slate-300">
                                        {product.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                                ? 'border-brand-500 ring-2 ring-brand-200'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="flex-1">
                            <span className="inline-block text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-3">
                                {product.category?.name}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                                {product.name}
                            </h1>

                            {/* Rating summary */}
                            {product.reviews && product.reviews.length > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const avg =
                                                product.reviews!.reduce((s, r) => s + r.rating, 0) /
                                                product.reviews!.length;
                                            return (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${star <= avg
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-300'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        ({product.reviews.length} review{product.reviews.length !== 1 && 's'})
                                    </span>
                                </div>
                            )}

                            <p className="text-slate-600 leading-relaxed mb-6">{product.description}</p>

                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-3xl font-bold text-slate-900">
                                    ₹{product.price.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-8">
                                {product.stock > 0 ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                                        <Check className="h-3.5 w-3.5" />
                                        In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Add to cart */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                size="lg"
                                className="flex-1 gap-2"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                            >
                                {added ? (
                                    <>
                                        <Check className="h-5 w-5" /> Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-5 w-5" /> Add to Cart
                                    </>
                                )}
                            </Button>
                            <Link href="/cart" className="flex-1 sm:flex-initial">
                                <Button variant="outline" size="lg" className="w-full">
                                    View Cart
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="mt-16 border-t border-slate-200 pt-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">
                            Customer Reviews ({product.reviews.length})
                        </h2>
                        <div className="space-y-6">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium text-sm">
                                                {review.user.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-900">{review.user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-3.5 w-3.5 ${star <= review.rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
