-- Verificar las políticas RLS existentes para las tablas tribes y rooms
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename IN ('tribes', 'rooms');

-- Desactivar RLS para las tablas tribes y rooms (si está activado)
ALTER TABLE tribes DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;

-- Verificar si RLS está habilitado para las tablas
SELECT
    tablename,
    rowsecurity
FROM
    pg_tables
WHERE
    tablename IN ('tribes', 'rooms');

-- Verificar los datos existentes en las tablas
SELECT 'Tribus existentes:' AS info;
SELECT * FROM tribes ORDER BY id;

SELECT 'Habitaciones existentes:' AS info;
SELECT * FROM rooms ORDER BY id;

-- Si no hay datos, insertar algunos registros de prueba
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tribes LIMIT 1) THEN
        INSERT INTO tribes (name) VALUES 
            ('Tribu 1'),
            ('Tribu 2'),
            ('Tribu 3');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM rooms LIMIT 1) THEN
        -- Asumiendo que las tribus existen
        INSERT INTO rooms (room_number, tribe_id) VALUES 
            ('101', 1),
            ('102', 1),
            ('201', 2),
            ('202', 2),
            ('301', 3);
    END IF;
END $$;

-- Verificar los datos después de la inserción
SELECT 'Tribus después de inserción:' AS info;
SELECT * FROM tribes ORDER BY id;

SELECT 'Habitaciones después de inserción:' AS info;
SELECT * FROM rooms ORDER BY id;

-- Otorgar permisos completos al rol anon (usuario anónimo)
GRANT ALL ON tribes TO anon;
GRANT ALL ON rooms TO anon;
GRANT ALL ON tribes TO authenticated;
GRANT ALL ON rooms TO authenticated;
GRANT ALL ON tribes TO service_role;
GRANT ALL ON rooms TO service_role;

-- Otorgar permisos a las secuencias
GRANT USAGE, SELECT ON SEQUENCE tribes_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE rooms_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE tribes_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE rooms_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE tribes_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE rooms_id_seq TO service_role;
