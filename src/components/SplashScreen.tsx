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
          width="400"
          height="300"
          viewBox="0 0 400 300"
          className="mb-4"
        >
          {/* Store building */}
          <motion.path
            d="M50 200 L50 100 L350 100 L350 200 L50 200 Z" // Main building
            stroke="#FF6B00"
            strokeWidth="2"
            fill="transparent"
            variants={draw}
          />
          <motion.path
            d="M30 100 L200 20 L370 100" // Roof
            stroke="#FF6B00"
            strokeWidth="2"
            fill="transparent"
            variants={draw}
          />
          {/* Door */}
          <motion.path
            d="M150 200 L150 140 L200 140 L200 200"
            stroke="#FF6B00"
            strokeWidth="2"
            fill="transparent"
            variants={draw}
          />
          {/* Windows */}
          <motion.path
            d="M80 130 L120 130 L120 160 L80 160 Z M230 130 L270 130 L270 160 L230 160 Z"
            stroke="#FF6B00"
            strokeWidth="2"
            fill="transparent"
            variants={draw}
          />
          {/* Shopping person */}
          <motion.path
            d="M180 180 L180 150 M170 160 L190 160 M180 160 C160 180, 200 180, 180 200" // Body and arms
            stroke="#FF6B00"
            strokeWidth="2"
            fill="transparent"
            variants={draw}
          />
          <motion.circle
            cx="180"
            cy="145"
            r="5"
            stroke="#FF6B00"
            strokeWidth="2"
            fill="transparent"
            variants={draw}
          />
          {/* Shopping cart */}
          <motion.path
            d="M160 190 L200 190 M160 200 L200 200 M180 190 L180 200"
            stroke="#FF6B00"
            strokeWidth="2"
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