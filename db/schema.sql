CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(160) UNIQUE,
  category VARCHAR(80),
  level VARCHAR(80),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_consent BOOLEAN NOT NULL DEFAULT FALSE,
  consent_text_version VARCHAR(20),
  consented_at TIMESTAMPTZ,
  portal_link_version INTEGER NOT NULL DEFAULT 1,
  portal_accessed_at TIMESTAMPTZ,
  portal_access_revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE players ADD COLUMN IF NOT EXISTS portal_link_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE players ADD COLUMN IF NOT EXISTS portal_accessed_at TIMESTAMPTZ;
ALTER TABLE players ADD COLUMN IF NOT EXISTS portal_access_revoked_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_players_active_consent ON players(active, whatsapp_consent);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(140) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('SINGLE_MATCH','LEAGUE_ROUND')),
  response_mode VARCHAR(30) NOT NULL CHECK (response_mode IN ('DIRECT','AVAILABILITY','SELECTION')),
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','CLOSED','CANCELLED','COMPLETED')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  deadline_at TIMESTAMPTZ NOT NULL,
  venue VARCHAR(160) NOT NULL,
  address VARCHAR(200),
  capacity INTEGER NOT NULL CHECK (capacity BETWEEN 1 AND 100),
  category VARCHAR(80),
  price_note VARCHAR(100),
  description TEXT,
  created_by VARCHAR(160) NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at),
  CHECK (deadline_at <= starts_at)
);
CREATE INDEX IF NOT EXISTS idx_events_starts_status ON events(starts_at, status);

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','OPENED','RESPONDED','FAILED')),
  response VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (response IN ('PENDING','CONFIRMED','AVAILABLE','DECLINED','WAITLISTED','SELECTED','NOT_SELECTED','CANCELLED')),
  response_note VARCHAR(500),
  waitlist_position INTEGER,
  link_version INTEGER NOT NULL DEFAULT 1,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_invitations_event_response ON invitations(event_id, response);
CREATE INDEX IF NOT EXISTS idx_invitations_player_created ON invitations(player_id, created_at);

CREATE TABLE IF NOT EXISTS outbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  provider VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
  provider_message_id VARCHAR(200) UNIQUE,
  template_name VARCHAR(100),
  destination VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED','MOCKED','SENT','DELIVERED','READ','FAILED')),
  payload JSONB,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_invitation_created ON outbound_messages(invitation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status_created ON outbound_messages(status, created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor VARCHAR(200) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
