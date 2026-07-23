CREATE TABLE external_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(512) NOT NULL UNIQUE,
    fuente VARCHAR(100) NOT NULL,
    response_body JSONB NOT NULL CHECK (pg_column_size(response_body) <= 5242880),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cache_key ON external_cache (cache_key);
CREATE INDEX idx_cache_expires ON external_cache (expires_at);
CREATE INDEX idx_cache_fuente ON external_cache (fuente);
