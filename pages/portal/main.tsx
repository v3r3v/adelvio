import { createRoot } from "react-dom/client";
import { Portal } from "../../portal/Portal";
import "../../portal/portal.css";
createRoot(document.getElementById("portal-root")!).render(<Portal />);
if ("serviceWorker" in navigator)
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + "portal/sw.js", {
        scope: import.meta.env.BASE_URL + "portal/",
      })
      .catch(() => {
        /* Installation remains optional. */
      });
  });
