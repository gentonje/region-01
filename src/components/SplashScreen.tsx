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
          height="120"
          viewBox="0 0 400 120"
          initial="hidden"
          animate="visible"
          className="max-w-[80vw]"
        >
          {/* Calligraphy "vivo" */}
          {/* Letter v */}
          <motion.path
            d="M20 80 C30 30, 40 80, 50 30"
            stroke="#ff6b00"
            variants={draw}
            custom={0}
            style={shape}
            className="font-calligraphy"
          />
          {/* Letter i */}
          <motion.path
            d="M70 30 Q70 55, 70 80"
            stroke="#000080"
            variants={draw}
            custom={0.5}
            style={shape}
          />
          <motion.circle
            cx="70"
            cy="20"
            r="3"
            fill="#000080"
            variants={draw}
            custom={0.5}
          />
          {/* Letter v */}
          <motion.path
            d="M90 80 C100 30, 110 80, 120 30"
            stroke="#ff6b00"
            variants={draw}
            custom={1}
            style={shape}
          />
          {/* Letter o */}
          <motion.path
            d="M140 55 C140 35, 160 35, 160 55 C160 75, 140 75, 140 55"
            stroke="#000080"
            variants={draw}
            custom={1.5}
            style={shape}
          />

          {/* Block letters "SHOP" */}
          {/* Letter S */}
          <motion.path
            d="M200 35 C220 35, 220 55, 200 55 C180 55, 180 75, 200 75"
            stroke="#ff6b00"
            strokeWidth="8"
            variants={draw}
            custom={2}
            style={shape}
          />
          {/* Letter H */}
          <motion.path
            d="M240 30 L240 80 M240 55 L270 55 M270 30 L270 80"
            stroke="#000080"
            strokeWidth="8"
            variants={draw}
            custom={2.5}
            style={shape}
          />
          {/* Letter O */}
          <motion.path
            d="M290 55 C290 35, 320 35, 320 55 C320 75, 290 75, 290 55"
            stroke="#ff6b00"
            strokeWidth="8"
            variants={draw}
            custom={3}
            style={shape}
          />
          {/* Letter P */}
          <motion.path
            d="M340 30 L340 80 M340 30 C340 30, 370 30, 370 45 C370 60, 340 60, 340 45"
            stroke="#000080"
            strokeWidth="8"
            variants={draw}
            custom={3.5}
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