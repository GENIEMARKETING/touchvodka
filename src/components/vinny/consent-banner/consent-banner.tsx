'use client';

import { consentStore } from '@geniemarketing/foundation/consent';
import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';

/**
 * ConsentBanner — the keystone of the tracking stack (S7 / T16).
 *
 * Wraps orestbida `vanilla-cookieconsent` (MIT, framework-agnostic) and bridges
 * its decision into `@geniemarketing/foundation`'s `consentStore`, which every tracker —
 * the pixel loader, PostHog, the geo-map beacon — is gated on. NOTHING tracks
 * until the visitor opts in here.
 *
 * Privacy defaults (non-negotiable): all opt-in categories start DISABLED, the
 * banner is "box" layout with an explicit "Reject all", and the choice is mirrored
 * into our versioned, auditable consent record (for T32 GDPR export/erase).
 *
 * Variant-not-configuration: brand + policy href + which categories to offer.
 * A radically different consent UX is a NEW block — don't add a `layout` prop.
 */
export type ConsentCategoryKey = 'analytics' | 'marketing' | 'preferences';

export type ConsentBannerProps = {
  /** Brand name shown in the banner copy. */
  brand: string;
  /** Link to the privacy policy (use the privacy-policy block's route). */
  privacyHref?: string;
  /** Which opt-in categories to offer. Default: analytics + marketing. */
  categories?: ConsentCategoryKey[];
};

const CATEGORY_COPY: Record<ConsentCategoryKey, { title: string; description: string }> = {
  analytics: {
    title: 'Analytics',
    description: 'Anonymous, aggregated usage stats (self-hosted PostHog). IP is anonymized.',
  },
  marketing: {
    title: 'Marketing',
    description: 'Advertising pixels (Meta, Google, TikTok) used to measure and target campaigns.',
  },
  preferences: {
    title: 'Preferences',
    description: 'Remembers choices like language and region to personalise your experience.',
  },
};

export function ConsentBanner({
  brand,
  privacyHref = '/privacy',
  categories = ['analytics', 'marketing'],
}: ConsentBannerProps) {
  useEffect(() => {
    // Push the library's decision into the shared store so gated trackers react.
    const sync = () => {
      consentStore.set(
        {
          analytics: CookieConsent.acceptedCategory('analytics'),
          marketing: CookieConsent.acceptedCategory('marketing'),
          preferences: CookieConsent.acceptedCategory('preferences'),
        },
        'banner',
      );
    };

    CookieConsent.run({
      // We persist our own auditable record; keep the library cookie lean.
      cookie: { name: 'vinny-cc' },
      guiOptions: {
        consentModal: { layout: 'box', position: 'bottom left', equalWeightButtons: true },
        preferencesModal: { layout: 'box' },
      },
      categories: {
        // Always-on; cannot be rejected (security/session only).
        necessary: { enabled: true, readOnly: true },
        // Every opt-in category starts DISABLED — explicit opt-in only.
        ...Object.fromEntries(categories.map((c) => [c, { enabled: false }])),
      },
      onFirstConsent: sync,
      onConsent: sync,
      onChange: sync,
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: `${brand} respects your privacy`,
              description:
                'We use necessary cookies to run the site. With your consent we also use analytics and marketing cookies. You can change your choice any time.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage preferences',
              footer: `<a href="${privacyHref}">Privacy Policy</a>`,
            },
            preferencesModal: {
              title: 'Privacy preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save my choices',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Strictly necessary',
                  description: 'Required for the site to work. Always active.',
                  linkedCategory: 'necessary',
                },
                ...categories.map((c) => ({
                  title: CATEGORY_COPY[c].title,
                  description: CATEGORY_COPY[c].description,
                  linkedCategory: c,
                })),
              ],
            },
          },
        },
      },
    });
  }, [brand, privacyHref, categories]);

  // The banner UI is rendered by the library into the document; this component
  // only orchestrates. Expose a hook for a "Manage cookies" footer link:
  return null;
}

/** Re-open the preferences modal (wire to a footer "Cookie settings" link). */
export function openConsentPreferences() {
  CookieConsent.showPreferences();
}
