"use client";
import { Suspense, use } from 'react';
import ProductDetail from './ProductDetail';

function ProductDetailContent({ params }) {
    const resolvedParams = use(params);
    return <ProductDetail productId={resolvedParams.id} />;
}

export default function ProductPage({ params }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-gradient-to-b from-white to-[#FAFAFA] dark:from-black dark:to-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Image skeleton */}
                        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl shimmer"></div>
                        {/* Details skeleton */}
                        <div className="space-y-4 py-4">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                            <div className="h-px bg-gray-200 dark:bg-gray-800 my-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded shimmer"></div>
                                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded shimmer"></div>
                                <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded shimmer"></div>
                            </div>
                            <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl mt-6 shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ProductDetailContent params={params} />
        </Suspense>
    );
}
