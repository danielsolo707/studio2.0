import fs from 'fs';
import path from 'path';

const root = process.cwd();
const SKIP = new Set(['node_modules', '.git', '.next', 'dist']);

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

function emptyDirs(dir, acc = []) {
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  const kids = ents.filter((e) => !SKIP.has(e.name));
  if (kids.length === 0) acc.push(dir);
  for (const e of kids) {
    if (e.isDirectory()) emptyDirs(path.join(dir, e.name), acc);
  }
  return acc;
}

const all = walk(root);
const srcFiles = all.filter(
  (f) => f.includes(`${path.sep}src${path.sep}`) && /\.(ts|tsx)$/.test(f),
);
const corpus = srcFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// Empty dirs
console.log('=== EMPTY DIRS ===');
for (const d of emptyDirs(root)) {
  console.log(path.relative(root, d));
}

// UI components usage
console.log('\n=== UI COMPONENTS ===');
const uiDir = path.join(root, 'src/components/ui');
const ui = fs.readdirSync(uiDir).filter((f) => f.endsWith('.tsx'));
const unusedUi = [];
for (const f of ui) {
  const name = f.replace(/\.tsx$/, '');
  const needle = `@/components/ui/${name}`;
  const needle2 = `components/ui/${name}`;
  // self-file only counts as unused if no other file imports it
  const importers = srcFiles.filter((sf) => {
    if (sf.endsWith(`${path.sep}ui${path.sep}${f}`)) return false;
    const text = fs.readFileSync(sf, 'utf8');
    return text.includes(needle) || text.includes(needle2);
  });
  if (importers.length === 0) unusedUi.push(f);
}
console.log('total ui:', ui.length, 'unused by app (may be used by other ui):', unusedUi.length);
unusedUi.forEach((u) => console.log(' ', u));

// Check top-level components for imports
console.log('\n=== FEATURE COMPONENTS (no import found) ===');
function listTsx(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listTsx(p));
    else if (/\.(tsx|ts)$/.test(e.name) && e.name !== 'index.ts') out.push(p);
  }
  return out;
}

const featureRoots = [
  'src/components/ai',
  'src/components/arcade',
  'src/components/content',
  'src/components/dashboard',
  'src/components/effects',
  'src/components/forms',
  'src/components/hermes',
  'src/components/layout',
  'src/components/project',
  'src/components/project-detail',
  'src/components/sections',
  'src/components/three',
  'src/components/works',
  'src/components',
];

const candidates = new Set();
for (const r of featureRoots) {
  for (const f of listTsx(path.join(root, r))) {
    // only direct files under components/ root for motion-background etc
    if (r === 'src/components') {
      if (path.dirname(f) === path.join(root, 'src/components')) candidates.add(f);
    } else candidates.add(f);
  }
}

const unusedFeature = [];
for (const f of candidates) {
  const rel = path.relative(path.join(root, 'src'), f).replace(/\\/g, '/');
  const noExt = rel.replace(/\.(tsx|ts)$/, '');
  const basenames = [
    `@/${noExt}`,
    `@/${noExt.replace(/^components\//, 'components/')}`,
    path.basename(f, path.extname(f)),
  ];
  // check imports referencing this module path
  let used = false;
  for (const sf of srcFiles) {
    if (path.resolve(sf) === path.resolve(f)) continue;
    const text = fs.readFileSync(sf, 'utf8');
    if (
      text.includes(`@/${noExt}`) ||
      text.includes(`@/${noExt}/`) ||
      text.includes(`from './${path.basename(noExt)}'`) ||
      text.includes(`from "./${path.basename(noExt)}"`) ||
      text.includes(`from '../${path.basename(path.dirname(f))}/${path.basename(noExt)}'`)
    ) {
      used = true;
      break;
    }
  }
  // also check index re-exports
  if (!used) {
    for (const sf of srcFiles) {
      if (!sf.endsWith(`${path.sep}index.ts`) && !sf.endsWith(`${path.sep}index.tsx`)) continue;
      if (path.resolve(sf) === path.resolve(f)) continue;
      const text = fs.readFileSync(sf, 'utf8');
      const base = path.basename(noExt);
      if (text.includes(`./${base}`) || text.includes(`./${path.basename(path.dirname(f))}/${base}`)) {
        // check if index itself is imported
        const indexDir = path.dirname(sf);
        const indexRel = path.relative(path.join(root, 'src'), indexDir).replace(/\\/g, '/');
        const indexUsed = srcFiles.some((other) => {
          if (path.resolve(other) === path.resolve(sf)) return false;
          const t = fs.readFileSync(other, 'utf8');
          return t.includes(`@/${indexRel}`) || t.includes(`@/${indexRel}/`);
        });
        if (indexUsed) {
          used = true;
          break;
        }
      }
    }
  }
  if (!used) unusedFeature.push(rel);
}
unusedFeature.sort().forEach((u) => console.log(' ', u));

// lib modules
console.log('\n=== LIB MODULES ===');
const libFiles = listTsx(path.join(root, 'src/lib'));
for (const f of libFiles) {
  if (f.includes('__tests__')) continue;
  const rel = path.relative(path.join(root, 'src'), f).replace(/\\/g, '/');
  const noExt = rel.replace(/\.(tsx|ts)$/, '');
  let used = false;
  for (const sf of srcFiles) {
    if (path.resolve(sf) === path.resolve(f)) continue;
    const text = fs.readFileSync(sf, 'utf8');
    if (text.includes(`@/${noExt}`) || text.includes(`from './${path.basename(noExt)}'`) || text.includes(`from \"./${path.basename(noExt)}\"`)) {
      used = true;
      break;
    }
  }
  if (!used) console.log(' unused?', rel);
}

// root clutter
console.log('\n=== ROOT / DOCS FILES ===');
for (const f of fs.readdirSync(root)) {
  if (SKIP.has(f) || f === 'package-lock.json') continue;
  const st = fs.statSync(path.join(root, f));
  if (st.isFile()) console.log(' ', f, Math.round(st.size / 1024) + 'kb');
}

// public uploads
console.log('\n=== PUBLIC UPLOADS ===');
const up = path.join(root, 'public/uploads');
if (fs.existsSync(up)) {
  for (const f of fs.readdirSync(up)) {
    const st = fs.statSync(path.join(up, f));
    console.log(' ', f, Math.round(st.size / 1024) + 'kb');
  }
}

// bson usage
console.log('\n=== PACKAGE HEURISTICS ===');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.optionalDependencies };
const allSrc = corpus;
const checkPkgs = ['bson', 'recharts', 'react-day-picker', 'react-resizable-panels', 'vaul', 'embla-carousel-react', 'cmdk', 'input-otp', 'qrcode', 'speakeasy', '@uppy/core', 'three', '@react-three/fiber'];
for (const p of checkPkgs) {
  const short = p.startsWith('@') ? p : p;
  const used = allSrc.includes(`from '${p}`) || allSrc.includes(`from \"${p}`) || allSrc.includes(`require('${p}`) || allSrc.includes(`from '${p}/`);
  // also bare import variations
  const used2 = allSrc.includes(p);
  console.log(used || used2 ? 'USED ' : '???? ', p);
}
