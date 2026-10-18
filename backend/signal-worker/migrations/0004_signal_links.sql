-- Links in a signal and whether each passed the safety check, as JSON:
-- [{"url": "https://…", "safe": true}]. NULL when the signal has no links.
ALTER TABLE signals ADD COLUMN links TEXT NULL;
