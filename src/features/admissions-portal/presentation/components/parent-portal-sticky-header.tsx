"use client";

import { useEffect, useState, type ReactNode } from "react";

type ParentPortalStickyHeaderProps = {
  brandLabel: string;
  title: string;
  subtitle: string;
  actions: ReactNode;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ParentPortalStickyHeader({
  brandLabel,
  title,
  subtitle,
  actions,
}: ParentPortalStickyHeaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        setProgress(clamp(window.scrollY / 180, 0, 1));
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const paddingX = 24 - progress * 6;
  const paddingTop = 28 - progress * 14;
  const paddingBottom = 28 - progress * 14;
  const headingSize = 52 - progress * 24;
  const subtitleSize = 26 - progress * 10;
  const headingScale = 1 - progress * 0.03;
  const actionTranslate = `${progress * -2}px`;
  const shadowOpacity = 0.12 + progress * 0.14;

  return (
    <header className="sticky top-3 z-40 mb-6">
      <div
        className="brand-header overflow-hidden rounded-[32px] transition-all duration-200 ease-out lg:[--desktop-shift:284px]"
        style={{
          "--scroll-progress": progress,
          width: "calc(100% - (var(--scroll-progress, 0) * var(--desktop-shift, 0px)))",
          marginLeft: "calc(var(--scroll-progress, 0) * var(--desktop-shift, 0px))",
          padding: `${paddingTop}px ${paddingX}px ${paddingBottom}px`,
          borderRadius: `${32 - progress * 6}px`,
          boxShadow: `0 22px 52px -34px rgb(14 27 42 / ${shadowOpacity})`,
        } as React.CSSProperties}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl min-w-0">
            <p
              className="font-semibold uppercase text-[var(--ds-primary)] transition-[font-size,letter-spacing,opacity] duration-200 ease-out"
              style={{
                fontSize: `${14 - progress * 2}px`,
                letterSpacing: `${0.22 - progress * 0.06}em`,
                opacity: 0.96 - progress * 0.08,
              }}
            >
              {brandLabel}
            </p>
            <h1
              className="mt-3 font-semibold leading-none text-[var(--ds-text-primary)] transition-[font-size,transform] duration-200 ease-out"
              style={{
                fontSize: `${headingSize}px`,
                transform: `scale(${headingScale})`,
                transformOrigin: "left center",
              }}
            >
              {title}
            </h1>
            <p
              className="mt-3 text-[var(--ds-text-secondary)] transition-[font-size,opacity,transform] duration-200 ease-out"
              style={{
                fontSize: `${subtitleSize}px`,
                lineHeight: 1.25,
                opacity: 1 - progress * 0.18,
                transform: `translateY(${progress * -3}px)`,
              }}
            >
              {subtitle}
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-2 transition-transform duration-200 ease-out"
            style={{ transform: `translateY(${actionTranslate})` }}
          >
            {actions}
          </div>
        </div>
      </div>
    </header>
  );
}
