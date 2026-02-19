"use client";
import { Suspense } from 'react';
import ProductsPage from "../components/ProductsPage";

// Force dynamic rendering to avoid SSG issues with useSearchParams
export const dynamic = 'force-dynamic';

function ProductsContent() {
  return <ProductsPage />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter bar skeleton */}
          <div className="flex gap-3 mb-6">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer"></div>
            <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer"></div>
          </div>
          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 shimmer"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}