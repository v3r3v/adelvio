"use client";
/* eslint-disable @next/next/no-img-element -- Static hosting uses the existing brand assets. */
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useLanguage } from "../i18n/LanguageProvider";

const links = [
  ["#approach", "The thinking"],
  ["#work", "The work"],
  ["#packages", "Packages"],
  ["#about", "The studio"],
] as const;

export function SiteHeader({ assetBase }: { assetBase: string }) {
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let frame = 0;
    let maximum = 1;
    let compact = false;
    const update = () => {
      frame = 0;
      const next = window.scrollY > 52;
      if (next !== compact) {
        header.dataset.compact = String(next);
        compact = next;
      }
      header.style.setProperty(
        "--reading-progress",
        String(Math.max(0, Math.min(1, window.scrollY / maximum))),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      maximum = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      schedule();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const wide = matchMedia("(min-width: 1101px)");
    const resize = () => {
      if (wide.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    wide.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
      wide.removeEventListener("change", resize);
    };
  }, [menuOpen]);
  return (
    <header ref={ref} className="site-header wrap" data-menu-open={menuOpen}>
      <div className="header-shell">
        <a
          className="wordmark"
          href="#main"
          aria-label={t("Adelvio, home")}
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-logo-frame">
            <img
              className="brand-logo"
              src={assetBase + "adelvio-logo.webp"}
              alt="Adelvio"
              width={2048}
              height={768}
              decoding="async"
            />
          </span>
        </a>
        <nav className="desktop-navigation" aria-label={t("Main navigation")}>
          {links.map(([href, label]) => (
            <a href={href} key={href}>
              {t(label)}
            </a>
          ))}
          <a className="small-cta" href="#project">
            {t("Start a project")}{" "}
            <span aria-hidden="true">
              <Icon />
            </span>
          </a>
        </nav>
        <div className="header-tools">
          <div
            className="language-switch"
            role="group"
            aria-label="Idioma / Language"
          >
            <button
              type="button"
              lang="es"
              aria-label="Cambiar a español"
              aria-pressed={language === "es"}
              onClick={() => setLanguage("es")}
            >
              ES
            </button>
            <button
              type="button"
              lang="en"
              aria-label="Switch to English"
              aria-pressed={language === "en"}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
          </div>
          <button
            ref={toggle}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span>{t(menuOpen ? "Close" : "Menu")}</span>
            <Icon name={menuOpen ? "minus" : "plus"} />
          </button>
        </div>
        <span className="header-progress" aria-hidden="true" />
        <nav
          id="mobile-nav"
          className="mobile-nav"
          hidden={!menuOpen}
          aria-label={t("Mobile navigation")}
        >
          {[...links, ["#project", "Start a project"]].map(([href, label]) => (
            <a href={href} key={href} onClick={() => setMenuOpen(false)}>
              {t(label)}
              <Icon />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
