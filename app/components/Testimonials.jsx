"use client";
import { motion } from "framer-motion";

export default function Testimonials() {
    const testimonials = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Bride",
            text: "The wedding collection exceeded my expectations. Every piece was absolutely stunning!"
        },
        {
            id: 2,
            name: "Emily Parker",
            role: "Fashion Blogger",
            text: "The quality and craftsmanship of their jewelry is unmatched. Highly recommend!"
        },
        {
            id: 3,
            name: "Michael Roberts",
            role: "Loyal Customer",
            text: "Outstanding customer service and beautiful pieces that last forever."
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-semibold text-center text-[#8B6B4C] mb-12">
                    What Our Customers Say
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-[#f8f5f2] p-8 rounded-lg text-center"
                        >
                            <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="font-medium text-gray-900">{testimonial.name}</h3>
                                <p className="text-sm text-[#8B6B4C]">{testimonial.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}