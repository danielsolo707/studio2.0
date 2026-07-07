/**
 * Type declarations for side-effect imports that TypeScript
 * can't resolve natively.
 */

/* ── CSS / Style ─────────────────────────────────────────── */
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}
