"use client";
/* eslint-disable @next/next/no-img-element -- Shared static builds serve local assets without a Next image server. */
import { LanguageProvider, useLanguage } from "./i18n/LanguageProvider";
import { SiteHeader } from "./components/SiteHeader";
import { Icon } from "./components/Icon";
import { useEffect, useState } from "react";
import {
  StudioHero,
  SystemStory,
  BookingDemo,
} from "./components/StudioExperience";
import { packages, carePlans, extras, questions, money } from "./offerings";
export default function Home({ assetBase = "/" }: { assetBase?: string } = {}) {
  return (
    <LanguageProvider>
      <HomeContent assetBase={assetBase} />
    </LanguageProvider>
  );
}
function HomeContent({ assetBase }: { assetBase: string }) {
  const { t } = useLanguage();
  const brandSymbol = (
    <img
      className="brand-symbol"
      src={assetBase + "adelvio-symbol.webp"}
      width={512}
      height={512}
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  );
  const [chosen, setChosen] = useState(0);
  const [care, setCare] = useState(0);
  const [business, setBusiness] = useState("");
  const [goal, setGoal] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements.forEach((el) => {
      el.classList.add("will-reveal");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  function selectPackage(index: number) {
    setChosen(index);
    setNotice("");
    document.getElementById("business")?.focus({ preventScroll: true });
    document
      .getElementById("project")
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  function prepareBrief(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = [
      t("ADELVIO — WEBSITE PROJECT BRIEF"),
      t("For Jose Rodriguez"),
      "jose.rodriguez.velez@gmail.com | (787) 413-3348",
      "",
      t("Business:") + " " + business,
      t("Project:") + " " + goal,
      "",
      t("Website:") +
        " " +
        t(packages[chosen].name) +
        " — " +
        money(packages[chosen].price) +
        " " +
        t("one-time"),
      t("Optional care:") +
        " " +
        t(carePlans[care].name) +
        " — " +
        money(carePlans[care].price) +
        t("/month"),
      "",
      t("50% to begin; 50% after preview approval before launch."),
      t(
        "USD, before applicable taxes. Domain, email, hosting upgrades, booking subscriptions and transaction fees are separate.",
      ),
      t(
        "This is a planning brief, not an accepted quote. Final scope and timing require agreement.",
      ),
    ].join("\n");
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
      "data-action",
    );
    if (action !== "download") {
      window.location.href =
        "mailto:jose.rodriguez.velez@gmail.com?subject=" +
        encodeURIComponent(t("Adelvio website inquiry") + " — " + business) +
        "&body=" +
        encodeURIComponent(text);
      setNotice(
        "Your email app will open a draft. Review it and press Send there. If it does not open, download your brief and email Jose directly.",
      );
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adelvio-project-brief.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Your brief is ready to save. Nothing has been submitted.");
  }
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to content")}
      </a>
      <SiteHeader assetBase={assetBase} />
      <main id="main">
        <StudioHero assetBase={assetBase} />
        <SystemStory assetBase={assetBase} />
        <section
          className="work-section"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="wrap">
            <div className="work-heading reveal">
              <p className="eyebrow">{t("02 / SELECTED EXPLORATIONS")}</p>
              <h2 id="work-title">
                {t("The details make")}
                <br />
                <em>{t("the difference.")}</em>
              </h2>
              <p>
                {t("Not just something to look at.")}
                <br />
                {t("Something to experience.")}
              </p>
            </div>
            <article className="work-case">
              <div className="work-case-copy reveal">
                <span className="work-index">{t("01 / DESIGN STUDY")}</span>
                <h3>
                  {t("A presence.")}
                  <br />
                  {t("With personality.")}
                </h3>
                <p>
                  {t(
                    "An editorial approach to a service business. Clear hierarchy, considered composition, and room for the details that make it yours.",
                  )}
                </p>
                <dl>
                  <div>
                    <dt>{t("FOCUS")}</dt>
                    <dd>{t("Visual identity / Web experience")}</dd>
                  </div>
                  <div>
                    <dt>{t("STATUS")}</dt>
                    <dd>{t("Original design concept")}</dd>
                  </div>
                </dl>
                <span className="work-direction" aria-hidden="true">
                  <Icon name="arrow-down-right" />
                </span>
              </div>
              <figure className="work-visual reveal">
                <div
                  className="concept-one"
                  aria-label={t("Editorial services website design concept")}
                >
                  <div className="showcase-browser">
                    <span>
                      <Icon name="window-dots" />
                    </span>
                    <span>{t("CONCEPT / SERVICES")}</span>
                    <span>
                      <Icon name="arrow-up-right" />
                    </span>
                  </div>
                  <div className="folio-nav">
                    <b>THE DETAIL.</b>
                    <span>
                      {t("Good care starts here")}{" "}
                      <Icon name="arrow-up-right" />
                    </span>
                  </div>
                  <div className="folio-body">
                    <div>
                      <span className="mini-kicker">
                        {t("A DIFFERENT PERSPECTIVE")}
                      </span>
                      <h3>
                        {t("Made to")}
                        <br />
                        <em>{t("stand out.")}</em>
                      </h3>
                      <span className="folio-button">
                        {t("Discover the details")}{" "}
                        <Icon name="arrow-up-right" />
                      </span>
                    </div>
                    <div className="folio-object">
                      <div />
                      <span>{t("AN EXPLORATION IN FORM")}</span>
                    </div>
                  </div>
                  <div className="folio-foot">
                    <span>{t("Considered design.")}</span>
                    <span>{t("From first look to next step.")}</span>
                  </div>
                </div>
                <figcaption>
                  <span>{t("THE DETAIL / EDITORIAL WEBSITE CONCEPT")}</span>
                  <span>
                    {t("DESKTOP EXPLORATION")} <Icon name="arrow-up-right" />
                  </span>
                </figcaption>
              </figure>
            </article>
            <div className="work-booking reveal">
              <BookingDemo assetBase={assetBase} />
              <div className="booking-case-caption">
                <div>
                  <span className="work-index">
                    {t("02 / INTERACTION STUDY")}
                  </span>
                  <h3>{t("A simpler next step.")}</h3>
                </div>
                <p>
                  {t("An appointment-led mobile experience.")}
                  <br />
                  {t("Tap a day and time to explore the details.")}
                </p>
              </div>
            </div>
            <p className="showcase-disclaimer">
              {t(
                "These are original design concepts, not completed client projects. No client outcomes are implied.",
              )}
            </p>
          </div>
        </section>
        <section className="packages-section wrap section-space" id="packages">
          <div className="split-heading reveal">
            <div>
              <p className="eyebrow">{t("03 / WEBSITE PACKAGES")}</p>
              <h2>
                {t("A good fit for")}
                <br />
                {t("your next chapter.")}
              </h2>
            </div>
            <p>
              {t(
                "One focused page or a little more room to grow. Choose a clear starting point for your business.",
              )}
            </p>
          </div>
          <div className="package-grid">
            {packages.map((pack, index) => (
              <article
                className="package reveal"
                id={"package-" + pack.name.toLowerCase()}
                key={pack.name}
              >
                <div className="package-top">
                  <span className="package-no">0{index + 1}</span>
                  <span aria-hidden="true">
                    <Icon name="arrow-up-right" />
                  </span>
                </div>
                <h3>{t(pack.name)}</h3>
                <p className="package-description">{t(pack.description)}</p>
                <p className="package-price">
                  {money(pack.price)}
                  <span>{t("one-time build")}</span>
                </p>
                <p className="package-tag">{t(pack.tag)}</p>
                <ul>
                  {pack.features.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true">
                        <Icon name="check" />
                      </span>
                      {t(item)}
                    </li>
                  ))}
                </ul>
                <button
                  className={"button " + (index === 1 ? "blue" : "outline")}
                  onClick={() => selectPackage(index)}
                >
                  <span>{t("Choose")} {t(pack.name)}</span>
                  <span aria-hidden="true">
                    <Icon name="arrow-up-right" />
                  </span>
                </button>
              </article>
            ))}
          </div>
          <div className="package-footnote">
            <p>
              <b>{t("Included in every build")}</b>{" "}
              {t(
                "Mobile layout, domain connection, HTTPS checks, testing, source handoff, and a 30-day correction period for delivered defects.",
              )}
            </p>
            <p>
              {t(
                "USD, before applicable taxes. One language unless agreed otherwise. Domain, email, hosting upgrades, booking subscriptions, and transaction fees are separate. 50% to begin; 50% before launch.",
              )}
            </p>
          </div>
        </section>
        <section className="process-section" id="process">
          <div className="wrap">
            <div className="process-title reveal">
              <div>
                <p className="eyebrow">{t("04 / HOW IT COMES TOGETHER")}</p>
                <h2>
                  {t("Good work.")}
                  <br />
                  <span>{t("Clear steps.")}</span>
                </h2>
              </div>
              <p>
                {t(
                  "A straightforward process, with space for your input and a clear moment to approve.",
                )}
              </p>
            </div>
            <div className="process-grid">
              {[
                [
                  "Set the scope",
                  "Choose the pages, content and contact flow. Agree on the proposal and initial payment.",
                ],
                [
                  "Shape the website",
                  "Bring your approved text and images into a considered design. Review it together.",
                ],
                [
                  "Make it live",
                  "Approve the preview, complete the payment, and launch with tested links and a clear handoff.",
                ],
                [
                  "Choose your care",
                  "Keep things up to date with an optional plan, or manage future updates independently.",
                ],
              ].map(([title, body], index) => (
                <div className="process-step reveal" key={title}>
                  <span>0{index + 1}</span>
                  <h3>{t(title)}</h3>
                  <p>{t(body)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="care-section wrap section-space" id="care">
          <div className="split-heading reveal">
            <div>
              <p className="eyebrow">{t("05 / AFTER THE LAUNCH")}</p>
              <h2>
                {t("Keep it current.")}
                <br />
                <span className="muted-heading">
                  {t("Keep moving forward.")}
                </span>
              </h2>
            </div>
            <p>
              {t(
                "Your website is yours. Ongoing care is optional, with clear limits and a plan for the work that matters.",
              )}
            </p>
          </div>
          <div className="care-table reveal">
            <div className="care-row">
              <div>
                <span className="care-index">01</span>
                <h3>{t("Technical Care")}</h3>
              </div>
              <p>
                {t(
                  "Monitoring, monthly technical checks, recovery archive, renewal reminders. Up to 30 minutes of routine technical work.",
                )}
              </p>
              <p className="care-price">
                $49<span>{t("/ month")}</span>
              </p>
              <a
                href="#project"
                onClick={() => setCare(1)}
                aria-label={t("Select Technical Care")}
              >
                <Icon name="arrow-up-right" />
              </a>
            </div>
            <div className="care-row">
              <div>
                <span className="care-index">02</span>
                <h3>{t("Care Plus")}</h3>
              </div>
              <p>
                {t(
                  "Technical Care, an inquiry-path check and work summary, plus up to 30 minutes of content edits.",
                )}
              </p>
              <p className="care-price">
                $99<span>{t("/ month")}</span>
              </p>
              <a
                href="#project"
                onClick={() => setCare(2)}
                aria-label={t("Select Care Plus")}
              >
                <Icon name="arrow-up-right" />
              </a>
            </div>
            <div className="care-row">
              <div>
                <span className="care-index">03</span>
                <h3>{t("Local Growth")}</h3>
              </div>
              <p>
                {t(
                  "Technical coverage, monthly inquiry review, and up to 90 minutes for content updates and one prioritized improvement.",
                )}
              </p>
              <p className="care-price">
                $199<span>{t("/ month")}</span>
              </p>
              <a
                href="#project"
                onClick={() => setCare(3)}
                aria-label={t("Select Local Growth")}
              >
                <Icon name="arrow-up-right" />
              </a>
            </div>
          </div>
          <p className="fine-print">
            {t(
              "Care starts at launch. Unused time does not roll over. New pages, redesigns and integrations are separate. Additional approved work: $60/hour, 30-minute minimum.",
            )}
          </p>
          <div className="extras reveal">
            <div>
              <p className="eyebrow">{t("A LITTLE SOMETHING EXTRA")}</p>
              <h3>
                {t("Add what")}
                <br />
                {t("you need.")}
              </h3>
              <p>
                {t("Keep the first step focused.")}
                <br />
                {t("Build on it when the time is right.")}
              </p>
            </div>
            <dl>
              {extras.map(([title, price]) => (
                <div key={title}>
                  <dt>{t(title)}</dt>
                  <dd>{t(price)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section className="faq-section wrap section-space" id="questions">
          <div className="faq-heading reveal">
            <p className="eyebrow">{t("06 / THE PRACTICAL DETAILS")}</p>
            <h2>
              {t("Good questions.")}
              <br />
              {t("Clear answers.")}
            </h2>
          </div>
          <div className="faq-list">
            {questions.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {t(q)}
                  <span aria-hidden="true">
                    <Icon name="plus" />
                  </span>
                </summary>
                <p>{t(a)}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="founder-section wrap section-space" id="about">
          <figure className="founder-portrait reveal">
            <img
              src={assetBase + "profile_image.jpg"}
              alt={t("Jose Rodriguez, the person behind Adelvio")}
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              {t("THE PERSON BEHIND ADELVIO")}{" "}
              <span aria-hidden="true">
                <Icon name="arrow-up-right" />
              </span>
            </figcaption>
          </figure>
          <div className="founder-copy reveal">
            <p className="eyebrow">{t("PERSONAL ATTENTION / PUERTO RICO")}</p>
            <h2>
              {t("Design thinking.")}
              <br />
              <span className="muted-heading">
                {t("Engineering")}
                <br />
                {t("at heart.")}
              </span>
            </h2>
            <p className="founder-intro">
              {t(
                "I’m Jose Rodriguez, the person behind Adelvio, an independent digital studio in Puerto Rico. I bring a computer engineering background to thoughtful web experiences, with clear communication and personal attention from the first conversation to the handoff.",
              )}
            </p>
            <p className="founder-degree">
              {t("B.S. in Computer Engineering")} <span>PUPR</span>
            </p>
            <a
              className="founder-email"
              href="mailto:jose.rodriguez.velez@gmail.com"
            >
              jose.rodriguez.velez@gmail.com{" "}
              <span aria-hidden="true">
                <Icon name="arrow-up-right" />
              </span>
            </a>
            <a className="founder-phone" href="tel:+17874133348">
              (787) 413-3348{" "}
              <span aria-hidden="true">
                <Icon name="arrow-up-right" />
              </span>
            </a>
            <div className="social-links">
              <a
                href="https://www.linkedin.com/in/jose-g-rodriguez-velez/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn <Icon name="arrow-up-right" />
              </a>
              <a
                href="https://www.instagram.com/jose_rvelez/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram <Icon name="arrow-up-right" />
              </a>
            </div>
          </div>
        </section>
        <section className="project-section" id="project">
          <div className="wrap project-layout">
            <div className="project-heading reveal">
              <p className="eyebrow">{t("AN IDEA IS A GOOD PLACE TO START")}</p>
              <h2>
                {t("Let’s make")}
                <br />
                <em>{t("what’s next.")}</em>
              </h2>
              <p>
                {t(
                  "A new website. A better experience. Something you haven’t quite put into words yet. Let’s talk about the next step for your business.",
                )}
              </p>
              <div className="contact-shortcuts">
                <a href="mailto:jose.rodriguez.velez@gmail.com">
                  {t("Email Jose")} <Icon name="arrow-up-right" />
                </a>
                <a href="tel:+17874133348">
                  {t("Call (787) 413-3348")} <Icon name="arrow-up-right" />
                </a>
              </div>
              <p className="custom-project-note">
                {t("Have a custom application or integration in mind?")}{" "}
                <a href={'mailto:jose.rodriguez.velez@gmail.com?subject='+encodeURIComponent('Adelvio — '+t('Custom project inquiry'))}>
                  {t("Email your idea")} <Icon name="arrow-up-right" />
                </a>{" "}
                {t("for a separate scope.")}
              </p>
              <span className="project-symbol" aria-hidden="true">
                {brandSymbol}
              </span>
            </div>
            <form className="project-form" onSubmit={prepareBrief}>
              <p className="form-title">{t("Plan a website project")}</p>
              <label htmlFor="business">
                {t("Your business name")}
                <input
                  id="business"
                  autoComplete="organization"
                  required
                  maxLength={100}
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder={t("The name behind the next chapter")}
                />
              </label>
              <div className="field-grid">
                <label htmlFor="build">
                  {t("Website package")}
                  <select
                    id="build"
                    value={chosen}
                    onChange={(e) => {
                      setChosen(Number(e.target.value));
                      setNotice("");
                    }}
                  >
                    {packages.map((p, i) => (
                      <option key={p.name} value={i}>
                        {t(p.name)} — {money(p.price)}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor="monthly">
                  {t("Optional ongoing care")}
                  <select
                    id="monthly"
                    value={care}
                    onChange={(e) => {
                      setCare(Number(e.target.value));
                      setNotice("");
                    }}
                  >
                    {carePlans.map((p, i) => (
                      <option key={p.name} value={i}>
                        {t(p.name)}
                        {p.price ? " — " + money(p.price) + t("/mo") : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label htmlFor="goal">
                {t("What would you like your website to do?")}
                <textarea
                  id="goal"
                  rows={3}
                  required
                  maxLength={1500}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={t(
                    "Tell your story, show your services, make booking easier…",
                  )}
                />
              </label>
              <div className="brief-total" aria-live="polite">
                <span>{t("YOUR STARTING POINT")}</span>
                <div>
                  <strong>{money(packages[chosen].price)}</strong>
                  <span>
                    {t("build")}{" "}
                    {care > 0
                      ? "+ " + money(carePlans[care].price) + t("/month care")
                      : t("· no monthly care")}
                  </span>
                </div>
              </div>
              <p className="form-note">
                {t(
                  "Before taxes and provider fees. Final scope and timing are confirmed in your proposal.",
                )}
              </p>
              <button
                className="button paper"
                type="submit"
                data-action="email"
              >
                {t("Prepare an email to Jose")}
                <span aria-hidden="true">
                  <Icon name="arrow-up-right" />
                </span>
              </button>
              <button
                className="brief-download"
                type="submit"
                data-action="download"
              >
                {t("Download your brief instead")} <Icon name="arrow-down" />
              </button>
              <p className="download-note" role="status">
                {t(
                  notice ||
                    "Opens your email app with a draft. You review and send it there.",
                )}
              </p>
            </form>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <a className="wordmark" href="#">
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
        <span>
          {t("Independent digital studio · Puerto Rico · By Jose Rodriguez")}
        </span>
        <a href="#main">
          {t("Back to top")} <Icon name="arrow-up" />
        </a>
      </footer>
    </>
  );
}
