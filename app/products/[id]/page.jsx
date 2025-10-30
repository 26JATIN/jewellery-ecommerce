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
        }>
            <ProductDetailContent params={params} />
        </Suspense>
    );
}
