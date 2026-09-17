"use client";
import { useLanguage } from "../i18n/LanguageProvider";
import { Icon } from "./Icon";
import { packages, carePlans, money } from "../offerings";

/** Expandable context for the existing original studies, never client case studies. */
export function ConceptNotes({ booking = false }: { booking?: boolean }) {
  const { t } = useLanguage();
  return (
    <details className="concept-notes">
      <summary>
        <span>{t("Inside this concept")}</span>
        <span className="concept-notes-hint">{t("The business need. The design decisions.")}</span>
        <Icon name="plus" />
      </summary>
      <div className="concept-notes-body">
        <div>
          <p className="eyebrow">{t("WHO IT IS FOR")}</p>
          <h4>{t(booking ? "A service worth making time for." : "Good work deserves a clear introduction.")}</h4>
          <p>{t(booking
            ? "An appointment-based business whose customers want to find a service and understand their next step on a phone."
            : "A small service business that wants visitors to understand its offer, see its character, and know how to get in touch.")}</p>
        </div>
        <div>
          <p className="eyebrow">{t("DESIGN & SCOPE")}</p>
          <p>{t(booking
            ? "Large touch targets, a short day-and-time selection, and an immediate summary keep the interaction easy to follow. This prototype uses sample availability."
            : "Editorial type, a restrained olive palette, and a clear contact path give the service room to speak. The desktop composition adapts into a focused mobile introduction.")}</p>
          <p className="concept-limit">{t(booking
            ? "A production project connects one supported booking provider. This concept does not book appointments or represent a custom scheduling platform."
            : "Scope shown: visual direction, service introduction, and a responsive interface concept. No client engagement or business results are implied.")}</p>
          <a className="text-link" href={booking ? "#package-appointments" : "#packages"}>
            {t(booking ? "See the Appointments scope" : "Find a starting package")} <Icon />
          </a>
        </div>
      </div>
    </details>
  );
}

export function CostGuide() {
  const { t } = useLanguage();
  return (
    <div className="cost-guide reveal" aria-label={t("How the costs work")}>
      <div className="cost-guide-heading"><span className="eyebrow">{t("A CLEAR INVESTMENT")}</span><p>{t("Your website first.")}<br /><em>{t("Your next steps, your choice.")}</em></p></div>
      <ol>
        <li><span>01</span><div><strong>{t("The project")}</strong><p>{t("One agreed build fee. 50% to begin; the remaining 50% after preview approval, before launch.")}</p></div></li>
        <li><span>02</span><div><strong>{t("The ongoing care")}</strong><p>{t("Optional monthly support, starting at launch. Choose a plan below or manage future updates independently.")}</p></div></li>
        <li><span>03</span><div><strong>{t("The provider costs")}</strong><p>{t("Domain, email, hosting upgrades and booking subscriptions are separate. Your accounts stay yours.")}</p></div></li>
      </ol>
    </div>
  );
}

export function PaymentBreakdown({ chosen, care }: { chosen: number; care: number }) {
  const { t } = useLanguage();
  return (
    <dl className="payment-breakdown">
      <div><dt>{t("To begin · 50%")}</dt><dd>{money(packages[chosen].price / 2)}</dd></div>
      <div><dt>{t("Before launch · 50%")}</dt><dd>{money(packages[chosen].price / 2)}</dd></div>
      <div><dt>{t("Optional care at launch")}</dt><dd>{care === 0 ? t("No monthly care") : money(carePlans[care].price) + t("/month")}</dd></div>
    </dl>
  );
}
