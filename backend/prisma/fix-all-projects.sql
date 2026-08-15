-- Import ALL 35 company projects (GB001-GB035), published.
-- phpMyAdmin → gindebsx_gindeberet_db → Import
SET NAMES utf8mb4;

DELETE FROM projects WHERE id IN ('PRJ001','PRJ002','PRJ003','PRJ004','PRJ005');

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB001', 'Degalo–Halaba Exit Corridor', 'Shashamane City Administration', 'ACTIVE', 'ETB 3,102,826,609.25',
  'Shashamane, Oromia', 'Corridors', '730 Days', '2026',
  'Major exit corridor works linking Degalo to Halaba for Shashamane city administration.', NULL, NULL, '["Sheet No. 35","Contract: ETB 3,102,826,609.25","Duration: 730 Days"]', 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB002', 'Furii Corridor LOT 2 (Hiwot Fana–NOC)', 'Shaggar City, Furii Sub-City Municipality', 'ACTIVE', 'ETB 2,663,657,876.71',
  'Furii, Shaggar', 'Corridors', '730 Days', '2025',
  'Furii corridor LOT 2 works between Hiwot Fana and NOC for Shaggar city.', NULL, NULL, '["Sheet No. 34","Contract: ETB 2,663,657,876.71","Duration: 730 Days"]', 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB003', 'Qare Tule–Ajo DC-2 Rural Gravel Road', 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)', 'COMPLETED', 'ETB 162,703,547.55',
  'Qare Tule–Ajo, Oromia', 'Roads', '365 Days', '2023',
  'DC-2 rural gravel road package under the LLRP programme.', NULL, NULL, '["Sheet No. 19","Contract: ETB 162,703,547.55","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB004', 'Shaggar Roadside Corridor — Koyye Feche LOT 1', 'Shaggar City Real Estate and Construction Corporation (sub-contract)', 'ACTIVE', 'ETB 162,703,547.55',
  'Koyye Feche, Shaggar', 'Corridors', '365 Days', '2024',
  'Roadside corridor LOT 1 at Koyye Feche for Shaggar city.', NULL, NULL, '["Sheet No. 25","Contract: ETB 162,703,547.55","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB005', 'Ambelia Small-Scale Irrigation', 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)', 'ACTIVE', 'ETB 77,810,265.00',
  'Ambelta, Oromia', 'Water', '365 Days', '2025',
  'Small-scale irrigation works under the LLRP programme.', NULL, NULL, '["Sheet No. 32","Contract: ETB 77,810,265.00","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB006', 'Abbichuu Model Primary School', 'Shaggar City Education Office', 'COMPLETED', 'ETB 67,429,045.26',
  'Furii Sub-City, Shaggar', 'Buildings', '365 Days', '2024',
  'Construction of Abbichuu model primary school for Shaggar city education office.', NULL, NULL, '["Sheet No. 29","Contract: ETB 67,429,045.26","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB007', 'Birqicha River Bridge', 'Wajjira Abba Alangaa, Horro Guduru Wallaga', 'ACTIVE', 'ETB 67,282,013.15',
  'Horro Guduru Wallaga, Oromia', 'Bridges', '365 Days', '2025',
  'River bridge construction at Birqicha in Horro Guduru Wallaga.', NULL, NULL, '["Sheet No. 31","Contract: ETB 67,282,013.15","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB008', 'Horro Guduru Wallaga Health Office (G+4)', 'Horro Guduru Wallaga Zone Health Office', 'COMPLETED', 'ETB 60,555,741.40',
  'Horro Guduru Wallaga, Oromia', 'Buildings', '540 Days', '2022',
  'G+4 zone health office building for Horro Guduru Wallaga.', NULL, NULL, '["Sheet No. 18","Contract: ETB 60,555,741.40","Duration: 540 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB009', 'Dero Hara Gura DC-2 Rural Road', 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)', 'COMPLETED', 'ETB 46,056,343.39',
  'Dero Hara Gura, Oromia', 'Roads', '365 Days', '2023',
  'DC-2 rural road package at Dero Hara Gura under LLRP.', NULL, NULL, '["Sheet No. 21","Contract: ETB 46,056,343.39","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB010', 'Chora Woreda Health Office', 'Chora Woreda Health Office', 'COMPLETED', 'ETB 40,473,247.03',
  'Chora, Oromia', 'Buildings', '365 Days', '2023',
  'Woreda health office building in Chora district.', NULL, NULL, '["Sheet No. 20","Contract: ETB 40,473,247.03","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB011', 'Jimma Earth-Pressed Municipal Road', 'Jimma City Administration', 'COMPLETED', 'ETB 38,895,650.00',
  'Jimma, Oromia', 'Roads', '365 Days', '2023',
  'Earth-pressed municipal road works for Jimma city administration.', NULL, NULL, '["Sheet No. 22","Contract: ETB 38,895,650.00","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB012', 'Furniture & Electro-Mechanical Works — Chora Health G+4', 'Chora Woreda Health Office', 'COMPLETED', 'ETB 37,199,040.71',
  'Chora, Oromia', 'Electro-Mechanical', '180 Days', '2024',
  'Furniture and electro-mechanical package for Chora G+4 health facility.', NULL, NULL, '["Sheet No. 27","Contract: ETB 37,199,040.71","Duration: 180 Days"]', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB013', 'Gudannee Community Health Post (CHP)', 'Borecha Health Office', 'COMPLETED', 'ETB 36,904,922.17',
  'Gudannee / Borecha, Oromia', 'Buildings', '240 Days', '2024',
  'Community health post construction at Gudannee for Borecha health office.', NULL, NULL, '["Sheet No. 30","Contract: ETB 36,904,922.17","Duration: 240 Days"]', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB014', 'Bonga Pressure Lines & Electro-Mechanical Works', 'Bonga Town (sub-contract)', 'COMPLETED', 'ETB 22,357,873.82',
  'Bonga, Ethiopia', 'Electro-Mechanical', '365 Days', '2019',
  'Pressure lines and electro-mechanical works for Bonga town.', NULL, NULL, '["Sheet No. 8","Contract: ETB 22,357,873.82","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)
VALUES (
  'GB015', 'Mako Water Treatment Plant Package', 'Oromia Regional State Construction Works Corporation', 'COMPLETED', 'ETB 24,813,202.34',
  'Mako / Meko, Oromia', 'Water', '365 Days', '2017',
  'Water treatment plant package delivered for Oromia Construction Works Corporation.', NULL, NULL, '["Sheet No. 2","Contract: ETB 24,813,202.34","Duration: 365 Days"]', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80', 1, NULL, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE
  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),
  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),
  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=NOW(3);

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
