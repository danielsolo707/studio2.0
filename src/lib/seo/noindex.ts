import type { Metadata } from 'next';

/**
 * Reusable `noindex` metadata — spread or export this from any
 * layout / page that should **not** appear in Google search results.
 *
 * @example
 * ```ts
 * // app/some/internal/page.tsx
 * import { NOINDEX } from '@/lib/seo/noindex';
 * export const metadata: Metadata = { ...NOINDEX, title: '…' };
 * ```
 */
export const NOINDEX: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

/**
 * Helper to build metadata for pages that should be hidden from
 * search engines while still having a meaningful `<title>`.
 *
 * @example
 * ```ts
 * // app/test/playground/page.tsx
 * import { noindexPage } from '@/lib/seo/noindex';
 * export const metadata = noindexPage('Playground | Daniel Soleimani');
 * ```
 */
export function noindexPage(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}
