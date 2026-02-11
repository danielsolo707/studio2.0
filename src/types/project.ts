/**
 * Project data structure for portfolio projects
 *
 * @interface Project
 * @property {string} id - Unique slug identifier (used in URLs)
 * @property {string} name - Display name of the project
 * @property {string} year - Year the project was completed
 * @property {string} color - Accent color (hex format, e.g., '#DFFF00')
 * @property {string} imageUrl - URL to project thumbnail/hero image
 * @property {string} videoUrl - Optional URL to a project video
 * @property {string} description - Detailed description of the project
 * @property {string} tools - Tools used (e.g. "C4D / AE / OCTANE")
 * @property {string} category - Project category (e.g. "MOTION DESIGN")
 * @property {Array} media - Optional list of uploaded media
 */
export interface Project {
  id: string;
  name: string;
  year: string;
  color: string;
  imageUrl: string;
  videoUrl?: string;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    storage?: 'gridfs';
    fileId?: string;
    thumbUrl?: string;
    thumbFileId?: string;
  }>;
  description: string;
  tools: string;
  category: string;
}
