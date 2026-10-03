"use client";

import { loadBasic } from "@tsparticles/basic";
import type { Container, ISourceOptions } from "@tsparticles/engine";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { useCallback, useEffect, useRef } from "react";
import styles from "./ambient-field.module.css";

export type AmbientParticlesProps = { paused: boolean; onReady: () => void };

const options: ISourceOptions = {
  fullScreen: false,
  detectRetina: false,
  fpsLimit: 120,
  pauseOnBlur: true,
  particles: {
    number: {
      value: 60,
      density: { enable: true, width: 1280, height: 800 },
      limit: { value: 85 },
    },
    paint: { color: { value: ["#92c8e6", "#b8d6f0", "#5ea5c9"] } },
    shape: { type: "circle" },
    opacity: { value: { min: 0.18, max: 0.58 } },
    size: { value: { min: 0.7, max: 1.6 } },
    move: {
      enable: true,
      speed: { min: 0.08, max: 0.2 },
      direction: "top-right",
      random: true,
      straight: false,
      outModes: "out",
    },
  },
};

export default function AmbientParticles({ paused, onReady }: AmbientParticlesProps) {
  const container = useRef<Container | undefined>(undefined);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
    if (paused) container.current?.pause();
    else container.current?.play();
  }, [paused]);

  const loaded = useCallback(
    (value?: Container) => {
      container.current = value;
      if (!value) return;
      if (pausedRef.current) value.pause();
      onReady();
    },
    [onReady],
  );

  return (
    <ParticlesProvider init={loadBasic}>
      <Particles
        id="ambient-particles"
        className={styles.particles}
        options={options}
        particlesLoaded={loaded}
      />
    </ParticlesProvider>
  );
}
