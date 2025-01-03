import { motion } from "framer-motion";

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="text-[28px] font-bold font-calligraphy mb-2">
            Welcome to
          </h1>
          <h1 className="text-[28px] font-bold font-calligraphy">
            <span className="text-vivo-orange">Vivo</span>
            <span className="text-navy-blue dark:text-white">Shop</span>
          </h1>
        </motion.div>
      </motion.div>
    </div>
  );
};