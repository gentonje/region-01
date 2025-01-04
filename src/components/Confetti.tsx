import { useCallback } from "react";
import { Engine } from "@tsparticles/engine";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

interface ConfettiProps {
  isActive?: boolean;
}

const Confetti = ({ isActive = true }: ConfettiProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (!isActive) return null;

  return (
    <Particles
      id="tsparticles"
      particlesInit={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: 1,
        },
        particles: {
          number: {
            value: 100,
          },
          color: {
            value: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"],
          },
          shape: {
            type: ["circle", "square", "star"],
          },
          opacity: {
            value: { min: 0.1, max: 0.8 },
            animation: {
              enable: true,
              speed: 0.2,
              sync: false,
            },
          },
          size: {
            value: 6,
          },
          move: {
            enable: true,
            speed: 3,
            direction: "bottom",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
          },
        },
        life: {
          duration: {
            sync: true,
            value: 5,
          },
          count: 1,
        },
        detectRetina: true,
      }}
    />
  );
};

export default Confetti;