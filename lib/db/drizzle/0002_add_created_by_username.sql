ALTER TABLE irock_evaluations ADD COLUMN IF NOT EXISTS created_by_username TEXT;
ALTER TABLE honos_evaluations ADD COLUMN IF NOT EXISTS created_by_username TEXT;
ALTER TABLE history_entries ADD COLUMN IF NOT EXISTS created_by_username TEXT;
