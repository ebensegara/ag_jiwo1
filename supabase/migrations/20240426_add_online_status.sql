ALTER TABLE professionals ADD COLUMN IF NOT EXISTS online_status BOOLEAN DEFAULT false;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_professionals_online_status ON professionals(online_status);

DROP TRIGGER IF EXISTS update_professionals_last_seen ON professionals;
CREATE TRIGGER update_professionals_last_seen
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  WHEN (NEW.online_status = true)
  EXECUTE FUNCTION update_updated_at_column();

alter publication supabase_realtime add table professionals;
