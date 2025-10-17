import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import Product from '@/models/Product';
import connectDB from '@/lib/mongodb';

// GET single category
export async function GET(request, { params }) {
    try {
        await connectDB();
        
        const { slug } = await params;
        const category = await Category.findOne({ slug, isActive: true });
        
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        // Update product count
        const productCount = await Product.countDocuments({ 
            category: category.name, 
            isActive: true 
        });
        category.productsCount = productCount;
        await category.save();
        
        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

// PUT update category
export async function PUT(request, { params }) {
    try {
        await connectDB();
        
        const { slug } = await params;
        const data = await request.json();
        
        const category = await Category.findOneAndUpdate(
            { slug },
            data,
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE category
export async function DELETE(request, { params }) {
    try {
        await connectDB();
        
        const { slug } = await params;
        
        // Check if category has products
        const category = await Category.findOne({ slug });
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        const productCount = await Product.countDocuments({ category: category.name });
        if (productCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with existing products' },
                { status: 400 }
            );
        }
        
        await Category.findOneAndDelete({ slug });
        
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}