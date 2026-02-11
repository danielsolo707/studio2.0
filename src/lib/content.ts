import fs from 'fs/promises';
import path from 'path';
import type { Project } from '@/types/project';
import { getDb } from './db';

export type AboutContent = {
  label: string;
  headline: string;
  body: string;
  skills: string[];
};

export type SiteContent = {
  about: AboutContent;
  projects: Project[];
};

// Legacy JSON file path – used **only** for initial seeding into MongoDB.
const CONTENT_PATH = path.join(process.cwd(), 'src', 'data', 'content.json');

const COLLECTION_NAME = 'siteContent';
const SINGLETON_ID = 'site';

type SiteContentDocument = SiteContent & { _id: string };

/**
 * Read site content from MongoDB.
 * On first run (no document yet), seed from the existing JSON file if present.
 */
export async function readContent(): Promise<SiteContent> {
  const db = await getDb();
  const collection = db.collection<SiteContentDocument>(COLLECTION_NAME);

  const existing = await collection.findOne({ _id: SINGLETON_ID });
  if (existing) {
    const { _id, ...content } = existing;
    return content;
  }

  // Fallback: seed from JSON file if it exists, otherwise return a minimal default.
  try {
    const raw = await fs.readFile(CONTENT_PATH, 'utf-8');
    const fileContent = JSON.parse(raw) as SiteContent;
    await collection.insertOne({ _id: SINGLETON_ID, ...fileContent });
    return fileContent;
  } catch {
    const empty: SiteContent = {
      about: {
        label: 'ABOUT',
        headline: 'PORTFOLIO',
        body: '',
        skills: [],
      },
      projects: [],
    };
    await collection.insertOne({ _id: SINGLETON_ID, ...empty });
    return empty;
  }
}

/**
 * Persist site content into MongoDB.
 */
export async function writeContent(content: SiteContent): Promise<void> {
  const db = await getDb();
  const collection = db.collection<SiteContentDocument>(COLLECTION_NAME);

  await collection.updateOne(
    { _id: SINGLETON_ID },
    { $set: content },
    { upsert: true },
  );
}

