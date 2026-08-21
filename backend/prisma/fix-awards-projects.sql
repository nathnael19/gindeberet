-- Fix awards + projects WITHOUT running Prisma on cPanel.
-- phpMyAdmin → select DB gindebsx_gindeberet_db → Import this file.
SET NAMES utf8mb4;

UPDATE site_settings SET
  phone = CONCAT('+251 911 908 456', CHAR(10), '+251 917 000 912'),
  email = 'gindeberetconstruction278@gmail.com',
  workingHours = 'Mon-Fri, 8:00am-6:00pm',
  officeLocation = CONCAT('Near Global Hotel Lancha', CHAR(10), 'Addis Ababa, Ethiopia'),
  updatedAt = NOW(3)
WHERE id = 1;

DELETE FROM awards;
INSERT INTO awards (title, description, icon, imageUrl, createdAt, updatedAt) VALUES
('Horro Guduru Health Office', 'Certificate of Appreciation - completing the Horro Guduru Wollega Zone Health Office building on time.', '01', '/images/awards/horro-guduru-health-office.png', NOW(3), NOW(3)),
('Jimma - Buara Boru School', 'Jimma City Municipality / Helping Hands - support of 204,347.83 birr for Buara Boru Primary School.', '02', '/images/awards/jimma-buara-boru-school.png', NOW(3), NOW(3)),
('Oromia Construction Authority', 'Certificate of Appreciation for strong performance in regional construction (2012 E.C.).', '03', '/images/awards/oromia-construction-authority.png', NOW(3), NOW(3)),
('Industry Achievement Trophy', 'Industry recognition trophy for construction excellence.', '04', '/images/awards/achievement-trophy.png', NOW(3), NOW(3)),
('Chora - Dabbasoo Health Center', 'Certificate of Appreciation for Dabbasoo Sooroo health facility works in Chora District.', '05', '/images/awards/chora-dabbasoo-health-center.png', NOW(3), NOW(3)),
('Ministry of Revenues 2024/25', 'Certificate of Recognition for tax compliance and results in the 2024/2025 fiscal year.', '06', '/images/awards/mor-tax-2024-2025.png', NOW(3), NOW(3)),
('Boorracha Health Center', 'Certificate of Appreciation for health facility construction in Boorracha District (Bunno Bedele).', '07', '/images/awards/boorracha-health-center.png', NOW(3), NOW(3)),
('Ministry of Revenues 2023/24', 'Certificate of Recognition for tax compliance and results in the 2023/2024 fiscal year.', '08', '/images/awards/mor-tax-2023-2024.png', NOW(3), NOW(3));

DELETE FROM projects WHERE id IN ('PRJ001','PRJ002','PRJ003','PRJ004','PRJ005');

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB016', 'Construction of Culverts in Different Kebeles', 'Jimmaa Hirmata Woreda', 'COMPLETED', 'ETB 11,882,298.13',
  'Jimma Hirmata, Oromia', 'Roads', '365 Days', '2017',
  'Construction of culverts across multiple kebeles to improve drainage and all-weather access for local communities.', NULL, NULL, '["Sheet No. 1","Contract: ETB 11,882,298.13","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB017', 'Chomen Guduru G+2 Administration Building', 'Sub-contract', 'COMPLETED', 'ETB 12,767,607.77',
  'Chomen Guduru, Oromia', 'Buildings', '360 Days', '2018',
  'Construction of a G+2 administration building delivered as a sub-contract package.', NULL, NULL, '["Sheet No. 3","Contract: ETB 12,767,607.77","Duration: 360 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB018', 'Warehouse, Drainage and Stadium Fence', 'Jimma City Youth and Sport Affairs Office (sub-contract)', 'COMPLETED', 'ETB 15,159,181.97',
  'Jimma, Oromia', 'Buildings', '720 Days', '2018',
  'Warehouse construction with drainage works and stadium fencing for youth and sport facilities.', NULL, NULL, '["Sheet No. 4","Contract: ETB 15,159,181.97","Duration: 720 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB019', 'Administration, Library, Health Post and Veterinary Buildings', 'Oromia Regional State Construction Works Corporation', 'COMPLETED', 'ETB 15,159,181.97',
  'Oromia', 'Buildings', '360 Days', '2018',
  'Package covering administration and library buildings together with health post and veterinary facilities.', NULL, NULL, '["Sheet No. 5","Contract: ETB 15,159,181.97","Duration: 360 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB020', 'Compaction Roads Construction', 'Jimmaa Raaree Woreda Road Authority', 'COMPLETED', 'ETB 15,275,275.00',
  'Jimma Raaree, Oromia', 'Roads', '365 Days', '2018',
  'Construction and compaction of roads for the woreda road authority.', NULL, NULL, '["Sheet No. 6","Contract: ETB 15,275,275.00","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB021', 'Water Supply for Slaughter House and Surrounding Residentials', 'Jimma City Administration', 'COMPLETED', 'ETB 20,707,100.00',
  'Jimma, Oromia', 'Water', '360 Days', '2018',
  'Water supply works serving a slaughter house and surrounding residential areas in Jimma city.', NULL, NULL, '["Sheet No. 7","Contract: ETB 20,707,100.00","Duration: 360 Days"]', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB022', 'High School Furniture Project', 'Jimma Education Office', 'COMPLETED', 'ETB 4,480,236.25',
  'Jimma, Oromia', 'Electro-Mechanical', '180 Days', '2020',
  'Supply and installation of high school furniture for Jimma education office.', NULL, NULL, '["Sheet No. 9","Contract: ETB 4,480,236.25","Duration: 180 Days"]', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB023', 'Sidesa Unta 20m Span Girder River Bridge', 'Sub-contract from Bekele Debele', 'COMPLETED', 'ETB 11,905,200.20',
  'Sidesa Unta, Oromia', 'Bridges', '365 Days', '2020',
  'Construction of a 20m span girder river bridge delivered as a sub-contract package.', NULL, NULL, '["Sheet No. 10","Contract: ETB 11,905,200.20","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB024', 'High School Furniture Project (Package 2)', 'Jimma Education Office', 'COMPLETED', 'ETB 3,310,080.19',
  'Jimma, Oromia', 'Electro-Mechanical', '180 Days', '2020',
  'Second high school furniture package for Jimma education office.', NULL, NULL, '["Sheet No. 11","Contract: ETB 3,310,080.19","Duration: 180 Days"]', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB025', 'Jimma Raaree Justice Office', 'Jimma Raaree Woreda Justice Office', 'ACTIVE', 'ETB 12,743,526.77',
  'Jimma Raaree, Oromia', 'Buildings', '365 Days', '2020',
  'Construction of the Jimma Raaree woreda justice office building.', NULL, NULL, '["Sheet No. 12","Contract: ETB 12,743,526.77","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB026', 'Fentale Pastoral Training Center', 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)', 'COMPLETED', 'ETB 5,723,728.52',
  'Fentale, Oromia', 'Buildings', '365 Days', '2021',
  'Construction of a pastoral training center under the LLRP programme.', NULL, NULL, '["Sheet No. 13","Contract: ETB 5,723,728.52","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB027', 'Sudetan Chora Farmers G+3 Multipurpose Building', 'Sudetan Chora Farmers Cooperative Union', 'COMPLETED', 'ETB 3,310,080.19',
  'Sudetan Chora, Oromia', 'Buildings', '360 Days', '2021',
  'G+3 multipurpose building for the Sudetan Chora farmers cooperative union.', NULL, NULL, '["Sheet No. 14","Contract: ETB 3,310,080.19","Duration: 360 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB028', 'Gravel Road Resurfacing (Road Fund)', 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)', 'ACTIVE', 'ETB 5,474,000.00',
  'Oromia', 'Roads', '365 Days', '2021',
  'Gravel road resurfacing works financed through the road fund / LLRP programme.', NULL, NULL, '["Sheet No. 15","Contract: ETB 5,474,000.00","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB029', 'Boru Deck Girder Bridge — Jimma', 'Jimma Zone Roads and Logistics', 'COMPLETED', 'ETB 17,837,976.81',
  'Jimma Zone, Oromia', 'Bridges', '180 Days', '2022',
  'Construction of the Boru deck girder bridge for Jimma Zone roads and logistics.', NULL, NULL, '["Sheet No. 16","Contract: ETB 17,837,976.81","Duration: 180 Days"]', 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB030', 'Sewena Pastoral Training Center', 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)', 'COMPLETED', 'ETB 7,163,229.63',
  'Sewena, Oromia', 'Buildings', '4 Months', '2022',
  'Construction of Sewena pastoral training center under LLRP.', NULL, NULL, '["Sheet No. 17","Contract: ETB 7,163,229.63","Duration: 4 Months"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB031', 'Abattoir House at Chora Town', 'Bunno Bedele Chora District', 'COMPLETED', 'ETB 9,813,439.92',
  'Chora Town, Oromia', 'Buildings', '240 Days', '2023',
  'Construction of an abattoir house at Chora town.', NULL, NULL, '["Sheet No. 23","Contract: ETB 9,813,439.92","Duration: 240 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB032', 'Public Toilets Construction', 'Jimma Town Water Supply and Sanitation', 'COMPLETED', 'ETB 16,132,447.61',
  'Jimma, Oromia', 'Water', '365 Days', '2023',
  'Construction of public toilet facilities for Jimma town water supply and sanitation.', NULL, NULL, '["Sheet No. 24","Contract: ETB 16,132,447.61","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB033', 'Horro Guduru Wallaga Justice Office', 'Wajjira Abba Alangaa, Horro Guduru Wallaga Zone', 'ACTIVE', 'ETB 25,732,400.00',
  'Horro Guduru Wallaga, Oromia', 'Buildings', '365 Days', '2024',
  'Construction of the Horro Guduru Wallaga zone justice office.', NULL, NULL, '["Sheet No. 26","Contract: ETB 25,732,400.00","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB034', 'Maintenance of Chomen Guduru G+2 Justice and Police Office', 'Horro Guduru Wallaga Municipality Office', 'COMPLETED', 'ETB 13,417,050.00',
  'Chomen Guduru, Oromia', 'Buildings', '180 Days', '2024',
  'Maintenance works on the Chomen Guduru G+2 justice and police office.', NULL, NULL, '["Sheet No. 28","Contract: ETB 13,417,050.00","Duration: 180 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB035', 'Solid Waste Transfer Station — Sululta Sub-City, Shaggar', 'Shaggar City Real Estate', 'ACTIVE', 'ETB 15,200,000.00',
  'Sululta Sub-City, Shaggar', 'Infrastructure', '365 Days', '2025',
  'Construction of a solid waste transfer station at Sululta sub-city, Shaggar city.', NULL, NULL, '["Sheet No. 33","Contract: ETB 15,200,000.00","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

UPDATE projects SET isPublic = 1 WHERE id LIKE 'GB%';
