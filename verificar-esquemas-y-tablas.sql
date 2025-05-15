-- Listar todos los esquemas
SELECT schema_name 
FROM information_schema.schemata;

-- Listar todas las tablas en el esquema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar si la tabla tribes existe en algún esquema
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'tribes';

-- Verificar si hay alguna tabla con un nombre similar a 'tribes'
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%tribe%';
