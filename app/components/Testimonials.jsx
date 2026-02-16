"use client";
import { motion } from "framer-motion";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function Testimonials() {
    const testimonials = [
        {
            id: 1,
            name: "Ritika Sharma",
            role: "Verified Buyer",
            location: "Delhi",
            text: "Absolutely stunning craftsmanship! The necklace I received looks even more beautiful in person. Packaging was so elegant — felt like unboxing royalty.",
            rating: 5,
            image: "RS",
            purchase: "Gold Necklace"
        },
        {
            id: 2,
            name: "Priyank Mehta",
            role: "Verified Buyer",
            location: "Ahmedabad",
            text: "I ordered a custom gold bracelet for my wife's birthday. The detailing and polish are perfect. Delivered on time and safely. Highly recommended!",
            rating: 5,
            image: "PM",
            purchase: "Custom Gold Bracelet"
        },
        {
            id: 3,
            name: "Sanya Nair",
            role: "Verified Buyer",
            location: "Kochi",
            text: "Loved the handcrafted earrings — lightweight, elegant, and classy. Customer support helped me with every detail patiently.",
            rating: 5,
            image: "SN",
            purchase: "Handcrafted Earrings"
        },
        {
            id: 4,
            name: "Rohit Kapoor",
            role: "Verified Buyer",
            location: "Mumbai",
            text: "The design was exactly as shown on the website. Loved the authenticity certificate and the finishing quality. Totally worth it!",
            rating: 5,
            image: "RK",
            purchase: "Gold Jewelry Set"
        },
        {
            id: 5,
            name: "Aditi Verma",
            role: "Verified Buyer",
            location: "Lucknow",
            text: "Such a smooth experience! From online order to doorstep delivery — everything was perfect. Thank you, Nandika, for such premium service.",
            rating: 5,
            image: "AV",
            purchase: "Diamond Ring"
        },
        {
            id: 6,
            name: "Deepak Reddy",
            role: "Verified Buyer",
            location: "Hyderabad",
            text: "Ordered a men's gold chain. Excellent polish, proper weight, and safe packaging. Feels luxurious and genuine.",
            rating: 5,
            image: "DR",
            purchase: "Men's Gold Chain"
        },
        {
            id: 7,
            name: "Neha Chauhan",
            role: "Verified Buyer",
            location: "Jaipur",
            text: "Their diamond bangles are pure perfection. The sparkle, the design, everything screams class! Will shop again soon.",
            rating: 5,
            image: "NC",
            purchase: "Diamond Bangles"
        },
        {
            id: 8,
            name: "Vivek Patel",
            role: "Verified Buyer",
            location: "Surat",
            text: "Appreciate the transparency — got hallmark details, invoice, and lifetime service info clearly. Best online jewelry buying experience!",
            rating: 5,
            image: "VP",
            purchase: "Gold Pendant"
        },
        {
            id: 9,
            name: "Meera Joshi",
            role: "Verified Buyer",
            location: "Pune",
            text: "Nandika made my engagement ring dreams come true! Custom-designed exactly as I wanted. The finish is flawless.",
            rating: 5,
            image: "MJ",
            purchase: "Custom Engagement Ring"
        },
        {
            id: 10,
            name: "Arjun Malhotra",
            role: "Verified Buyer",
            location: "Chandigarh",
            text: "Was skeptical about ordering jewelry online, but Nandika proved me wrong. Authentic, elegant, and securely packed.",
            rating: 5,
            image: "AM",
            purchase: "Gold Bracelet"
        },
        {
            id: 11,
            name: "Divya Iyer",
            role: "Verified Buyer",
            location: "Chennai",
            text: "Their customer service is top-notch. They helped me track my parcel and even shared care instructions. Super professional!",
            rating: 5,
            image: "DI",
            purchase: "Silver Anklets"
        },
        {
            id: 12,
            name: "Harshita Deshmukh",
            role: "Verified Buyer",
            location: "Nagpur",
            text: "I've bought from many brands, but Nandika's craftsmanship stands out. Each piece feels premium and personal.",
            rating: 5,
            image: "HD",
            purchase: "Gold Earrings"
        },
        {
            id: 13,
            name: "Ankita Das",
            role: "Verified Buyer",
            location: "Kolkata",
            text: "Loved the fusion of traditional and modern design in my necklace. The shine and quality are unmatched!",
            rating: 5,
            image: "AD",
            purchase: "Fusion Necklace"
        },
        {
            id: 14,
            name: "Rajesh Tiwari",
            role: "Verified Buyer",
            location: "Bhopal",
            text: "Fast delivery and great communication. My wife loved her pendant — perfect finish and authenticity guaranteed.",
            rating: 5,
            image: "RT",
            purchase: "Diamond Pendant"
        },
        {
            id: 15,
            name: "Shruti Pandey",
            role: "Verified Buyer",
            location: "Varanasi",
            text: "The detailing is just incredible. You can feel the artistry in every curve and cut. Definitely recommending to my friends.",
            rating: 5,
            image: "SP",
            purchase: "Artisan Collection"
        }
    ];

    const stats = [
        { number: "50K+", label: "Happy Customers" },
        { number: "4.9", label: "Average Rating" },
        { number: "99%", label: "Satisfaction Rate" },
        { number: "24/7", label: "Customer Support" }
    ];

    // Format testimonials for InfiniteMovingCards component
    const formattedTestimonials = testimonials.map(testimonial => ({
        quote: testimonial.text,
        name: testimonial.name,
        title: `${testimonial.role} • ${testimonial.location}`,
        rating: testimonial.rating,
        image: testimonial.image,
        purchase: testimonial.purchase
    }));

    return (
        <section className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAFA] via-[#F8F6F3] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]" />
            
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D4AF76] to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#8B6B4C] to-transparent rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 lg:mb-20"
                >
                    <div className="inline-block mb-6">
                        <div className="text-sm md:text-base text-[#D4AF76] font-light tracking-[0.2em] uppercase relative">
                            Testimonials
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2C2C] dark:text-gray-100 tracking-tight mb-6">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                        Don't just take our word for it. Here's what our valued customers have to say about their experience with us.
                    </p>
                </motion.div>

                {/* Stats Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center group"
                        >
                            <h3 className="text-3xl lg:text-4xl font-light text-[#D4AF76] mb-2 group-hover:scale-110 transition-transform duration-300">
                                {stat.number}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Infinite Moving Cards - Testimonials */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <InfiniteMovingCards
                        items={formattedTestimonials}
                        direction="left"
                        speed="slow"
                        pauseOnHover={true}
                    />
                </motion.div>
            </div>
        </section>
    );
}