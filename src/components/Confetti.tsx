import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";

interface ConfettiProps {
  isActive?: boolean;
}

const Confetti = ({ isActive = true }: ConfettiProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // Optional: Add any initialization after particles are loaded
  }, []);

  if (!isActive) return null;

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
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
            value: 0.8,
            animation: {
              enable: true,
              speed: 0.2,
              minimumValue: 0.1,
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