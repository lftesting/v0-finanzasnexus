-- Insertar tribus de prueba si no existen
INSERT INTO tribes (name)
SELECT 'Tribu A'
WHERE NOT EXISTS (SELECT 1 FROM tribes WHERE name = 'Tribu A');

INSERT INTO tribes (name)
SELECT 'Tribu B'
WHERE NOT EXISTS (SELECT 1 FROM tribes WHERE name = 'Tribu B');

INSERT INTO tribes (name)
SELECT 'Tribu C'
WHERE NOT EXISTS (SELECT 1 FROM tribes WHERE name = 'Tribu C');

-- Verificar las tribus existentes
SELECT * FROM tribes ORDER BY name;
