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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}