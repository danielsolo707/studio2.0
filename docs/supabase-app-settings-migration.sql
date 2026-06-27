-- Run this in the Supabase SQL Editor for existing databases that were created
-- before the app_settings table was added to supabase-schema.sql.
--
-- Stores admin security settings in PostgreSQL:
-- - admin password hash/salt
-- - TOTP / 2FA secret and enabled flag
-- - Cloudflare Turnstile CAPTCHA enabled flag

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

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- No public policies are intentionally added for app_settings.
-- Server-side code uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO app_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;
