import { motion } from "framer-motion";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: i * 0.5, type: "spring", duration: 2.5, bounce: 0 },
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
          width="400"
          height="300"
          viewBox="0 0 400 300"
          initial="hidden"
          animate="visible"
          className="max-w-[80vw]"
        >
          {/* Shop roof */}
          <motion.path
            d="M50 150 L200 50 L350 150"
            stroke="#ff6b00"
            strokeWidth="8"
            variants={draw}
            custom={0}
            style={shape}
          />
          
          {/* Shop walls */}
          <motion.path
            d="M75 150 L75 250 L325 250 L325 150"
            stroke="#000080"
            strokeWidth="8"
            variants={draw}
            custom={1}
            style={shape}
          />
          
          {/* Door */}
          <motion.path
            d="M175 250 L175 175 L225 175 L225 250"
            stroke="#ff6b00"
            strokeWidth="8"
            variants={draw}
            custom={2}
            style={shape}
          />
          
          {/* Windows */}
          <motion.path
            d="M100 175 L150 175 L150 200 L100 200 Z"
            stroke="#000080"
            strokeWidth="8"
            variants={draw}
            custom={3}
            style={shape}
          />
          
          <motion.path
            d="M250 175 L300 175 L300 200 L250 200 Z"
            stroke="#000080"
            strokeWidth="8"
            variants={draw}
            custom={3.5}
            style={shape}
          />
          
          {/* Chimney */}
          <motion.path
            d="M275 100 L275 50 L300 50 L300 115"
            stroke="#ff6b00"
            strokeWidth="8"
            variants={draw}
            custom={4}
            style={shape}
          />
        </motion.svg>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4 }}
          className="mt-4 text-2xl font-bold text-foreground"
        >
          Loading Products...
        </motion.h1>
      </motion.div>
    </div>
  );
};

const shape: React.CSSProperties = {
  strokeLinecap: "round",
  fill: "transparent",
};