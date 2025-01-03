import { motion } from "framer-motion";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: i * 0.5, type: "spring", duration: 5, bounce: 0 },
      opacity: { delay: i * 0.5, duration: 0.01 },
    },
  }),
};

export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.svg
          width="600"
          height="400"
          viewBox="0 0 600 400"
          initial="hidden"
          animate="visible"
          className="max-w-[90vw]"
        >
          {/* Main shop building */}
          <motion.path
            d="M100 200 L300 100 L500 200"
            stroke="#ff6b00"
            strokeWidth="8"
            variants={draw}
            custom={0}
            style={shape}
          />
          
          {/* Shop walls */}
          <motion.path
            d="M125 200 L125 350 L475 350 L475 200"
            stroke="#000080"
            strokeWidth="8"
            variants={draw}
            custom={1}
            style={shape}
          />
          
          {/* Main door */}
          <motion.path
            d="M275 350 L275 250 L325 250 L325 350"
            stroke="#ff6b00"
            strokeWidth="8"
            variants={draw}
            custom={2}
            style={shape}
          />
          
          {/* Left window */}
          <motion.path
            d="M150 250 L225 250 L225 300 L150 300 Z"
            stroke="#000080"
            strokeWidth="8"
            variants={draw}
            custom={3}
            style={shape}
          />
          
          {/* Right window */}
          <motion.path
            d="M375 250 L450 250 L450 300 L375 300 Z"
            stroke="#000080"
            strokeWidth="8"
            variants={draw}
            custom={3.5}
            style={shape}
          />
          
          {/* Chimney */}
          <motion.path
            d="M400 150 L400 80 L425 80 L425 165"
            stroke="#ff6b00"
            strokeWidth="8"
            variants={draw}
            custom={4}
            style={shape}
          />

          {/* Shopping Cart */}
          <motion.path
            d="M50 380 L75 380 L90 360 L100 360 L110 380 L120 380"
            stroke="#000080"
            strokeWidth="4"
            variants={draw}
            custom={4.5}
            style={shape}
          />
          <motion.path
            d="M60 385 C60 390, 65 390, 65 385"
            stroke="#000080"
            strokeWidth="3"
            variants={draw}
            custom={5}
            style={shape}
          />
          <motion.path
            d="M110 385 C110 390, 115 390, 115 385"
            stroke="#000080"
            strokeWidth="3"
            variants={draw}
            custom={5}
            style={shape}
          />

          {/* Parked Car */}
          <motion.path
            d="M500 370 L550 370 L560 350 L490 350 L500 370"
            stroke="#ff6b00"
            strokeWidth="4"
            variants={draw}
            custom={5.5}
            style={shape}
          />
          <motion.circle
            cx="505"
            cy="370"
            r="5"
            stroke="#000080"
            strokeWidth="2"
            variants={draw}
            custom={6}
            style={shape}
          />
          <motion.circle
            cx="545"
            cy="370"
            r="5"
            stroke="#000080"
            strokeWidth="2"
            variants={draw}
            custom={6}
            style={shape}
          />
        </motion.svg>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 6 }}
          className="mt-4 text-2xl font-calligraphy text-vivo-orange"
        >
          Enjoy your shopping
        </motion.h1>
      </motion.div>
    </div>
  );
};

const shape: React.CSSProperties = {
  strokeLinecap: "round",
  fill: "transparent",
};