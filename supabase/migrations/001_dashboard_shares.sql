-- ============================================================================
-- dashboard_shares — public share-link registry for the unified dashboard
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS dashboard_shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app         TEXT NOT NULL CHECK (app IN ('adsiq','bpiq')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_dashboard_shares_slug    ON dashboard_shares(slug);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_user    ON dashboard_shares(user_id);

ALTER TABLE dashboard_shares ENABLE ROW LEVEL SECURITY;

-- Owners can read/write their own share rows via RLS.
DROP POLICY IF EXISTS "owners read own shares" ON dashboard_shares;
CREATE POLICY "owners read own shares" ON dashboard_shares
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "owners insert own shares" ON dashboard_shares;
CREATE POLICY "owners insert own shares" ON dashboard_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owners update own shares" ON dashboard_shares;
CREATE POLICY "owners update own shares" ON dashboard_shares
  FOR UPDATE USING (auth.uid() = user_id);

-- Public SELECT by slug happens via the service role in /api/share/[slug], so
-- no anon SELECT policy is granted here.

-- ============================================================================
-- RPC: create_dashboard_share(user_id, app, expires)
-- Generates a short base62 slug and inserts a new share row.
-- ============================================================================
CREATE OR REPLACE FUNCTION create_dashboard_share(
  p_user_id UUID,
  p_app     TEXT,
  p_expires TIMESTAMPTZ DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_slug TEXT;
  v_alphabet TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INT;
BEGIN
  IF p_app NOT IN ('adsiq','bpiq') THEN
    RAISE EXCEPTION 'app must be adsiq or bpiq';
  END IF;

  LOOP
    v_slug := '';
    FOR i IN 1..10 LOOP
      v_slug := v_slug || substr(v_alphabet, 1 + floor(random()*62)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM dashboard_shares WHERE slug = v_slug);
  END LOOP;

  INSERT INTO dashboard_shares (slug, user_id, app, expires_at)
  VALUES (v_slug, p_user_id, p_app, p_expires);

  RETURN v_slug;
END $$;

GRANT EXECUTE ON FUNCTION create_dashboard_share(UUID, TEXT, TIMESTAMPTZ) TO authenticated;
