import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import connectDB from '@/lib/mongodb';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();
        let cart = await Cart.findOne({ user: decoded.userId }).populate('items.product');

        if (cart) {
            let itemsModified = false;
            
            // Filter out invalid products and check stock
            const validItems = [];
            
            for (const item of cart.items) {
                // Skip if product doesn't exist (was deleted)
                if (!item.product) {
                    console.log('Removing deleted product from cart');
                    itemsModified = true;
                    continue;
                }
                
                // Skip if product is inactive
                if (!item.product.isActive) {
                    console.log(`Removing inactive product: ${item.product.name}`);
                    itemsModified = true;
                    continue;
                }
                
                // Handle stock checking for variants
                let currentStock = item.product.stock;
                
                if (item.variantId && item.product.hasVariants) {
                    const variant = item.product.variants.id(item.variantId);
                    if (!variant || !variant.isActive) {
                        console.log(`Removing invalid variant from cart: ${item.product.name}`);
                        itemsModified = true;
                        continue;
                    }
                    currentStock = variant.stock;
                }
                
                // Check stock and adjust quantity if needed
                if (currentStock <= 0) {
                    console.log(`Removing out-of-stock product/variant: ${item.product.name}`);
                    itemsModified = true;
                    continue;
                }
                
                // If quantity exceeds stock, adjust it
                if (item.quantity > currentStock) {
                    console.log(`Adjusting quantity for ${item.product.name} from ${item.quantity} to ${currentStock}`);
                    item.quantity = currentStock;
                    itemsModified = true;
                }
                
                validItems.push(item);
            }
            
            // If any items were modified, update the cart
            if (itemsModified) {
                cart = await Cart.findOneAndUpdate(
                    { user: decoded.userId },
                    { $set: { items: validItems } },
                    { new: true }
                ).populate('items.product');
            }
        }

        return NextResponse.json(cart || { items: [] });
    } catch (error) {
        console.error('Cart fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' }, 
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' }, 
                { status: 401 }
            );
        }

        const { product } = await req.json();
        if (!product) {
            return NextResponse.json(
                { error: 'Product data is required' }, 
                { status: 400 }
            );
        }

        // Validate required product fields
        const productId = product._id || product.id;
        if (!productId) {
            return NextResponse.json(
                { error: 'Invalid product data. Missing required fields (id).' }, 
                { status: 400 }
            );
        }

        await connectDB();

        // Fetch the actual product from database to check stock
        const dbProduct = await Product.findById(productId);
        if (!dbProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if product is active
        if (!dbProduct.isActive) {
            return NextResponse.json(
                { error: 'This product is no longer available' },
                { status: 400 }
            );
        }

        // Handle variant validation
        let currentStock = dbProduct.stock;
        let selectedVariant = null;
        
        if (product.variantId && dbProduct.hasVariants) {
            selectedVariant = dbProduct.variants.id(product.variantId);
            if (!selectedVariant) {
                return NextResponse.json(
                    { error: 'Selected variant not found' },
                    { status: 400 }
                );
            }
            
            if (!selectedVariant.isActive) {
                return NextResponse.json(
                    { error: 'Selected variant is no longer available' },
                    { status: 400 }
                );
            }
            
            currentStock = selectedVariant.stock;
        } else if (dbProduct.hasVariants && !product.variantId) {
            return NextResponse.json(
                { error: 'Please select a variant for this product' },
                { status: 400 }
            );
        }

        // Check stock availability
        if (currentStock <= 0) {
            return NextResponse.json(
                { error: 'This product/variant is out of stock' },
                { status: 400 }
            );
        }

        let cart = await Cart.findOne({ user: decoded.userId });
        
        // Create cart item with variant support
        const cartItem = {
            product: productId, // Store as ObjectId (mongoose will convert)
            name: product.name,
            price: selectedVariant?.price?.sellingPrice || product.sellingPrice,
            image: selectedVariant?.images?.[0]?.url || product.image,
            quantity: product.quantity || 1,
            variantId: product.variantId || null,
            selectedVariant: selectedVariant ? {
                sku: selectedVariant.sku,
                optionCombination: selectedVariant.optionCombination,
                price: selectedVariant.price,
                images: selectedVariant.images
            } : null,
            cartKey: product.cartKey || (product.variantId ? `${productId}_${product.variantId}` : productId.toString())
        };
        
        // Use atomic operations to prevent race conditions
        if (!cart) {
            // Create new cart
            cart = await Cart.create({
                user: decoded.userId,
                items: [cartItem]
            });
        } else {
            // Check if item already exists (considering variants)
            const existingItem = cart.items.find(
                item => item.cartKey === cartItem.cartKey
            );

            if (existingItem) {
                const newQuantity = existingItem.quantity + (product.quantity || 1);
                
                // Check if adding more would exceed stock
                if (newQuantity > currentStock) {
                    return NextResponse.json(
                        { error: `Only ${currentStock} items available in stock` },
                        { status: 400 }
                    );
                }

                // Use atomic $inc to increment quantity
                cart = await Cart.findOneAndUpdate(
                    { 
                        user: decoded.userId,
                        'items.cartKey': cartItem.cartKey
                    },
                    { 
                        $inc: { 'items.$.quantity': (product.quantity || 1) } 
                    },
                    { new: true }
                );
            } else {
                // Use atomic $push to add new item
                cart = await Cart.findOneAndUpdate(
                    { user: decoded.userId },
                    { $push: { items: cartItem } },
                    { new: true }
                );
            }
        }

        // Check if cart operation failed
        if (!cart) {
            // Fallback: fetch cart again
            cart = await Cart.findOne({ user: decoded.userId });
            if (!cart) {
                return NextResponse.json(
                    { error: 'Failed to update cart' },
                    { status: 500 }
                );
            }
        }

        // Populate product details for response
        await cart.populate('items.product');

        return NextResponse.json({ 
            items: cart.items,
            message: 'Cart updated successfully' 
        });
    } catch (error) {
        console.error('Cart update error:', error);
        return NextResponse.json(
            { error: 'Failed to update cart' }, 
            { status: 500 }
        );
    }
}