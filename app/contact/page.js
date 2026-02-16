"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus("success");
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });
            
            setTimeout(() => setSubmitStatus(null), 5000);
        }, 2000);
    };

    const contactInfo = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: "Visit Our Store",
            details: [
                "NANDIKA JEWELLERS",
                "Soni gali, kankali chok, malwa",
                "Barod, Madhya Pradesh 465550"
            ],
            link: "https://maps.google.com/?q=Soni+gali+kankali+chok+malwa+Barod+Madhya+Pradesh+465550"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: "Call Us",
            details: [
                "+91 XXXXX XXXXX",
                "Mon - Sat: 10:00 AM - 8:00 PM"
            ],
            link: "tel:+91XXXXXXXXXX"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: "Email Us",
            details: [
                "info@nandikajewellers.in",
                "support@nandikajewellers.in"
            ],
            link: "mailto:info@nandikajewellers.in"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            ),
            title: "Visit Website",
            details: [
                "www.nandikajewellers.in",
                "Proudly serving customers across India"
            ],
            link: "https://www.nandikajewellers.in"
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#F8F6F3] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D4AF76] to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#8B6B4C] to-transparent rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block mb-6">
                            <div className="text-sm md:text-base text-[#D4AF76] font-light tracking-[0.2em] uppercase relative">
                                Contact Nandika Jewellers
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2C2C] dark:text-gray-100 tracking-tight mb-6">
                            We&apos;re Here to Help
                            <br />
                            <span className="text-[#D4AF76]">You Shine</span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
                            Get in touch with us for product inquiries, custom designs, or after-sales support.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Introduction */}
            <section className="pb-16 relative">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                            Whether you&apos;re looking for the perfect engagement ring, need assistance with a recent order, or wish to design your own masterpiece — our dedicated team is here for you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-16 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
                        {contactInfo.map((info, index) => (
                            <motion.a
                                key={index}
                                href={info.link}
                                target={info.link.startsWith('http') ? '_blank' : '_self'}
                                rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group cursor-pointer"
                            >
                                <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-6 lg:p-8 h-full shadow-lg hover:shadow-2xl dark:shadow-none transition-all duration-500 border border-gray-100 dark:border-white/[0.06] group-hover:border-[#D4AF76]/30">
                                    {/* Icon */}
                                    <div className="mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                                            {info.icon}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-light text-[#2C2C2C] dark:text-gray-100 mb-4 group-hover:text-[#D4AF76] transition-colors">
                                        {info.title}
                                    </h3>

                                    {/* Details */}
                                    <div className="space-y-2">
                                        {info.details.map((detail, idx) => (
                                            <p key={idx} className="text-gray-600 dark:text-gray-400 font-light text-sm leading-relaxed">
                                                {detail}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Store Info Section */}
            <section className="py-16 lg:py-24 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-8 lg:p-12 shadow-xl dark:shadow-none border border-gray-100 dark:border-white/[0.06]">
                                <h2 className="text-3xl md:text-4xl font-light text-[#2C2C2C] dark:text-gray-100 mb-6">
                                    Send us a Message
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 font-light mb-8">
                                    Fill out the form below and we&apos;ll get back to you within 24 hours.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-gray-100 focus:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 transition-all duration-300"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-gray-100 focus:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 transition-all duration-300"
                                                placeholder="your@email.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-gray-100 focus:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 transition-all duration-300"
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-gray-100 focus:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 transition-all duration-300"
                                            placeholder="What is this about?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-gray-100 focus:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 transition-all duration-300 resize-none"
                                            placeholder="Tell us how we can help you..."
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full px-8 py-4 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-full font-light text-lg tracking-wide hover:shadow-2xl hover:shadow-[#D4AF76]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </motion.button>

                                    {submitStatus === "success" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-light text-center"
                                        >
                                            Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.
                                        </motion.div>
                                    )}
                                </form>
                            </div>
                        </motion.div>

                        {/* Store Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            {/* Store Details Card */}
                            <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1A1A1A] rounded-3xl p-8 lg:p-12 text-white shadow-xl">
                                <h2 className="text-3xl md:text-4xl font-light mb-6 text-[#D4AF76]">
                                    Our Jewellery Store
                                </h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-light mb-2">
                                            NANDIKA JEWELLERS
                                        </h3>
                                        <p className="text-gray-400 font-light text-sm">
                                            Proudly serving customers across India
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-700 pt-6">
                                        <h4 className="text-sm uppercase tracking-wider text-[#D4AF76] mb-3">
                                            Address
                                        </h4>
                                        <p className="text-gray-300 font-light leading-relaxed">
                                            Soni gali, kankali chok, malwa<br />
                                            Barod, Madhya Pradesh 465550
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-700 pt-6">
                                        <h4 className="text-sm uppercase tracking-wider text-[#D4AF76] mb-3">
                                            Business Hours
                                        </h4>
                                        <div className="space-y-2 text-gray-300 font-light">
                                            <p>Monday - Saturday: 10:00 AM - 8:00 PM</p>
                                            <p>Sunday: Closed</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-700 pt-6">
                                        <h4 className="text-sm uppercase tracking-wider text-[#D4AF76] mb-3">
                                            Get Directions
                                        </h4>
                                        <a
                                            href="https://maps.google.com/?q=Soni+gali+kankali+chok+malwa+Barod+Madhya+Pradesh+465550"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-[#D4AF76] hover:text-white transition-colors group"
                                        >
                                            <span className="font-light">Open in Google Maps</span>
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-8 shadow-lg dark:shadow-none border border-gray-100 dark:border-white/[0.06]">
                                <h3 className="text-xl font-light text-[#2C2C2C] mb-4">
                                    Quick Links
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { name: "Track Your Order", href: "/orders" },
                                        { name: "Return Policy", href: "/policies/returns" },
                                        { name: "Shipping Information", href: "/policies/shipping" },
                                        { name: "FAQs", href: "/faq" }
                                    ].map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.href}
                                            className="block text-gray-600 dark:text-gray-400 hover:text-[#D4AF76] font-light transition-colors group"
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                {link.name}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C]" />
                
                <div className="max-w-5xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center text-white"
                    >
                        <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
                            Let&apos;s create something timeless together
                        </h2>
                        <p className="text-xl font-light opacity-90">
                            Connect with Nandika Jewellers today
                        </p>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
