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
        <section className="py-20 bg-[#FAFAFA]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">
                        Testimonials
                    </p>
                    <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] tracking-tight">
                        What Our Customers Say
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow"
                        >
                            <div className="mb-6">
                                <svg className="w-10 h-10 text-[#D4AF76] opacity-50" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                            </div>
                            <p className="text-gray-700 mb-8 font-light leading-relaxed">
                                {testimonial.text}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2C2C2C] to-[#D4AF76] flex items-center justify-center text-white font-light">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-normal text-[#2C2C2C]">{testimonial.name}</h3>
                                    <p className="text-sm text-[#D4AF76] font-light">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}