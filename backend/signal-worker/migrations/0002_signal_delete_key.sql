-- A writer may take back their own signal for a few minutes after sending it.
-- Only the SHA-256 hash of their one-time delete key is kept.
ALTER TABLE signals ADD COLUMN delete_key_hash TEXT NULL;
