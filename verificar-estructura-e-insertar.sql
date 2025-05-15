-- Verificar la estructura de la tabla tribes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tribes';

-- Insertar algunos registros de prueba
INSERT INTO tribes (name) VALUES 
('Tribu 1'),
('Tribu 2'),
('Tribu 3')
RETURNING *;
