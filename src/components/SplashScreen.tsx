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
          height="300"
          viewBox="0 0 600 600"
          initial="hidden"
          animate="visible"
          className="max-w-[80vw]"
        >
          <motion.circle
            className="circle-path"
            cx="100"
            cy="100"
            r="80"
            stroke="#ff6b00"
            variants={draw}
            custom={1}
            style={shape}
          />
          <motion.line
            x1="220"
            y1="30"
            x2="360"
            y2="170"
            stroke="#000080"
            variants={draw}
            custom={2}
            style={shape}
          />
          <motion.line
            x1="220"
            y1="170"
            x2="360"
            y2="30"
            stroke="#000080"
            variants={draw}
            custom={2.5}
            style={shape}
          />
          <motion.rect
            width="140"
            height="140"
            x="410"
            y="30"
            rx="20"
            stroke="#ff6b00"
            variants={draw}
            custom={3}
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
  strokeWidth: 10,
  strokeLinecap: "round",
  fill: "transparent",
};