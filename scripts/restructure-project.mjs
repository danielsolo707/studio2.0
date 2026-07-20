/**
 * One-shot studio.2 structure cleanup.
 * Moves files into domain folders and rewrites import paths.
 */
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const SKIP = new Set(['node_modules', '.git', '.next', 'dist']);

/** @type {Array<[string, string]>} from → to (posix relative to root) */
const MOVES = [
  // ── Dashboard: auth ──────────────────────────────────
  ['src/components/dashboard/LoginForm.tsx', 'src/components/dashboard/auth/LoginForm.tsx'],
  ['src/components/dashboard/TwoFactorForm.tsx', 'src/components/dashboard/auth/TwoFactorForm.tsx'],
  ['src/components/dashboard/TwoFactorSetup.tsx', 'src/components/dashboard/auth/TwoFactorSetup.tsx'],
  ['src/components/dashboard/ChangePasswordForm.tsx', 'src/components/dashboard/auth/ChangePasswordForm.tsx'],
  ['src/components/dashboard/CaptchaToggle.tsx', 'src/components/dashboard/auth/CaptchaToggle.tsx'],

  // ── Dashboard: content CMS ───────────────────────────
  ['src/components/dashboard/HeroForm.tsx', 'src/components/dashboard/content/HeroForm.tsx'],
  ['src/components/dashboard/AboutForm.tsx', 'src/components/dashboard/content/AboutForm.tsx'],
  ['src/components/dashboard/ProjectOptions.tsx', 'src/components/dashboard/content/ProjectOptions.tsx'],

  // ── Dashboard: projects ──────────────────────────────
  ['src/components/dashboard/ProjectList.tsx', 'src/components/dashboard/projects/ProjectList.tsx'],
  ['src/components/dashboard/AddProjectSection.tsx', 'src/components/dashboard/projects/AddProjectSection.tsx'],
  ['src/components/dashboard/AddProjectFormWrapper.tsx', 'src/components/dashboard/projects/AddProjectFormWrapper.tsx'],
  ['src/components/dashboard/AddCodeProjectForm.tsx', 'src/components/dashboard/projects/AddCodeProjectForm.tsx'],
  ['src/components/dashboard/AddMotionProjectForm.tsx', 'src/components/dashboard/projects/AddMotionProjectForm.tsx'],
  ['src/components/dashboard/ProjectLinks.tsx', 'src/components/dashboard/projects/ProjectLinks.tsx'],
  ['src/components/dashboard/MultiUploadField.tsx', 'src/components/dashboard/projects/MultiUploadField.tsx'],
  ['src/components/dashboard/MediaPreview.tsx', 'src/components/dashboard/projects/MediaPreview.tsx'],

  // ── Dashboard: messages ──────────────────────────────
  ['src/components/dashboard/MessagesPanel.tsx', 'src/components/dashboard/messages/MessagesPanel.tsx'],

  // ── Dashboard: shared ────────────────────────────────
  ['src/components/dashboard/StatusBadge.tsx', 'src/components/dashboard/shared/StatusBadge.tsx'],
  ['src/components/dashboard/EditableSelect.tsx', 'src/components/dashboard/shared/EditableSelect.tsx'],
  ['src/components/dashboard/EditableSelectField.tsx', 'src/components/dashboard/shared/EditableSelectField.tsx'],

  // ── AI widgets → hermes ──────────────────────────────
  ['src/components/ai/AiConfigForm.tsx', 'src/components/hermes/AiConfigForm.tsx'],
  ['src/components/ai/ChatHistory.tsx', 'src/components/hermes/ChatHistory.tsx'],

  // ── Works → project/motion ───────────────────────────
  ['src/components/works/MotionHeader.tsx', 'src/components/project/motion/MotionHeader.tsx'],
  ['src/components/works/MotionProjectGallery.tsx', 'src/components/project/motion/MotionProjectGallery.tsx'],

  // ── Effects: consistent PascalCase filenames ─────────
  ['src/components/effects/film-grain.tsx', 'src/components/effects/FilmGrain.tsx'],
  ['src/components/effects/motion-background.tsx', 'src/components/effects/MotionBackground.tsx'],
  ['src/components/effects/scramble-text.tsx', 'src/components/effects/ScrambleText.tsx'],

  // ── Hooks: consistent kebab-case ─────────────────────
  ['src/hooks/useFocusTrap.ts', 'src/hooks/use-focus-trap.ts'],
  ['src/hooks/useLockScroll.ts', 'src/hooks/use-lock-scroll.ts'],
  ['src/hooks/useMediaQuery.ts', 'src/hooks/use-media-query.ts'],

  // ── Tests: single place ──────────────────────────────
  ['src/__tests__/api-integrity.test.ts', 'src/tests/api-integrity.test.ts'],
  ['src/__tests__/Components.test.tsx', 'src/tests/Components.test.tsx'],
  ['src/test-setup.ts', 'src/tests/setup.ts'],

  // ── Root / docs / schema ─────────────────────────────
  ['supabase/schema.sql', 'supabase/schema.sql'],
];

/** Import/path rewrites (longest-first applied) */
const REWRITES = [
  // Dashboard absolute imports
  ["@/components/dashboard/auth/LoginForm", "@/components/dashboard/auth/LoginForm"],
  ["@/components/dashboard/auth/TwoFactorForm", "@/components/dashboard/auth/TwoFactorForm"],
  ["@/components/dashboard/auth/TwoFactorSetup", "@/components/dashboard/auth/TwoFactorSetup"],
  ["@/components/dashboard/auth/ChangePasswordForm", "@/components/dashboard/auth/ChangePasswordForm"],
  ["@/components/dashboard/auth/CaptchaToggle", "@/components/dashboard/auth/CaptchaToggle"],
  ["@/components/dashboard/content/HeroForm", "@/components/dashboard/content/HeroForm"],
  ["@/components/dashboard/content/AboutForm", "@/components/dashboard/content/AboutForm"],
  ["@/components/dashboard/content/ProjectOptions", "@/components/dashboard/content/ProjectOptions"],
  ["@/components/dashboard/projects/ProjectList", "@/components/dashboard/projects/ProjectList"],
  ["@/components/dashboard/projects/AddProjectSection", "@/components/dashboard/projects/AddProjectSection"],
  ["@/components/dashboard/projects/AddProjectFormWrapper", "@/components/dashboard/projects/AddProjectFormWrapper"],
  ["@/components/dashboard/projects/AddCodeProjectForm", "@/components/dashboard/projects/AddCodeProjectForm"],
  ["@/components/dashboard/projects/AddMotionProjectForm", "@/components/dashboard/projects/AddMotionProjectForm"],
  ["@/components/dashboard/projects/ProjectLinks", "@/components/dashboard/projects/ProjectLinks"],
  ["@/components/dashboard/projects/MultiUploadField", "@/components/dashboard/projects/MultiUploadField"],
  ["@/components/dashboard/projects/MediaPreview", "@/components/dashboard/projects/MediaPreview"],
  ["@/components/dashboard/messages/MessagesPanel", "@/components/dashboard/messages/MessagesPanel"],
  ["@/components/dashboard/shared/StatusBadge", "@/components/dashboard/shared/StatusBadge"],
  ["@/components/dashboard/shared/EditableSelectField", "@/components/dashboard/shared/EditableSelectField"],
  ["@/components/dashboard/shared/EditableSelect", "@/components/dashboard/shared/EditableSelect"],

  // AI → hermes
  ["@/components/hermes/AiConfigForm", "@/components/hermes/AiConfigForm"],
  ["@/components/hermes/ChatHistory", "@/components/hermes/ChatHistory"],

  // Works → project/motion
  ["@/components/project/motion/MotionProjectGallery", "@/components/project/motion/MotionProjectGallery"],
  ["@/components/project/motion/MotionHeader", "@/components/project/motion/MotionHeader"],

  // Effects filenames
  ["@/components/effects/FilmGrain", "@/components/effects/FilmGrain"],
  ["@/components/effects/MotionBackground", "@/components/effects/MotionBackground"],
  ["@/components/effects/ScrambleText", "@/components/effects/ScrambleText"],

  // Hooks
  ["@/hooks/use-focus-trap", "@/hooks/use-focus-trap"],
  ["@/hooks/use-lock-scroll", "@/hooks/use-lock-scroll"],
  ["@/hooks/use-media-query", "@/hooks/use-media-query"],

  // Schema path in docs
  ["supabase/schema.sql", "supabase/schema.sql"],
  ["./supabase/schema.sql", "./supabase/schema.sql"],
  ["](./supabase/schema.sql)", "](./supabase/schema.sql)"],
  ["](../../supabase/schema.sql)", "](../../supabase/schema.sql)"],

  // Test setup path
  ["./src/tests/setup.ts", "./src/tests/setup.ts"],
];

/** Relative import fixes inside moved dashboard files (file → map of old→new) */
const RELATIVE_FIXES = {
  'src/components/dashboard/projects/AddProjectSection.tsx': {
    "./AddProjectFormWrapper": "./AddProjectFormWrapper",
  },
  'src/components/dashboard/projects/AddProjectFormWrapper.tsx': {
    "./AddMotionProjectForm": "./AddMotionProjectForm",
    "./AddCodeProjectForm": "./AddCodeProjectForm",
  },
  'src/components/dashboard/projects/AddCodeProjectForm.tsx': {
    "./EditableSelectField": "../shared/EditableSelectField",
  },
  'src/components/dashboard/projects/AddMotionProjectForm.tsx': {
    "./EditableSelectField": "../shared/EditableSelectField",
  },
  'src/components/dashboard/projects/ProjectList.tsx': {
    "./MediaPreview": "./MediaPreview",
    "./ProjectLinks": "./ProjectLinks",
    "./MultiUploadField": "./MultiUploadField",
  },
  'src/components/dashboard/content/ProjectOptions.tsx': {
    "./EditableSelect": "../shared/EditableSelect",
  },
  'src/components/dashboard/auth/TwoFactorSetup.tsx': {
    "./TwoFactorForm": "./TwoFactorForm",
  },
  'src/components/effects/index.ts': {
    "./film-grain": "./FilmGrain",
    "./scramble-text": "./ScrambleText",
    "./motion-background": "./MotionBackground",
  },
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function moveFile(fromRel, toRel) {
  const from = path.join(root, fromRel);
  const to = path.join(root, toRel);
  if (!fs.existsSync(from)) {
    if (fs.existsSync(to)) {
      console.log('skip (already at dest):', toRel);
      return;
    }
    console.warn('missing:', fromRel);
    return;
  }
  ensureDir(to);
  fs.renameSync(from, to);
  console.log('move', fromRel, '→', toRel);
}

function walk(dir, acc = []) {
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of ents) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function rewriteFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.ts', '.tsx', '.js', '.mjs', '.md', '.json', '.sql'].includes(ext)) return false;
  let text = fs.readFileSync(filePath, 'utf8');
  const original = text;

  // Sort rewrites longest first to avoid partial collisions
  const sorted = [...REWRITES].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of sorted) {
    if (text.includes(from)) text = text.split(from).join(to);
  }

  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  const relMap = RELATIVE_FIXES[rel];
  if (relMap) {
    for (const [from, to] of Object.entries(relMap)) {
      // only rewrite import paths containing the relative specifier
      text = text.replaceAll(`from '${from}'`, `from '${to}'`);
      text = text.replaceAll(`from "${from}"`, `from "${to}"`);
    }
  }

  if (text !== original) {
    fs.writeFileSync(filePath, text);
    return true;
  }
  return false;
}

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) removeEmptyDirs(p);
  }
  try {
    const left = fs.readdirSync(dir);
    if (left.length === 0) {
      fs.rmdirSync(dir);
      console.log('rmdir', path.relative(root, dir));
    }
  } catch {
    /* ignore */
  }
}

// ── Run ────────────────────────────────────────────────
console.log('=== Moving files ===');
for (const [from, to] of MOVES) moveFile(from, to);

console.log('\n=== Rewriting imports ===');
let changed = 0;
for (const f of walk(root)) {
  if (rewriteFile(f)) {
    changed++;
    console.log('rewrite', path.relative(root, f));
  }
}
console.log('files rewritten:', changed);

console.log('\n=== Cleaning empty dirs ===');
removeEmptyDirs(path.join(root, 'src/components/ai'));
removeEmptyDirs(path.join(root, 'src/components/works'));
removeEmptyDirs(path.join(root, 'src/__tests__'));
removeEmptyDirs(path.join(root, 'src/components/dashboard'));

console.log('\nDone.');
