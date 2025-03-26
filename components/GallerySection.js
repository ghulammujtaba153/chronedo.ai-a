import React from "react";
import { motion } from "framer-motion";

const Gallery = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-[1200px] py-15 px-4 mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-2 w-full items-center justify-center bg-[#0B1018] shadow-[0_-2px_10px_-1px_rgba(0,147,232,1)] rounded-lg py-4"
      >
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center px-2 justify-center gap-2"
        >
          <h1 className="text-white text-4xl font-semibold">Inspiration</h1>
          <p className="text-gray-400 text-lg">
            Discover what Chronedo AI can do for your watch photos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 grid-cols-2 sm:grid-cols-3 mt-4 gap-4">
          {/* First Row - Right to Left Animation */}
          <div className="contents">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [0, -20, 0] }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              }}
              className="contents"
            >
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                src="/watch1.png"
                alt="Gallery"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                src="/watch2.png"
                alt="Gallery"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                src="/watch3.png"
                alt="Gallery"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                src="/watch4.png"
                alt="Gallery"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
            </motion.div>
          </div>

          {/* Second Row - Left to Right Animation */}
          <div className="contents">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [0, 20, 0] }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              }}
              className="contents"
            >
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                src="/watch5.png"
                alt="Gallery"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                src="/watch6.png"
                alt="Gallery"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                src="/watch7.png"
                alt="Gallery"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                src="/watch.png"
                alt="Gallery"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Gallery;
