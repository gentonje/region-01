import { motion } from "framer-motion";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: i * 0.5, type: "spring", duration: 1.5, bounce: 0 },
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
          width="300"
          height="100"
          viewBox="0 0 300 100"
          initial="hidden"
          animate="visible"
          className="max-w-[80vw]"
        >
          {/* Letter V */}
          <motion.path
            d="M10 10 L30 80 L50 10"
            stroke="#ff6b00"
            variants={draw}
            custom={0}
            style={shape}
          />
          {/* Letter i */}
          <motion.path
            d="M60 30 L60 80"
            stroke="#000080"
            variants={draw}
            custom={0.5}
            style={shape}
          />
          <motion.circle
            cx="60"
            cy="15"
            r="3"
            fill="#000080"
            variants={draw}
            custom={0.5}
          />
          {/* Letter v */}
          <motion.path
            d="M70 30 L85 80 L100 30"
            stroke="#ff6b00"
            variants={draw}
            custom={1}
            style={shape}
          />
          {/* Letter o */}
          <motion.circle
            cx="120"
            cy="55"
            r="25"
            stroke="#000080"
            variants={draw}
            custom={1.5}
            style={shape}
          />
          {/* Letter s */}
          <motion.path
            d="M160 35 C180 35, 180 45, 160 55 C140 65, 140 75, 160 75"
            stroke="#ff6b00"
            variants={draw}
            custom={2}
            style={shape}
          />
          {/* Letter h */}
          <motion.path
            d="M180 10 L180 80"
            stroke="#000080"
            variants={draw}
            custom={2.5}
            style={shape}
          />
          <motion.path
            d="M180 55 C180 65, 190 75, 200 75 C210 75, 220 65, 220 55 L220 30"
            stroke="#000080"
            variants={draw}
            custom={3}
            style={shape}
          />
          {/* Letter o */}
          <motion.circle
            cx="240"
            cy="55"
            r="25"
            stroke="#ff6b00"
            variants={draw}
            custom={3.5}
            style={shape}
          />
          {/* Letter p */}
          <motion.path
            d="M270 30 L270 100"
            stroke="#000080"
            variants={draw}
            custom={4}
            style={shape}
          />
          <motion.path
            d="M270 30 C270 30, 290 30, 290 55 C290 80, 270 80, 270 55"
            stroke="#000080"
            variants={draw}
            custom={4.5}
            style={shape}
          />
        </motion.svg>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-4 text-2xl font-bold text-foreground"
        >
          Loading Products...
        </motion.h1>
      </motion.div>
    </div>
  );
};

const shape: React.CSSProperties = {
  strokeWidth: 6,
  strokeLinecap: "round",
  fill: "transparent",
};