CREATE TABLE IF NOT EXISTS portfolio_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner text NOT NULL,
  app text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours'
);
CREATE INDEX IF NOT EXISTS portfolio_runs_owner ON portfolio_runs(owner,app,created_at);
CREATE TABLE IF NOT EXISTS crowd_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner text NOT NULL,
  channel_id text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct integer NOT NULL CHECK (correct BETWEEN 0 AND 3),
  closes_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crowd_channel ON crowd_rounds(channel_id,closes_at);
CREATE TABLE IF NOT EXISTS crowd_votes (
  round_id uuid NOT NULL REFERENCES crowd_rounds(id),
  viewer_hash text NOT NULL,
  choice integer NOT NULL CHECK (choice BETWEEN 0 AND 3),
  event_id text NOT NULL UNIQUE,
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(round_id,viewer_hash)
);
CREATE TABLE IF NOT EXISTS twitch_receipts (
  id text PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL
);
CREATE TABLE IF NOT EXISTS reloop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner text NOT NULL,
  title text NOT NULL,
  material text NOT NULL,
  grams integer NOT NULL CHECK(grams>0),
  units integer NOT NULL CHECK(units>0),
  remaining integer NOT NULL CHECK(remaining>=0),
  district text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reloop_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES reloop_items(id),
  owner text NOT NULL,
  units integer NOT NULL CHECK(units>0),
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
