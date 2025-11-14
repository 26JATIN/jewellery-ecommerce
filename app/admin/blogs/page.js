'use client';

import { Suspense } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import BlogManagement from '@/app/components/BlogManagement';

export default function AdminBlogsPage() {
    return (
        <AdminLayout>
            <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
                <BlogManagement />
            </Suspense>
        </AdminLayout>
    );
}
