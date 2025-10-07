"use client";
import { useCart } from '../../context/CartContext';

export default function CheckoutSummary({ appliedCoupon, originalTotal, finalTotal }) {
    const { cartItems } = useCart();

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const displayTotal = originalTotal || calculateTotal();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <div className="divide-y">
                {cartItems.map((item) => (
                    <div key={item._id || item.product} className="py-4 flex justify-between">
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{displayTotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                        <span>Coupon Discount ({appliedCoupon.couponCode})</span>
                        <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>₹{(finalTotal || displayTotal).toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}