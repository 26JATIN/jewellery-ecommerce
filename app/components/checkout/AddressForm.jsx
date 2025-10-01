"use client";
import { useState } from 'react';

export default function AddressForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900">Shipping Address</h2>
            
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B6B4C] focus:ring-[#8B6B4C]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                    <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B6B4C] focus:ring-[#8B6B4C]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                    <input
                        type="text"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B6B4C] focus:ring-[#8B6B4C]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B6B4C] focus:ring-[#8B6B4C]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B6B4C] focus:ring-[#8B6B4C]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                        <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B6B4C] focus:ring-[#8B6B4C]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B6B4C] focus:ring-[#8B6B4C]"
                        >
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="IN">India</option>
                            {/* Add more countries as needed */}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{10}"
                            placeholder="1234567890"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B6B4C] focus:ring-[#8B6B4C]"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-[#8B6B4C] text-white py-2 px-4 rounded-md hover:bg-[#725939] transition-colors"
            >
                Place Order
            </button>
        </form>
    );
}