CREATE TABLE IF NOT EXISTS migrations_history (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    checksum VARCHAR(64) NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('success', 'failed')),
    error_detail TEXT
);
