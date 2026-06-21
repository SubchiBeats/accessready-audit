import type { ComplianceMode, WcagReference } from "@/lib/types";

const base = "https://www.w3.org/WAI/WCAG22/Understanding/";
const wcag21Base = "https://www.w3.org/WAI/WCAG21/Understanding/";
const wcag20Base = "https://www.w3.org/WAI/WCAG20/Understanding/";

export const wcagReferences: Record<string, WcagReference> = {
  "1.1.1": {
    standard: "WCAG 2.2",
    criterion: "1.1.1",
    level: "A",
    name: "Non-text Content",
    url: `${base}non-text-content.html`
  },
  "1.2.2": {
    standard: "WCAG 2.2",
    criterion: "1.2.2",
    level: "A",
    name: "Captions (Prerecorded)",
    url: `${base}captions-prerecorded.html`
  },
  "1.2.3": {
    standard: "WCAG 2.2",
    criterion: "1.2.3",
    level: "A",
    name: "Audio Description or Media Alternative",
    url: `${base}audio-description-or-media-alternative-prerecorded.html`
  },
  "1.3.1": {
    standard: "WCAG 2.2",
    criterion: "1.3.1",
    level: "A",
    name: "Info and Relationships",
    url: `${base}info-and-relationships.html`
  },
  "1.3.2": {
    standard: "WCAG 2.2",
    criterion: "1.3.2",
    level: "A",
    name: "Meaningful Sequence",
    url: `${base}meaningful-sequence.html`
  },
  "1.3.4": {
    standard: "WCAG 2.2",
    criterion: "1.3.4",
    level: "AA",
    name: "Orientation",
    url: `${base}orientation.html`
  },
  "1.3.5": {
    standard: "WCAG 2.2",
    criterion: "1.3.5",
    level: "AA",
    name: "Identify Input Purpose",
    url: `${base}identify-input-purpose.html`
  },
  "1.4.2": {
    standard: "WCAG 2.2",
    criterion: "1.4.2",
    level: "A",
    name: "Audio Control",
    url: `${base}audio-control.html`
  },
  "1.4.5": {
    standard: "WCAG 2.2",
    criterion: "1.4.5",
    level: "AA",
    name: "Images of Text",
    url: `${base}images-of-text.html`
  },
  "1.4.1": {
    standard: "WCAG 2.2",
    criterion: "1.4.1",
    level: "A",
    name: "Use of Color",
    url: `${base}use-of-color.html`
  },
  "1.4.3": {
    standard: "WCAG 2.2",
    criterion: "1.4.3",
    level: "AA",
    name: "Contrast (Minimum)",
    url: `${base}contrast-minimum.html`
  },
  "1.4.4": {
    standard: "WCAG 2.2",
    criterion: "1.4.4",
    level: "AA",
    name: "Resize Text",
    url: `${base}resize-text.html`
  },
  "1.4.10": {
    standard: "WCAG 2.2",
    criterion: "1.4.10",
    level: "AA",
    name: "Reflow",
    url: `${base}reflow.html`
  },
  "1.4.11": {
    standard: "WCAG 2.2",
    criterion: "1.4.11",
    level: "AA",
    name: "Non-text Contrast",
    url: `${base}non-text-contrast.html`
  },
  "1.4.13": {
    standard: "WCAG 2.2",
    criterion: "1.4.13",
    level: "AA",
    name: "Content on Hover or Focus",
    url: `${base}content-on-hover-or-focus.html`
  },
  "2.1.1": {
    standard: "WCAG 2.2",
    criterion: "2.1.1",
    level: "A",
    name: "Keyboard",
    url: `${base}keyboard.html`
  },
  "2.1.2": {
    standard: "WCAG 2.2",
    criterion: "2.1.2",
    level: "A",
    name: "No Keyboard Trap",
    url: `${base}no-keyboard-trap.html`
  },
  "2.2.1": {
    standard: "WCAG 2.2",
    criterion: "2.2.1",
    level: "A",
    name: "Timing Adjustable",
    url: `${base}timing-adjustable.html`
  },
  "2.2.2": {
    standard: "WCAG 2.2",
    criterion: "2.2.2",
    level: "A",
    name: "Pause, Stop, Hide",
    url: `${base}pause-stop-hide.html`
  },
  "2.3.1": {
    standard: "WCAG 2.2",
    criterion: "2.3.1",
    level: "A",
    name: "Three Flashes or Below Threshold",
    url: `${base}three-flashes-or-below-threshold.html`
  },
  "2.4.1": {
    standard: "WCAG 2.2",
    criterion: "2.4.1",
    level: "A",
    name: "Bypass Blocks",
    url: `${base}bypass-blocks.html`
  },
  "2.4.2": {
    standard: "WCAG 2.2",
    criterion: "2.4.2",
    level: "A",
    name: "Page Titled",
    url: `${base}page-titled.html`
  },
  "2.4.3": {
    standard: "WCAG 2.2",
    criterion: "2.4.3",
    level: "A",
    name: "Focus Order",
    url: `${base}focus-order.html`
  },
  "2.4.4": {
    standard: "WCAG 2.2",
    criterion: "2.4.4",
    level: "A",
    name: "Link Purpose (In Context)",
    url: `${base}link-purpose-in-context.html`
  },
  "2.4.6": {
    standard: "WCAG 2.2",
    criterion: "2.4.6",
    level: "AA",
    name: "Headings and Labels",
    url: `${base}headings-and-labels.html`
  },
  "2.4.7": {
    standard: "WCAG 2.2",
    criterion: "2.4.7",
    level: "AA",
    name: "Focus Visible",
    url: `${base}focus-visible.html`
  },
  "2.4.11": {
    standard: "WCAG 2.2",
    criterion: "2.4.11",
    level: "AA",
    name: "Focus Not Obscured (Minimum)",
    url: `${base}focus-not-obscured-minimum.html`
  },
  "2.5.3": {
    standard: "WCAG 2.2",
    criterion: "2.5.3",
    level: "A",
    name: "Label in Name",
    url: `${base}label-in-name.html`
  },
  "2.5.5": {
    standard: "WCAG 2.2",
    criterion: "2.5.5",
    level: "AAA",
    name: "Target Size",
    url: `${base}target-size.html`
  },
  "2.5.8": {
    standard: "WCAG 2.2",
    criterion: "2.5.8",
    level: "AA",
    name: "Target Size (Minimum)",
    url: `${base}target-size-minimum.html`
  },
  "3.1.1": {
    standard: "WCAG 2.2",
    criterion: "3.1.1",
    level: "A",
    name: "Language of Page",
    url: `${base}language-of-page.html`
  },
  "3.1.5": {
    standard: "WCAG 2.2",
    criterion: "3.1.5",
    level: "AAA",
    name: "Reading Level",
    url: `${base}reading-level.html`
  },
  "3.2.3": {
    standard: "WCAG 2.2",
    criterion: "3.2.3",
    level: "AA",
    name: "Consistent Navigation",
    url: `${base}consistent-navigation.html`
  },
  "3.3.1": {
    standard: "WCAG 2.2",
    criterion: "3.3.1",
    level: "A",
    name: "Error Identification",
    url: `${base}error-identification.html`
  },
  "3.3.2": {
    standard: "WCAG 2.2",
    criterion: "3.3.2",
    level: "A",
    name: "Labels or Instructions",
    url: `${base}labels-or-instructions.html`
  },
  "3.3.3": {
    standard: "WCAG 2.2",
    criterion: "3.3.3",
    level: "AA",
    name: "Error Suggestion",
    url: `${base}error-suggestion.html`
  },
  "3.3.4": {
    standard: "WCAG 2.2",
    criterion: "3.3.4",
    level: "AA",
    name: "Error Prevention (Legal, Financial, Data)",
    url: `${base}error-prevention-legal-financial-data.html`
  },
  "4.1.1": {
    standard: "WCAG 2.0",
    criterion: "4.1.1",
    level: "A",
    name: "Parsing",
    url: `${wcag20Base}parsing.html`
  },
  "4.1.2": {
    standard: "WCAG 2.2",
    criterion: "4.1.2",
    level: "A",
    name: "Name, Role, Value",
    url: `${base}name-role-value.html`
  },
  "4.1.3": {
    standard: "WCAG 2.2",
    criterion: "4.1.3",
    level: "AA",
    name: "Status Messages",
    url: `${base}status-messages.html`
  }
};

export const axeRuleWcagMap: Record<string, string[]> = {
  "area-alt": ["1.1.1"],
  "aria-allowed-attr": ["4.1.2"],
  "aria-allowed-role": ["4.1.2"],
  "aria-command-name": ["4.1.2"],
  "aria-dialog-name": ["4.1.2"],
  "aria-hidden-body": ["4.1.2"],
  "aria-hidden-focus": ["4.1.2", "2.1.1"],
  "aria-input-field-name": ["4.1.2"],
  "aria-meter-name": ["4.1.2"],
  "aria-progressbar-name": ["4.1.2"],
  "aria-required-attr": ["4.1.2"],
  "aria-required-children": ["1.3.1", "4.1.2"],
  "aria-required-parent": ["1.3.1", "4.1.2"],
  "aria-roles": ["4.1.2"],
  "aria-toggle-field-name": ["4.1.2"],
  "aria-tooltip-name": ["4.1.2"],
  "aria-valid-attr-value": ["4.1.2"],
  "aria-valid-attr": ["4.1.2"],
  "autocomplete-valid": ["1.3.5"],
  "button-name": ["4.1.2", "2.4.4"],
  "bypass": ["2.4.1"],
  "color-contrast": ["1.4.3"],
  "definition-list": ["1.3.1"],
  "document-title": ["2.4.2"],
  "duplicate-id": ["4.1.1"],
  "empty-heading": ["1.3.1", "2.4.6"],
  "form-field-multiple-labels": ["3.3.2", "1.3.1"],
  "frame-title": ["4.1.2", "2.4.1"],
  "html-has-lang": ["3.1.1"],
  "html-lang-valid": ["3.1.1"],
  "image-alt": ["1.1.1"],
  "input-button-name": ["4.1.2"],
  "input-image-alt": ["1.1.1"],
  "label": ["1.3.1", "3.3.2", "4.1.2"],
  "label-content-name-mismatch": ["2.5.3"],
  "link-name": ["2.4.4", "4.1.2"],
  "list": ["1.3.1"],
  "listitem": ["1.3.1"],
  "meta-refresh": ["2.2.1"],
  "nested-interactive": ["4.1.2", "2.1.1"],
  "object-alt": ["1.1.1"],
  "role-img-alt": ["1.1.1"],
  "scope-attr-valid": ["1.3.1"],
  "select-name": ["4.1.2", "3.3.2"],
  "server-side-image-map": ["2.1.1"],
  "svg-img-alt": ["1.1.1"],
  "tabindex": ["2.4.3"],
  "table-duplicate-name": ["1.3.1"],
  "table-fake-caption": ["1.3.1"],
  "td-headers-attr": ["1.3.1"],
  "th-has-data-cells": ["1.3.1"],
  "valid-lang": ["3.1.1"],
  "video-caption": ["1.2.2"]
};

export function getWcagReferencesForRule(ruleId: string, mode: ComplianceMode): WcagReference[] {
  const ids = axeRuleWcagMap[ruleId] ?? customRuleWcagMap[ruleId] ?? ["4.1.2"];
  return ids.map((id) => normalizeReferenceForMode(wcagReferences[id], mode)).filter(Boolean);
}

export const customRuleWcagMap: Record<string, string[]> = {
  "heading-order": ["1.3.1", "2.4.6"],
  "main-landmark": ["1.3.1", "2.4.1"],
  "navigation-landmark": ["1.3.1"],
  "skip-link": ["2.4.1"],
  "focus-visible": ["2.4.7"],
  "keyboard-trap": ["2.1.2"],
  "tab-order-risk": ["2.4.3"],
  "target-size": ["2.5.8"],
  "reflow-risk": ["1.4.10"],
  "reduced-motion": ["2.2.2"],
  "autoplay-media": ["1.4.2", "2.2.2"],
  "captions-review": ["1.2.2", "1.2.3"],
  "pdf-review": ["1.3.1", "1.1.1"],
  "captcha-review": ["1.1.1", "2.1.1"],
  "flashing-risk": ["2.3.1"],
  "error-association": ["3.3.1", "3.3.2"],
  "required-field": ["3.3.2"],
  "dialog-focus-return": ["2.4.3", "4.1.2"],
  "button-link-misuse": ["4.1.2", "2.1.1"],
  "image-text-review": ["1.4.5"],
  "plain-language-review": ["3.1.5"]
};

function normalizeReferenceForMode(reference: WcagReference | undefined, mode: ComplianceMode): WcagReference {
  if (!reference) {
    return wcagReferences["4.1.2"];
  }

  if (mode === "wcag21-aa" && reference.standard === "WCAG 2.2") {
    return {
      ...reference,
      standard: "WCAG 2.1",
      url: reference.url.replace(base, wcag21Base)
    };
  }

  if (mode === "section508") {
    return {
      ...reference,
      standard: reference.criterion === "4.1.1" ? "WCAG 2.0" : "Section 508",
      url: reference.criterion === "4.1.1" ? reference.url : "https://www.access-board.gov/ict/"
    };
  }

  return reference;
}

export function describeComplianceMode(mode: ComplianceMode) {
  if (mode === "wcag22-aa") return "WCAG 2.2 Level A and AA automated and manual review support.";
  if (mode === "wcag21-aa") return "WCAG 2.1 Level A and AA support aligned with ADA Title II web and mobile rule planning.";
  if (mode === "section508") return "Section 508 support mapped to WCAG 2.0 Level A and AA criteria where applicable.";
  return "Custom audit mode with selected WCAG, keyboard, visual, and manual-review checks.";
}
