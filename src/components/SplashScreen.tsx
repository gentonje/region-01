import { motion } from "framer-motion";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "spring", duration: 2, bounce: 0 },
      opacity: { duration: 0.01 }
    }
  }
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
        className="flex flex-col items-center"
      >
        <motion.svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="mb-4"
        >
          {/* First square (back) - Orange */}
          <motion.rect
            x="50"
            y="50"
            width="200"
            height="200"
            rx="20"
            stroke="#FF6B00"
            strokeWidth="8"
            fill="transparent"
            variants={draw}
          />
          
          {/* Second square (front) - Blue */}
          <motion.rect
            x="100"
            y="100"
            width="200"
            height="200"
            rx="20"
            stroke="#000080"
            strokeWidth="8"
            fill="transparent"
            variants={draw}
          />
        </motion.svg>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="text-center"
        >
          <h1 className="text-[28px] font-bold font-calligraphy">
            <span className="text-vivo-orange">Vivo</span>
            <span className="text-navy-blue dark:text-white">Shop</span>
          </h1>
        </motion.div>
      </motion.div>
    </div>
  );
};