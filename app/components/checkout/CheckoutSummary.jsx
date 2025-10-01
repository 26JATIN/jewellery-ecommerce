"use client";
import { useCart } from '../../context/CartContext';

export default function CheckoutSummary() {
    const { cartItems } = useCart();

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

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
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}