-- Supabase Schema for Portfolio
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  year TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#DFFF00',
  image_url TEXT,
  video_url TEXT,
  description TEXT NOT NULL,
  subtitle TEXT,
  details TEXT,
  tools TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  discipline TEXT CHECK (discipline IN ('motion', 'code', 'data', 'hybrid')),
  status TEXT,
  role TEXT,
  objective TEXT,
  approach TEXT,
  outcome TEXT,
  next_step TEXT,
  challenge TEXT,
  solution TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  media JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site content table (singleton - one row)
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero JSONB,
  about JSONB NOT NULL,
  options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  replies JSONB DEFAULT '[]'::jsonb
);

-- Project files table (for uploaded files/media)
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT, -- references projects.id (TEXT) — FK handled at app level
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'document', etc.
  file_size BIGINT,
  mime_type TEXT,
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table (for dashboard auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  totp_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- App-wide security settings (singleton — one row, id = 'default').
-- Holds the admin password hash, TOTP (2FA) secret, and captcha toggle.
-- RLS is enabled with NO public policies, so only the service_role key
-- (server-side) can read or write this table.
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  password_hash TEXT,
  password_salt TEXT,
  password_updated_at TIMESTAMPTZ,
  totp_secret TEXT,
  totp_enabled BOOLEAN DEFAULT FALSE,
  captcha_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- app_settings: NO public policies — service_role (server) only.
-- The anon key cannot read or write security config.

-- Projects: public read, admin write
CREATE POLICY "Public read access to projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Site content: public read, admin write
CREATE POLICY "Public read access to site content" ON site_content
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to site content" ON site_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Contact messages: public insert (anyone can send), admin read/write
CREATE POLICY "Public can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access to contact messages" ON contact_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Project files: public read, admin write
CREATE POLICY "Public read access to project files" ON project_files
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to project files" ON project_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Admin users: only self or admin
CREATE POLICY "Admin can manage users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_discipline ON projects(discipline);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_received_at ON contact_messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Insert default site content if not exists
INSERT INTO site_content (id, hero, about, options)
VALUES (
  'default',
  '{"headline": "CREATIVE\nDEVELOPER", "description": "Creative developer specializing in motion design (After Effects, Cinema 4D) and machine learning. Building interactive web experiences that blend visual storytelling with intelligent systems."}',
  '{"label": "ABOUT", "headline": "CREATIVE DEVELOPER", "body": "Building small visual systems across motion, creative code, and early ML/data experiments.", "skills": ["AFTER EFFECTS", "BLENDER", "REACT", "NEXT.JS", "PYTHON", "DATA VISUALIZATION"]}',
  '{"statuses": ["Case Study", "Prototype", "Experiment", "Learning Project"], "categories": ["Web App", "Data Visualization", "Tool", "Animation", "Interactive", "Experiment"], "tools": ["React", "Next.js", "TypeScript", "Python", "TensorFlow", "Three.js", "Blender", "After Effects", "Cinema 4D"], "disciplines": ["Motion", "Creative Code", "Data/ML", "Hybrid"], "linkTypes": ["GitHub", "Demo", "Notebook", "Video"]}'
)
ON CONFLICT DO NOTHING;

-- Insert default admin user (run this after setting up Supabase Auth)
-- INSERT INTO admin_users (email, password_hash) VALUES ('your-email@example.com', 'your-hashed-password');

-- Make storage buckets public (run in Supabase SQL Editor)
-- UPDATE storage.buckets SET public = true WHERE name IN ('project-media', 'uploads');
-- Or create policies:
-- CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('project-media', 'uploads'));