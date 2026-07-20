/**
 * One-shot: dump content.json project(s) as a Supabase upsert payload (stdout).
 * Does not call Supabase itself — used with MCP/SQL.
 */
import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/data/content.json');
const j = JSON.parse(fs.readFileSync(file, 'utf8'));
const rows = (j.projects || []).map((p) => ({
  id: p.id,
  name: p.name,
  year: p.year,
  color: p.color || '#DFFF00',
  image_url: p.imageUrl || '',
  video_url: p.videoUrl || null,
  description: p.description || '',
  subtitle: p.subtitle ?? null,
  details: p.details ?? null,
  tools: p.tools || '',
  category: p.category || '',
  discipline: p.discipline ?? null,
  status: p.status ?? null,
  role: p.role ?? null,
  objective: p.objective ?? null,
  approach: p.approach ?? null,
  outcome: p.outcome ?? null,
  next_step: p.nextStep ?? null,
  challenge: p.challenge ?? null,
  solution: p.solution ?? null,
  links: p.links || [],
  media: p.media || [],
}));

console.log(JSON.stringify({ hero: j.hero, about: j.about, options: j.options, projects: rows }, null, 2));
