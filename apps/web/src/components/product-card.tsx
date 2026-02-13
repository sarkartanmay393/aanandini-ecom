'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/providers/cart-provider';
import type { Product } from '@/lib/api';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const [currentImage, setCurrentImage] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef(0);
    const touchDelta = useRef(0);

    const imageCount = product.images.length;
    const hasMultipleImages = imageCount > 1;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '',
        });
    };

    const nextImage = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImage(prev => (prev + 1) % imageCount);
    }, [imageCount]);

    const prevImage = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImage(prev => (prev - 1 + imageCount) % imageCount);
    }, [imageCount]);

    // Touch swipe support
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchDelta.current = e.touches[0].clientX - touchStartX.current;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (Math.abs(touchDelta.current) > 50) {
            e.preventDefault();
            if (touchDelta.current < 0) {
                setCurrentImage(prev => Math.min(prev + 1, imageCount - 1));
            } else {
                setCurrentImage(prev => Math.max(prev - 1, 0));
            }
        }
        touchDelta.current = 0;
    };

    return (
        <Link href={`/products/${product.id}`} className="group block h-full">
            <div className="relative h-full flex flex-col">
                {/* Image Container */}
                <div
                    className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-sm"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {product.images[currentImage] ? (
                        <img
                            src={product.images[currentImage]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-stone-300">
                            <span className="text-4xl font-serif">{product.name.charAt(0)}</span>
                        </div>
                    )}

                    {/* Badges */}
                    {product.stock <= 0 && (
                        <div className="absolute top-2 right-2 bg-stone-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider">
                            Sold Out
                        </div>
                    )}

                    {/* Navigation arrows (visible on hover) */}
                    {hasMultipleImages && isHovered && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors z-10"
                            >
                                <ChevronLeft className="h-4 w-4 text-stone-800" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors z-10"
                            >
                                <ChevronRight className="h-4 w-4 text-stone-800" />
                            </button>
                        </>
                    )}

                    {/* Dot indicators */}
                    {hasMultipleImages && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {product.images.slice(0, 5).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImage(idx); }}
                                    className={`rounded-full transition-all ${currentImage === idx
                                        ? 'w-2 h-2 bg-white shadow-md'
                                        : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/80'
                                        }`}
                                />
                            ))}
                            {imageCount > 5 && (
                                <span className="text-white text-[8px] font-bold ml-1">+{imageCount - 5}</span>
                            )}
                        </div>
                    )}

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-white/95 backdrop-blur-sm text-stone-900 py-3 text-xs uppercase font-bold tracking-widest hover:bg-brand-700 hover:text-white transition-colors shadow-lg"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="pt-4 flex-1 flex flex-col items-center text-center space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
                        {product.category?.name || 'Saree'}
                    </p>
                    <h3 className="font-serif text-lg text-stone-900 group-hover:text-brand-800 transition-colors">
                        {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-900">
                            ₹{product.price.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
