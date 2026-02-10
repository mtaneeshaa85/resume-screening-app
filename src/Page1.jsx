import React from "react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const itemUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function EduBridgeHero() {
  return (
    <div className="min-h-screen w-full bg-[#f3eef7] flex items-center justify-center overflow-hidden">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 max-w-7xl w-full items-center"
      >
        {/* LEFT CONTENT */}
        <motion.div className="px-10 md:px-16 py-20">
          {/* Logo */}
          <motion.div
            variants={itemLeft}
            className="flex items-center gap-3 mb-10"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold"
            >
              🧠
            </motion.div>
            <div>
              <h2 className="font-semibold text-lg">EduBridge AI</h2>
              <p className="text-xs tracking-widest text-gray-500">
                HUMANIZING EDUCATION TECHNOLOGY
              </p>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemLeft}
            className="text-5xl md:text-6xl font-bold leading-tight mb-6"
          >
            What AI is <br />
            <span className="text-purple-600">Missing</span> in <br />
            Education
          </motion.h1>

          <motion.div
            variants={itemUp}
            className="w-20 h-1 bg-purple-600 mb-6 rounded-full"
          />

          {/* Description */}
          <motion.p
            variants={itemUp}
            className="text-gray-600 text-lg max-w-xl mb-8"
          >
            Discover the critical gaps in AI-powered education and explore our
            human-centered solutions that bridge technology with empathy,
            creativity, and inclusivity.
          </motion.p>

          {/* Button */}
          <motion.button
            variants={itemUp}
            whileHover={{ scale: 1.05, letterSpacing: "0.2em" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-purple-700 font-semibold tracking-wide"
          >
            EXPLORE SOLUTIONS →
          </motion.button>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative h-[500px] md:h-[650px]"
        >
          <motion.div
            initial={{
              clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
            }}
            animate={{ clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
              alt="books"
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
