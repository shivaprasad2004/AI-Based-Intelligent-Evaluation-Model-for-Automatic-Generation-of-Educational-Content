import { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="hero-particles"
      init={particlesInit}
      className="absolute inset-0 z-0"
      options={{
        fullScreen: false,
        fpsLimit: 60,
        particles: {
          number: { value: 30, density: { enable: true, width: 1200, height: 800 } },
          color: { value: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'] },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.1, max: 0.3 }, animation: { enable: true, speed: 0.5, sync: false } },
          size: { value: { min: 1, max: 3 } },
          move: {
            enable: true,
            speed: 0.6,
            direction: 'none',
            random: true,
            straight: false,
            outModes: 'bounce',
          },
          links: {
            enable: true,
            distance: 150,
            color: '#6366f1',
            opacity: 0.1,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
          },
          modes: {
            grab: { distance: 140, links: { opacity: 0.2 } },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
