'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@anandibi/ui';
import { useCart } from '@/providers/cart-provider';
import type { Product } from '@/lib/api';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '',
        });
    };

    return (
        <Link href={`/products/${product.id}`} className="group block">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {product.images[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <div className="text-4xl font-bold text-slate-300">
                                {product.name.charAt(0)}
                            </div>
                        </div>
                    )}
                    {/* Quick add button */}
                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Button
                            size="sm"
                            className="w-full gap-2"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                        </Button>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <p className="text-xs font-medium text-brand-600 mb-1">
                        {product.category?.name}
                    </p>
                    <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {product.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900">
                            ₹{product.price.toLocaleString()}
                        </span>
                        {product.stock > 0 ? (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                In Stock
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
