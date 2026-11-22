"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLead } from "@/app/actions";
import type { Dictionary, Locale } from "@/i18n";
import { workTypes, type LeadField, type LeadFormState } from "@/lib/leads";
import { QUOTE_FORM_ID, WORK_TYPE_EVENT } from "./QuoteLink";
import { BoxButton } from "./ui";

const initialState: LeadFormState = { status: "idle" };

const labelCls = "grid gap-[7px] text-xs font-semibold tracking-[0.08em] text-muted uppercase";

export function ContactForm({ t, lang }: { t: Dictionary["form"]; lang: Locale }) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const workTypeRef = useRef<HTMLSelectElement>(null);

  // A QuoteLink (e.g. a "Metodo" step) was clicked: preselect its work type.
  useEffect(() => {
    const onWorkType = (e: Event) => {
      const type = (e as CustomEvent<unknown>).detail;
      if (workTypeRef.current && (workTypes as readonly unknown[]).includes(type)) {
        workTypeRef.current.value = type as string;
      }
    };
    window.addEventListener(WORK_TYPE_EVENT, onWorkType);
    return () => window.removeEventListener(WORK_TYPE_EVENT, onWorkType);
  }, []);

  const values = state.status === "invalid" || state.status === "error" ? state.values : {};
  const invalid = new Set<LeadField>(state.status === "invalid" ? state.fields : []);
  const err = (f: LeadField) =>
    invalid.has(f) ? <span className="text-xs font-medium tracking-normal text-danger normal-case">{t.errors[f]}</span> : null;

  return (
    <form id={QUOTE_FORM_ID} action={formAction} noValidate className="reveal scroll-mt-6 grid content-start gap-[18px] bg-surface p-[18px] py-7 text-ink sm:p-11">
      <input type="hidden" name="locale" value={lang} />
      {/* Honeypot — hidden from people, bots tend to fill it */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-[18px] sm:grid-cols-2">
        <label className={labelCls}>
          {t.name}
          <input name="name" required autoComplete="name" defaultValue={values.name} aria-invalid={invalid.has("name")} className="field" />
          {err("name")}
        </label>
        <label className={labelCls}>
          {t.phone}
          <input name="phone" type="tel" required autoComplete="tel" defaultValue={values.phone} aria-invalid={invalid.has("phone")} className="field" />
          {err("phone")}
        </label>
      </div>

      <label className={labelCls}>
        {t.email}
        <input name="email" type="email" autoComplete="email" defaultValue={values.email} aria-invalid={invalid.has("email")} className="field" />
        {err("email")}
      </label>

      <label className={labelCls}>
        {t.type}
        <select ref={workTypeRef} name="workType" defaultValue={values.workType || workTypes[0]} className="field">
          {workTypes.map((w) => (
            <option key={w} value={w}>{t.types[w]}</option>
          ))}
        </select>
      </label>

      <label className={labelCls}>
        {t.message}
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          placeholder={t.messagePlaceholder}
          defaultValue={values.message}
          aria-invalid={invalid.has("message")}
          className="field resize-y"
        />
        {err("message")}
      </label>

      <label className="flex items-start gap-3 text-[13px] text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          defaultChecked={values.consent === "on"}
          aria-invalid={invalid.has("consent")}
          className="mt-0.5 size-4 flex-none accent-brand"
        />
        <span>
          {t.consent}
          {invalid.has("consent") && <span className="block text-xs font-medium text-danger">{t.errors.consent}</span>}
        </span>
      </label>

      <BoxButton type="submit" variant="orange" disabled={pending} className="mt-1.5 justify-self-start">
        {/* keyed span: React swaps the element instead of editing a text node,
            which stays correct even when the page is machine-translated */}
        <span key={pending ? "sending" : "send"}>{pending ? t.sending : t.send}</span>
      </BoxButton>

      <div aria-live="polite">
        {state.status === "success" && <p className="bg-[#edf7ef] px-3.5 py-3 text-sm font-medium text-[#1e6b34] dark:bg-[#12301d] dark:text-[#8fe0a6]">{t.success}</p>}
        {state.status === "invalid" && <p className="text-sm font-medium text-danger">{t.errors.invalid}</p>}
        {state.status === "error" && <p className="bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">{t.errors.server}</p>}
      </div>
    </form>
  );
}
