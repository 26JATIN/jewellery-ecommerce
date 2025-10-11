"use client";
import { motion } from 'framer-motion';

export default function PageTransition({ children, className = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1.0]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
