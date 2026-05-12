"use client";

import { useCallback, useState } from "react";

const POSTER_BG = "/ai-company-dashboard-bg.png";
const VIDEO_SRC = "/hero-bg.mp4";

export function HeroBackdrop() {
  const [videoReady, setVideoReady] = useState(false);

  const revealVideo = useCallback(() => {
    setVideoReady(true);
  }, []);

  return (
    <>
      <div
        aria-hidden
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-out ${
          videoReady ? "opacity-0" : "opacity-[0.72]"
        }`}
        style={{ backgroundImage: `url("${POSTER_BG}")` }}
      />
      <video
        aria-hidden
        className={`absolute inset-0 h-full w-full scale-[1.02] object-cover transition-opacity duration-700 ease-out ${
          videoReady ? "opacity-[0.72]" : "opacity-0"
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onPlaying={revealVideo}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
    </>
  );
}
