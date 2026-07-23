CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('API', 'Framework', 'Library')),
    categoria VARCHAR(100),
    lenguaje_principal VARCHAR(100),
    descripcion TEXT CHECK (char_length(descripcion) <= 5000),
    url_repositorio VARCHAR(2048),
    url_documentacion VARCHAR(2048),
    estrellas_github INTEGER DEFAULT 0 CHECK (estrellas_github >= 0),
    descargas_semanales INTEGER DEFAULT 0 CHECK (descargas_semanales >= 0),
    comando_instalacion VARCHAR(512),
    ejemplo_helloworld TEXT CHECK (char_length(ejemplo_helloworld) <= 10000),
    fuente_origen VARCHAR(255) NOT NULL,
    identificador_externo VARCHAR(255) NOT NULL,
    que_es VARCHAR(280),
    caso_uso_principal VARCHAR(280),
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_fuente_identificador UNIQUE (fuente_origen, identificador_externo)
);

CREATE INDEX idx_technologies_nombre_trgm ON technologies USING gin (lower(nombre) gin_trgm_ops);
CREATE INDEX idx_technologies_tipo ON technologies (tipo);
CREATE INDEX idx_technologies_categoria ON technologies (lower(categoria));
CREATE INDEX idx_technologies_lenguaje ON technologies (lower(lenguaje_principal));
CREATE INDEX idx_technologies_estrellas ON technologies (estrellas_github DESC);
CREATE INDEX idx_technologies_descargas ON technologies (descargas_semanales DESC);
CREATE INDEX idx_technologies_fecha_creacion ON technologies (fecha_creacion DESC);
