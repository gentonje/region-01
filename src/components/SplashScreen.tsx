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
          <motion.text
            x="150"
            y="150"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[32px] font-calligraphy"
            fill="#FF6B00"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <tspan x="150" dy="-10" className="text-vivo-orange">Vivo</tspan>
            <tspan x="150" dy="40" className="text-navy-blue dark:text-white">Shop</tspan>
          </motion.text>
        </motion.svg>
      </motion.div>
    </div>
  );
};