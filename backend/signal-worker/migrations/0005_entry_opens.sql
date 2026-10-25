-- Which story cards readers opened, per day (Asia/Taipei). An open is the
-- card's 「繼續閱讀」 (or its own reading experience, or hover-to-immerse),
-- counted once per tab and entry. No session ids or IP addresses are kept.
CREATE TABLE IF NOT EXISTS entry_opens (
    day TEXT NOT NULL,
    slug TEXT NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (day, slug)
);
