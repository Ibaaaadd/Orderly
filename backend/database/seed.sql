-- ============================================================
--  Orderly — Seed Data
--  Sample categories, menus for development & demo.
-- ============================================================

-- Categories
INSERT INTO categories (name, icon_key, color_key) VALUES
  ('Makanan', 'utensils',    'primary'),
  ('Minuman', 'glass-water', 'sky'),
  ('Snack',   'cookie',      'amber');

-- Menus — Makanan (category_id = 1)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (1, 'Nasi Goreng Spesial',    25000, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', TRUE),
  (1, 'Mie Goreng Bakso',       22000, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400', TRUE),
  (1, 'Ayam Geprek Sambal',     28000, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', TRUE),
  (1, 'Nasi Uduk Komplit',      30000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', TRUE),
  (1, 'Soto Ayam Lamongan',     20000, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', TRUE),
  (1, 'Gado-Gado Komplit',      18000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', TRUE);

-- Menus — Minuman (category_id = 2)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (2, 'Es Teh Manis',     5000,  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', TRUE),
  (2, 'Jus Alpukat',      12000, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', TRUE),
  (2, 'Kopi Susu Kekinian', 18000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', TRUE),
  (2, 'Es Jeruk Peras',   8000,  'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', TRUE),
  (2, 'Teh Tarik',        10000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', TRUE);

-- Menus — Snack (category_id = 3)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (3, 'Kentang Goreng',    15000, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400', TRUE),
  (3, 'Pisang Goreng',     10000, 'https://images.unsplash.com/photo-1587132117481-e7b12d0f25ef?w=400', TRUE),
  (3, 'Roti Bakar Coklat', 12000, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400', TRUE),
  (3, 'Cireng Bumbu',       8000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', FALSE);
