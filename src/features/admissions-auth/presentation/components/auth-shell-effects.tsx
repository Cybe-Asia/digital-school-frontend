"use client";

import { useEffect } from "react";

export function AuthShellEffects() {
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty("--mouse-x", x.toString());
      document.documentElement.style.setProperty("--mouse-y", y.toString());
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return null;
}
