import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

/** Animates a number from 0 to `value` on mount / whenever `resetKey` changes. */
export function useCountUp(value: number, { duration = 700, resetKey }: { duration?: number; resetKey?: unknown } = {}) {
  const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    cancelAnimationFrame(frame.current);

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(value * easeOutQuint(t));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, resetKey]);

  return display;
}
