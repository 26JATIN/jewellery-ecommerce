"use client";
import { motion } from "framer-motion";

export default function FeaturedCollections() {
    const collections = [
        {
            id: 1,
            name: "Wedding Collection",
            image: "/collections/wedding.jpeg",
            description: "Timeless pieces for your special day"
        },
        {
            id: 2,
            name: "Vintage Series",
            image: "/collections/vintage.jpg",
            description: "Classic designs with modern elegance"
        },
        {
            id: 3,
            name: "Diamond Edition",
            image: "/collections/diamond.jpg",
            description: "Luxury crafted in brilliance"
        }
    ];

    return (
        <section className="py-20 bg-[#f8f5f2]">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-semibold text-center text-[#8B6B4C] mb-12">
                    Featured Collections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection) => (
                        <motion.div
                            key={collection.id}
                            whileHover={{ y: -10 }}
                            className="relative h-[400px] group"
                        >
                            <img 
                                src={collection.image} 
                                alt={collection.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg">
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-2xl font-medium mb-2">{collection.name}</h3>
                                    <p className="text-sm mb-4">{collection.description}</p>
                                    <button className="text-sm border-b border-white hover:border-[#8B6B4C] hover:text-[#8B6B4C] transition-colors">
                                        Explore Collection →
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}