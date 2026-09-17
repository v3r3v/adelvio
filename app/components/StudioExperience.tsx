"use client";
/* eslint-disable @next/next/no-img-element -- Shared static builds serve local assets without a Next image server. */
import { useLanguage } from "../i18n/LanguageProvider";
import { Icon } from "./Icon";
import { useState } from "react";
import { PINNED_MOTION_QUERY, useScrollScene } from "./useScrollScene";

export function Symbol({
  assetBase,
  className = "",
}: {
  assetBase: string;
  className?: string;
}) {
  return (
    <img
      className={`brand-symbol ${className}`}
      src={assetBase + "adelvio-symbol.webp"}
      width={512}
      height={512}
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  );
}

function BrowserRail({ label }: { label: string }) {
  return (
    <div className="interface-rail">
      <span className="window-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{label}</span>
      <span aria-hidden="true">
        <Icon name="arrow-up-right" />
      </span>
    </div>
  );
}

/** Real markup, shared across the hero and the connected-systems demonstration. */
export function ProductWindow({ assetBase }: { assetBase: string }) {
  const { t } = useLanguage();
  return (
    <div className="product-window">
      <BrowserRail label={t("a new perspective / design concept")} />
      <div className="product-nav">
        <b>
          CHAPTER<span>®</span>
        </b>
        <span>
          {t("About · Experiences")}{" "}
          <i>
            {t("Let’s talk")} <Icon name="arrow-up-right" />
          </i>
        </span>
      </div>
      <div className="product-content">
        <div className="product-words">
          <span className="interface-label">
            {t("MAKE ROOM FOR WHAT’S NEXT")}
          </span>
          <h3>
            {t("A little space.")}
            <br />
            {t("A lot of")}
            <br />
            <em>{t("possibility.")}</em>
          </h3>
          <p>
            {t("A considered experience.")}
            <br />
            {t("From first look to next step.")}
          </p>
          <span className="product-link">
            {t("Find your next chapter")}{" "}
            <b>
              <Icon name="arrow-up-right" />
            </b>
          </span>
        </div>
        <div className="product-object">
          <div className="object-orbit" />
          <Symbol assetBase={assetBase} />
          <span>{t("FORM / FUNCTION / FEELING")}</span>
        </div>
      </div>
      <div className="product-bottom">
        <span>{t("Designed with intention.")}</span>
        <span>
          {t("Explore what’s possible")} <Icon name="arrow-down" />
        </span>
      </div>
    </div>
  );
}

export function StudioHero({ assetBase }: { assetBase: string }) {
  const { t } = useLanguage();
  const ref = useScrollScene<HTMLElement>();
  return (
    <section className="studio-hero" ref={ref} aria-labelledby="hero-title">
      <div className="wrap hero-editorial">
        <div className="hero-studio-line">
          <p className="eyebrow">
            <span className="blue-dot" /> {t("INDEPENDENT DIGITAL STUDIO")}
          </p>
          <span>{t("PUERTO RICO / BUILT WITH INTENTION")}</span>
        </div>
        <div className="hero-type">
          <h1 id="hero-title">
            {t("Good design.")}
            <br />
            {t("Real")} <em>{t("possibility.")}</em>
          </h1>
          <div className="hero-intro">
            <p>{t("Website design and development for service businesses in Puerto Rico.")}</p>
            <p>
              {t(
                "Help people understand your services, get in touch, and take the next step. Designed and built with Jose, from the first conversation to the handoff.",
              )}
            </p>
            <div className="hero-actions">
            <a className="button blue" href="#project">{t("Tell me about your business")} <Icon /></a>
            <a className="text-link" href="#work">
              {t("Explore the work")}{" "}
              <span aria-hidden="true">
                <Icon name="arrow-up-right" />
              </span>
            </a>
            </div>
          </div>
        </div>
        <div className="hero-stage" aria-hidden="true">
          <div className="hero-coordinate">
            {t("ADELVIO STUDIO")}
            <br />
            {t("DESIGN × ENGINEERING")}
            <span>{t("01 — EXPLORE")}</span>
          </div>
          <div className="hero-stage-grid" />
          <div className="hero-window">
            <ProductWindow assetBase={assetBase} />
          </div>
          <div className="hero-note-interface">
            <span className="interface-label">
              {t("THE NEXT STEP, SIMPLIFIED")}
            </span>
            <div className="note-message">
              <span className="note-icon" aria-hidden="true">
                <Icon name="arrow-up-right" />
              </span>
              <div>
                <b>{t("A new inquiry.")}</b>
                <span>{t("A conversation waiting to happen.")}</span>
              </div>
            </div>
            <div className="note-route">
              <span>{t("Website")}</span>
              <i aria-hidden="true" />
              <span>{t("Your inbox")}</span>
            </div>
          </div>
          <div className="hero-mobile">
            <span className="mobile-ear" />
            <span className="interface-label">{t("CHAPTER / ON THE GO")}</span>
            <h3>
              {t("Your next")}
              <br />
              {t("chapter.")}
              <br />
              <em>{t("Closer.")}</em>
            </h3>
            <div className="mobile-disc">
              <Symbol assetBase={assetBase} />
            </div>
            <div className="mobile-bottom">
              {t("A simpler next step")}{" "}
              <span>
                <Icon name="arrow-up-right" />
              </span>
            </div>
          </div>
          <div className="hero-axis" aria-hidden="true">
            <span>{t("IDEA")}</span>
            <i />
            <span>{t("EXPERIENCE")}</span>
          </div>
        </div>
        <div className="hero-baseline">
          <span>{t("INTERFACE EXPLORATIONS — NOT CLIENT WORK")}</span>
          <a href="#approach">
            {t("Scroll to see how it connects")}{" "}
            <span aria-hidden="true">
              <Icon name="arrow-down" />
            </span>
          </a>
          <span>{t("DESIGNED HERE. READY FOR WHAT’S NEXT.")}</span>
        </div>
      </div>
      <div className="studio-promise wrap">
        <a className="studio-person" href="#about"><img src={assetBase + "profile_image.jpg"} width={52} height={52} alt="" loading="lazy" /><span><b>Jose Rodriguez</b><small>{t("Your direct design & development contact")}</small></span><Icon /></a>
        <p>{t("A small studio. A direct conversation.")}</p>
        <a className="text-link" href="#packages">{t("Clear scope. Published prices.")} <Icon name="arrow-down" /></a>
      </div>
    </section>
  );
}

const chapters = [
  {
    label: "Make an impression",
    title: "A first impression.\nA lasting connection.",
    body: "Make what you do easy to understand and hard to forget. Start with a thoughtfully designed website, built around your business and the people who use it.",
    detail: "WEBSITE DESIGN & DEVELOPMENT",
    link: "Explore website packages",
    href: "#packages",
  },
  {
    label: "Make the next step easy",
    title: "Less friction.\nMore connection.",
    body: "Move naturally from interest to action. Clear contact paths and supported booking tools help people take the next step, without having to figure it out themselves.",
    detail: "CONTACT FLOWS & BOOKING SETUP",
    link: "Explore Appointments",
    href: "#package-appointments",
  },
  {
    label: "Think beyond the page",
    title: "A bigger picture.\nBuilt around you.",
    body: "An online store. A connected workflow. A tool for the way your business works. When your idea goes beyond a website, start with a conversation and a separate scope.",
    detail: "CUSTOM APPLICATIONS & INTEGRATIONS / SEPARATE SCOPE",
    link: "Discuss your idea",
    href: "mailto:jose.rodriguez.velez@gmail.com?subject=Adelvio%20%E2%80%94%20Custom%20project%20inquiry",
  },
];

export function SystemStory({ assetBase }: { assetBase: string }) {
  const { t } = useLanguage();
  const [stage, setStage] = useState(0);
  const ref = useScrollScene<HTMLElement>(true, (p) =>
    setStage(Math.min(2, Math.floor(p * 3))),
  );
  const current = chapters[stage];
  function choose(index: number) {
    setStage(index);
    if (window.matchMedia(PINNED_MOTION_QUERY).matches && ref.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top:
          top +
          (ref.current.offsetHeight - window.innerHeight) *
            ((index + 0.15) / 3),
        behavior: "instant",
      });
    }
  }
  return (
    <section
      className="system-story"
      id="approach"
      ref={ref}
      data-stage={stage}
      aria-labelledby="systems-title"
    >
      <div className="system-sticky">
        <div className="wrap">
          <div className="system-topline">
            <p className="eyebrow">{t("01 / A CONNECTED WAY OF THINKING")}</p>
            <span>{t("DESIGN IS THE START. POSSIBILITY IS THE POINT.")}</span>
          </div>
          <div className="system-layout">
            <div className="system-copy">
              <div className="chapter-counter" aria-hidden="true">
                0{stage + 1}
                <span>/ 03</span>
              </div>
              <div className="chapter-copy" key={stage}>
                <h2 id="systems-title">
                  {t(current.title)
                    .split("\n")
                    .map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                </h2>
                <p>{t(current.body)}</p>
                <span className="chapter-detail">{t(current.detail)}</span>
                <a className="text-link" href={current.href.startsWith('mailto:') ? 'mailto:jose.rodriguez.velez@gmail.com?subject='+encodeURIComponent('Adelvio — '+t('Custom project inquiry')) : current.href}>
                  {t(current.link)}
                  <span aria-hidden="true">
                    <Icon name="arrow-up-right" />
                  </span>
                </a>
              </div>
            </div>
            <div
              className="system-canvas"
              role="img"
              aria-label={t(
                "Illustrative interface evolving from a website into a connected workflow. This is a design demonstration, not a live integration.",
              )}
            >
              <div className="system-grid" />
              <div className="system-browser">
                <ProductWindow assetBase={assetBase} />
              </div>
              <div
                className="system-connection connection-one"
                aria-hidden="true"
              />
              <div
                className="system-connection connection-two"
                aria-hidden="true"
              />
              <div className="system-node node-inquiry">
                <div className="node-heading">
                  <span className="node-icon">
                    <Icon name="arrow-up-right" />
                  </span>
                  <span>{t("01 / CONTACT")}</span>
                </div>
                <h3>{t("A new inquiry")}</h3>
                <div className="node-field">
                  {t("Your business")}{" "}
                  <span>
                    <Icon name="return-left" />
                  </span>
                </div>
                <div className="node-field">
                  {t("What’s next?")}{" "}
                  <span>
                    <Icon name="return-left" />
                  </span>
                </div>
                <span className="node-action">
                  {t("Start a conversation")}{" "}
                  <i>
                    <Icon name="arrow-up-right" />
                  </i>
                </span>
              </div>
              <div className="system-node node-workflow">
                <div className="node-heading">
                  <Symbol assetBase={assetBase} />
                  <span>{t("02 / CONNECT")}</span>
                </div>
                <h3>{t("The right next step.")}</h3>
                <div className="workflow-step">
                  <span>01</span> {t("Receive an inquiry")}{" "}
                  <i>
                    <Icon name="check" />
                  </i>
                </div>
                <div className="workflow-step">
                  <span>02</span> {t("Organize the details")}{" "}
                  <i>
                    <Icon name="check" />
                  </i>
                </div>
                <div className="workflow-step">
                  <span>03</span> {t("Prepare a follow-up")}{" "}
                  <i>
                    <Icon name="arrow-up-right" />
                  </i>
                </div>
              </div>
              <div className="system-node node-inbox">
                <span className="node-icon">
                  <Icon name="corner-down-right" />
                </span>
                <div>
                  <b>{t("Ready for a human.")}</b>
                  <span>{t("More space for the work that matters.")}</span>
                </div>
              </div>
              <span className="system-annotation">
                {t(
                  stage === 0
                    ? "A THOUGHTFUL DIGITAL PRESENCE"
                    : stage === 1
                      ? "A CLEAR PATH FROM INTEREST TO ACTION"
                      : "ILLUSTRATIVE WORKFLOW / NOT A LIVE INTEGRATION",
                )}
              </span>
            </div>
          </div>
          <div
            className="chapter-controls"
            aria-label={t("Explore the three stages")}
          >
            {chapters.map((item, i) => (
              <button
                key={t(item.label)}
                type="button"
                onClick={() => choose(i)}
                aria-pressed={stage === i}
              >
                <span>0{i + 1}</span>
                {t(item.label)}
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BookingDemo({ assetBase }: { assetBase: string }) {
  const { t, language } = useLanguage();
  const [date, setDate] = useState(14);
  const [time, setTime] = useState("10:00 AM");
  return (
    <div className="booking-demo">
      <div className="demo-caption">
        <span className="eyebrow">{t("INTERACTION STUDY / 02")}</span>
        <span>
          {t("Try the calendar")} <Icon name="arrow-down-right" />
        </span>
      </div>
      <div className="booking-scene">
        <span className="booking-backdrop" aria-hidden="true">
          {t("A little")}
          <br />
          <em>{t("time.")}</em>
        </span>
        <div className="interactive-phone">
          <span className="mobile-ear" />
          <div className="booking-top">
            <span>{t("YOUR NEXT CHAPTER")}</span>
            <Symbol assetBase={assetBase} />
          </div>
          <h3>
            {t("Time, well")}
            <br />
            {t("spent.")}
          </h3>
          <p>{t("A moment for what matters.")}</p>
          <div className="booking-month">
            {t("Sample availability")}{" "}
            <span aria-hidden="true">
              <Icon name="arrow-up-right" />
            </span>
          </div>
          <div
            className="booking-days"
            role="group"
            aria-label={t("Choose a sample day")}
          >
            {[12, 13, 14, 15, 16].map((day, i) => (
              <button
                type="button"
                key={day}
                aria-label={t("Sample {weekday}, day {day}", {
                  weekday: t(
                    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
                  ),
                  day,
                })}
                aria-pressed={date === day}
                onClick={() => setDate(day)}
              >
                <span>
                  {
                    (language === "es"
                      ? ["L", "M", "M", "J", "V"]
                      : ["M", "T", "W", "T", "F"])[i]
                  }
                </span>
                <b>{day}</b>
              </button>
            ))}
          </div>
          <div
            className="booking-times"
            role="group"
            aria-label={t("Choose a sample time")}
          >
            {["10:00 AM", "2:30 PM"].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={time === t}
                onClick={() => setTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="booking-selection" aria-live="polite">
            <span>{t("YOUR SELECTION")}</span>
            <b>
              {t("Day")} {date} · {time}
            </b>
          </div>
          <p className="booking-demo-note">
            {t("Interactive concept. No appointment is booked.")}
          </p>
        </div>
        <div className="booking-detached" aria-hidden="true">
          <span>{t("DESIGN DETAIL / 02")}</span>
          <b>
            {t("A small interaction.")}
            <br />
            {t("A simpler experience.")}
          </b>
          <i>
            <Icon name="arrow-up-right" />
          </i>
        </div>
      </div>
    </div>
  );
}
