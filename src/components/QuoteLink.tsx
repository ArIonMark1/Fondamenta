"use client";

import type { ReactNode } from "react";
import type { WorkType } from "@/lib/leads";

/** Event the contact form listens to, to preselect "Tipo di lavoro". */
export const WORK_TYPE_EVENT = "quote:work-type";
export const QUOTE_FORM_ID = "preventivo";

/**
 * Plain anchor to the quote form (smooth-scrolls even without JS).
 * With JS it also tells the form which work type to preselect.
 */
export function QuoteLink({ workType, className, children }: { workType: WorkType; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${QUOTE_FORM_ID}`}
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent<WorkType>(WORK_TYPE_EVENT, { detail: workType }))}
    >
      {children}
    </a>
  );
}
