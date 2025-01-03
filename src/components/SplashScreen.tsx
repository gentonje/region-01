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
          height="100"
          viewBox="0 0 300 100"
          className="mb-4"
        >
          {/* Welcome text path */}
          <motion.path
            d="M10 50 C20 30, 30 30, 40 50 C50 70, 60 70, 70 50 M80 30 L80 70 M90 30 L110 70 L130 30 M140 30 L140 70 M150 30 L170 50 L150 70 M180 30 L180 70 M190 50 L210 30 L210 70"
            stroke="#FF6B00"
            strokeWidth="2"
            fill="transparent"
            variants={draw}
            className="stroke-[2]"
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