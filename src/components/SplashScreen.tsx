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
        className="flex flex-col items-center"
      >
        <motion.svg
          width="600"
          height="600"
          viewBox="0 0 600 600"
          className="max-w-[80vw]"
        >
          {/* Unique shape - Abstract star/flower pattern */}
          <motion.path
            d="M300 100 
               L350 200 L450 200 L375 275 L400 375 
               L300 325 L200 375 L225 275 L150 200 
               L250 200 Z"
            stroke="#FF6B00"
            variants={draw}
            custom={1}
            className="stroke-[10] stroke-round fill-transparent"
          />
          <motion.circle
            cx="300"
            cy="250"
            r="30"
            stroke="#000080"
            variants={draw}
            custom={2}
            className="stroke-[10] stroke-round fill-transparent"
          />
          <motion.path
            d="M250 300 
               C275 325, 325 325, 350 300 
               C375 275, 375 225, 350 200 
               C325 175, 275 175, 250 200 
               C225 225, 225 275, 250 300"
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
          <h1 className="text-[28px] font-bold font-calligraphy">
            <span className="text-vivo-orange">Vivo</span>
            <span className="text-navy-blue dark:text-white">Shop</span>
          </h1>
        </motion.div>
      </motion.div>
    </div>
  );
};