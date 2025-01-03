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

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div
        initial="hidden"
        animate="visible"
        onAnimationComplete={onComplete}
      >
        <motion.svg
          width="600"
          height="600"
          viewBox="0 0 600 600"
          className="max-w-[80vw]"
        >
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke="#FF6B00"
            variants={draw}
            custom={1}
            className="stroke-[10] stroke-round fill-transparent"
          />
          <motion.line
            x1="220"
            y1="30"
            x2="360"
            y2="170"
            stroke="#000080"
            variants={draw}
            custom={2}
            className="stroke-[10] stroke-round fill-transparent"
          />
          <motion.line
            x1="220"
            y1="170"
            x2="360"
            y2="30"
            stroke="#000080"
            variants={draw}
            custom={2.5}
            className="stroke-[10] stroke-round fill-transparent"
          />
          <motion.rect
            width="140"
            height="140"
            x="410"
            y="30"
            rx="20"
            stroke="#FF6B00"
            variants={draw}
            custom={3}
            className="stroke-[10] stroke-round fill-transparent"
          />
        </motion.svg>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="text-center mt-8"
        >
          <h1 className="text-4xl font-calligraphy">
            <span className="text-vivo-orange">Vivo</span>
            <span className="text-navy-blue dark:text-white">Shop</span>
          </h1>
        </motion.div>
      </motion.div>
    </div>
  );
};