/** Font-independent UI artwork. Keep these paths consistent with docs/icons.md. */
const paths = {
  "arrow-up-right": "M7 17 17 7M7 7h10v10",
  "arrow-down-right": "M7 7 17 17M7 17h10V7",
  "arrow-down": "M12 5v14m-6-6 6 6 6-6",
  "arrow-up": "M12 19V5m-6 6 6-6 6 6",
  "return-left": "M9 10 4 15l5 5M4 15h11a4 4 0 0 0 4-4V4",
  "corner-down-right": "M5 4v8a4 4 0 0 0 4 4h11m-5-5 5 5-5 5",
  check: "m5 12 4 4L19 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 8h16M4 16h16",
  bloom: "M12 2v20M2 12h20M5 5l14 14M5 19 19 5",
};

export type IconName = keyof typeof paths | "window-dots";

/** Decorative only: name icon-only controls on the parent button or link. */
export function Icon({name = "arrow-up-right", className = ""}: {name?: IconName; className?: string}) {
  return <svg className={`ui-icon${name === "window-dots" ? " ui-icon--dots" : ""} ${className}`} viewBox={name === "window-dots" ? "0 0 24 8" : "0 0 24 24"} width="24" height={name === "window-dots" ? "8" : "24"} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === "window-dots"
      ? <g fill="currentColor" stroke="none"><circle cx="4" cy="4" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="20" cy="4" r="1.5"/></g>
      : <path d={paths[name]}/>}
  </svg>;
}
