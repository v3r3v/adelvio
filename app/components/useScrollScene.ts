"use client";
import {useEffect, useRef} from "react";

export const PINNED_MOTION_QUERY = "(min-width: 1100px) and (min-height: 740px) and (prefers-reduced-motion: no-preference)";

/** One measured scene per frame, only while visible. No scroll interception. */
export function useScrollScene<T extends HTMLElement>(pinned = false, onProgress?: (progress: number) => void) {
  const ref = useRef<T>(null);
  const callback = useRef(onProgress);
  useEffect(() => { callback.current = onProgress; }, [onProgress]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia(pinned ? PINNED_MOTION_QUERY : "(min-width: 1100px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let visible = true;
    const update = () => {
      frame = 0;
      if (!media.matches) {
        element.style.setProperty("--p", "0");
        return;
      }
      const bounds = element.getBoundingClientRect();
      const range = pinned ? bounds.height - window.innerHeight : bounds.height;
      const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, range)));
      element.style.setProperty("--p", progress.toFixed(4));
      callback.current?.(progress);
    };
    const schedule = () => { if (visible && !frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }, {rootMargin: "100px"});
    observer.observe(element);
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    window.addEventListener("scroll", schedule, {passive: true});
    window.addEventListener("resize", schedule);
    media.addEventListener("change", update);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", update);
    };
  }, [pinned]);
  return ref;
}
