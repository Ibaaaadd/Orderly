-- ============================================================
--  Orderly — Seed Data
--  Comprehensive dummy data for development & demo.
--  Covers: categories, menus, orders (2025 full year + 2026 Jan–Mar)
-- ============================================================

-- ── Truncate existing data (preserve sequences start) ────────────
TRUNCATE TABLE payments, order_items, orders, menus, categories RESTART IDENTITY CASCADE;

-- ════════════════════════════════════════════════════════════════
--  CATEGORIES
-- ════════════════════════════════════════════════════════════════
INSERT INTO categories (name, icon_key, color_key) VALUES
  ('Makanan',  'utensils',    'primary'),   -- 1
  ('Minuman',  'glass-water', 'sky'),       -- 2
  ('Snack',    'cookie',      'amber'),     -- 3
  ('Kopi',     'coffee',      'pink'),      -- 4
  ('Es Krim',  'ice-cream',   'violet'),    -- 5
  ('Sarapan',  'egg',         'emerald'),   -- 6
  ('Paket',    'bag',         'orange');    -- 7

-- ════════════════════════════════════════════════════════════════
--  MENUS
-- ════════════════════════════════════════════════════════════════

-- Makanan (1)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (1, 'Nasi Goreng Spesial',    25000, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', TRUE),
  (1, 'Mie Goreng Bakso',       22000, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400', TRUE),
  (1, 'Ayam Geprek Sambal',     28000, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', TRUE),
  (1, 'Nasi Uduk Komplit',      30000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', TRUE),
  (1, 'Soto Ayam Lamongan',     20000, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', TRUE),
  (1, 'Gado-Gado Komplit',      18000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', TRUE),
  (1, 'Nasi Rendang',           35000, 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', TRUE),
  (1, 'Ayam Bakar Madu',        32000, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', TRUE),
  (1, 'Nasi Campur Bali',       27000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', TRUE),
  (1, 'Mie Ayam Bakso',         23000, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400', TRUE);

-- Minuman (2)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (2, 'Es Teh Manis',           5000,  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', TRUE),
  (2, 'Jus Alpukat',            12000, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', TRUE),
  (2, 'Es Jeruk Peras',         8000,  'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', TRUE),
  (2, 'Teh Tarik',              10000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', TRUE),
  (2, 'Jus Mangga Segar',       13000, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', TRUE),
  (2, 'Es Lemon Tea',           9000,  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', TRUE),
  (2, 'Air Mineral',            4000,  'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400', TRUE);

-- Snack (3)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (3, 'Kentang Goreng',         15000, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400', TRUE),
  (3, 'Pisang Goreng',          10000, 'https://images.unsplash.com/photo-1587132117481-e7b12d0f25ef?w=400', TRUE),
  (3, 'Roti Bakar Coklat',      12000, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400', TRUE),
  (3, 'Cireng Bumbu',            8000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', TRUE),
  (3, 'Tahu Crispy',             9000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', TRUE),
  (3, 'Onion Ring',             13000, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400', TRUE);

-- Kopi (4)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (4, 'Kopi Susu Kekinian',     18000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', TRUE),
  (4, 'Americano',              15000, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', TRUE),
  (4, 'Cappuccino',             20000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', TRUE),
  (4, 'Latte',                  22000, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400', TRUE),
  (4, 'Espresso',               12000, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', TRUE),
  (4, 'Kopi Tubruk',             8000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', TRUE);

-- Es Krim (5)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (5, 'Es Krim Coklat',         15000, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400', TRUE),
  (5, 'Es Krim Vanilla',        15000, 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', TRUE),
  (5, 'Sundae Strawberry',      20000, 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400', TRUE),
  (5, 'Milkshake Coklat',       22000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', TRUE);

-- Sarapan (6)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (6, 'Nasi Kuning Komplit',    20000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', TRUE),
  (6, 'Lontong Sayur',          15000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', TRUE),
  (6, 'Bubur Ayam',             14000, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', TRUE),
  (6, 'Roti Telur Dadar',       12000, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400', TRUE),
  (6, 'Nasi Pecel',             17000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', TRUE);

-- Paket (7)
INSERT INTO menus (category_id, name, price, image_url, is_available) VALUES
  (7, 'Paket Hemat A',          35000, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', TRUE),
  (7, 'Paket Hemat B',          40000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', TRUE),
  (7, 'Paket Keluarga',         95000, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', TRUE),
  (7, 'Paket Sarapan Duo',      28000, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400', TRUE);

-- ════════════════════════════════════════════════════════════════
--  HELPER: insert_order function (avoids repetition)
--  We'll use plain SQL with explicit VALUES instead.
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
--  ORDERS + ORDER_ITEMS — 2025
--  Strategy: ~15-30 orders per month, realistic mix of paid/cancelled
--  Each order gets 1-3 items. IDs auto from SERIAL.
-- ════════════════════════════════════════════════════════════════

-- We use a DO block for realistic volume across all months.
DO $$
DECLARE
  -- month config: (month, num_paid, num_cancelled)
  months       INT[][]  := ARRAY[
    ARRAY[1,18,3],  ARRAY[2,20,2],  ARRAY[3,22,4],
    ARRAY[4,25,3],  ARRAY[5,24,4],  ARRAY[6,28,3],
    ARRAY[7,30,5],  ARRAY[8,27,3],  ARRAY[9,26,4],
    ARRAY[10,32,4], ARRAY[11,35,5], ARRAY[12,40,6]
  ];
  months_2026  INT[][]  := ARRAY[
    ARRAY[1,28,3],  ARRAY[2,30,4],  ARRAY[3,22,2]
  ];

  m            INT[];
  yr           INT;
  mo           INT;
  n_paid       INT;
  n_cancelled  INT;
  i            INT;
  day_offset   INT;
  ord_id       INT;
  t_price      NUMERIC;
  qty1         INT;
  qty2         INT;
  qty3         INT;
  menu_ids     INT[] := ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48];
  menu_prices  NUMERIC[] := ARRAY[25000,22000,28000,30000,20000,18000,35000,32000,27000,23000,5000,12000,8000,10000,13000,9000,4000,15000,10000,12000,8000,9000,13000,18000,15000,20000,22000,12000,8000,15000,15000,20000,22000,20000,15000,14000,12000,17000,35000,40000,95000,28000,0,0,0,0,0,0];
  menu_names   TEXT[]    := ARRAY['Nasi Goreng Spesial','Mie Goreng Bakso','Ayam Geprek Sambal','Nasi Uduk Komplit','Soto Ayam Lamongan','Gado-Gado Komplit','Nasi Rendang','Ayam Bakar Madu','Nasi Campur Bali','Mie Ayam Bakso','Es Teh Manis','Jus Alpukat','Es Jeruk Peras','Teh Tarik','Jus Mangga Segar','Es Lemon Tea','Air Mineral','Kentang Goreng','Pisang Goreng','Roti Bakar Coklat','Cireng Bumbu','Tahu Crispy','Onion Ring','Kopi Susu Kekinian','Americano','Cappuccino','Latte','Espresso','Kopi Tubruk','Es Krim Coklat','Es Krim Vanilla','Sundae Strawberry','Milkshake Coklat','Nasi Kuning Komplit','Lontong Sayur','Bubur Ayam','Roti Telur Dadar','Nasi Pecel','Paket Hemat A','Paket Hemat B','Paket Keluarga','Paket Sarapan Duo'];
  -- note: menu_ids index 1..42 match the 42 menus we inserted; extras trimmed below
  m1_id        INT;
  m1_price     NUMERIC;
  m1_name      TEXT;
  m2_id        INT;
  m2_price     NUMERIC;
  m2_name      TEXT;
  m3_id        INT;
  m3_price     NUMERIC;
  m3_name      TEXT;
  cust_names   TEXT[] := ARRAY['Budi Santoso','Siti Rahayu','Agus Purnomo','Dewi Lestari','Eko Wahyudi','Fitri Handayani','Hendra Kusuma','Indah Permata','Joko Susanto','Kartini Wulan','Lukman Hakim','Maya Sari','Niko Pratama','Oki Setiawan','Putri Anggraini','Rizky Maulana','Sari Dewi','Teguh Wibowo','Umar Fauzi','Vera Susanti','Wawan Hermawan','Yeni Kurnia','Zainal Abidin','Aisyah Nur','Bagas Fattah'];
  phones       TEXT[] := ARRAY['081234567890','082345678901','083456789012','084567890123','085678901234','086789012345','087890123456','088901234567','089012345678','081123456789','082234567890','083345678901','084456789012','085567890123','086678901234','087789012345','088890123456','089901234567','081012345678','082123456789','083213456789','084321456789','085432156789','086543216789','087654321678'];
  tbl_nums     TEXT[] := ARRAY['A1','A2','A3','A4','B1','B2','B3','C1','C2','C3','D1','D2'];
  order_types  TEXT[] := ARRAY['dine_in','dine_in','dine_in','takeaway'];
  cust_idx     INT;
  total_menus  INT := 42;
  ref_id       TEXT;
BEGIN

  -- ── 2025 ───────────────────────────────────────────────────────
  yr := 2025;
  FOREACH m SLICE 1 IN ARRAY months LOOP
    mo          := m[1];
    n_paid      := m[2];
    n_cancelled := m[3];

    -- PAID orders
    FOR i IN 1..n_paid LOOP
      day_offset := 1 + (random() * 26)::INT;
      cust_idx   := 1 + (random() * 24)::INT;
      m1_id      := 1 + (random() * (total_menus - 1))::INT;
      m1_price   := menu_prices[m1_id];
      m1_name    := menu_names[m1_id];

      -- 60% chance of a second item
      IF random() > 0.4 THEN
        m2_id    := 1 + (random() * (total_menus - 1))::INT;
        m2_price := menu_prices[m2_id];
        m2_name  := menu_names[m2_id];
      ELSE
        m2_id := NULL; m2_price := 0; m2_name := NULL;
      END IF;

      -- 30% chance of a third item
      IF random() > 0.7 THEN
        m3_id    := 1 + (random() * (total_menus - 1))::INT;
        m3_price := menu_prices[m3_id];
        m3_name  := menu_names[m3_id];
      ELSE
        m3_id := NULL; m3_price := 0; m3_name := NULL;
      END IF;

      qty1   := 1 + (random() * 2)::INT;
      qty2   := 1 + (random() * 1)::INT;
      qty3   := 1;
      t_price := m1_price * qty1
               + CASE WHEN m2_id IS NOT NULL THEN m2_price * qty2 ELSE 0 END
               + CASE WHEN m3_id IS NOT NULL THEN m3_price * qty3 ELSE 0 END;

      ref_id := 'ORD-' || yr || LPAD(mo::TEXT,2,'0') || LPAD(i::TEXT,3,'0') || '-P';

      INSERT INTO orders
        (customer_name, table_number, order_type, total_price, status, payment_reference, created_at)
      VALUES (
        cust_names[cust_idx],
        tbl_nums[1 + (random() * 11)::INT],
        order_types[1 + (random() * 3)::INT],
        t_price,
        'paid',
        ref_id,
        make_timestamptz(yr, mo, day_offset,
          8 + (random() * 13)::INT,
          (random() * 59)::INT,
          0, 'Asia/Jakarta')
      ) RETURNING id INTO ord_id;

      -- items
      INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
      VALUES (ord_id, m1_id, m1_name, m1_price, qty1, m1_price * qty1);

      IF m2_id IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
        VALUES (ord_id, m2_id, m2_name, m2_price, qty2, m2_price * qty2);
      END IF;

      IF m3_id IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
        VALUES (ord_id, m3_id, m3_name, m3_price, qty3, m3_price * qty3);
      END IF;

      -- payment record
      INSERT INTO payments (order_id, gateway, reference_id, payment_status, created_at)
      VALUES (ord_id, 'midtrans', ref_id, 'paid',
        make_timestamptz(yr, mo, day_offset, 8 + (random() * 13)::INT, (random() * 59)::INT, 0, 'Asia/Jakarta'));
    END LOOP;

    -- CANCELLED orders
    FOR i IN 1..n_cancelled LOOP
      day_offset := 1 + (random() * 26)::INT;
      cust_idx   := 1 + (random() * 24)::INT;
      m1_id      := 1 + (random() * (total_menus - 1))::INT;
      m1_price   := menu_prices[m1_id];
      m1_name    := menu_names[m1_id];
      qty1       := 1 + (random() * 2)::INT;
      t_price    := m1_price * qty1;
      ref_id     := 'ORD-' || yr || LPAD(mo::TEXT,2,'0') || LPAD(i::TEXT,3,'0') || '-C';

      INSERT INTO orders
        (customer_name, table_number, order_type, total_price, status, created_at)
      VALUES (
        cust_names[cust_idx],
        tbl_nums[1 + (random() * 11)::INT],
        order_types[1 + (random() * 3)::INT],
        t_price,
        'cancelled',
        make_timestamptz(yr, mo, day_offset,
          8 + (random() * 13)::INT,
          (random() * 59)::INT,
          0, 'Asia/Jakarta')
      ) RETURNING id INTO ord_id;

      INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
      VALUES (ord_id, m1_id, m1_name, m1_price, qty1, m1_price * qty1);
    END LOOP;

  END LOOP;

  -- ── 2026 (Jan – Mar) ────────────────────────────────────────────
  yr := 2026;
  FOREACH m SLICE 1 IN ARRAY months_2026 LOOP
    mo          := m[1];
    n_paid      := m[2];
    n_cancelled := m[3];

    FOR i IN 1..n_paid LOOP
      day_offset := 1 + (random() * 26)::INT;

      -- For March 2026 cap days to today (12)
      IF mo = 3 AND yr = 2026 AND day_offset > 12 THEN
        day_offset := 1 + (random() * 11)::INT;
      END IF;

      cust_idx  := 1 + (random() * 24)::INT;
      m1_id     := 1 + (random() * (total_menus - 1))::INT;
      m1_price  := menu_prices[m1_id];
      m1_name   := menu_names[m1_id];

      IF random() > 0.4 THEN
        m2_id    := 1 + (random() * (total_menus - 1))::INT;
        m2_price := menu_prices[m2_id];
        m2_name  := menu_names[m2_id];
      ELSE
        m2_id := NULL; m2_price := 0; m2_name := NULL;
      END IF;

      IF random() > 0.7 THEN
        m3_id    := 1 + (random() * (total_menus - 1))::INT;
        m3_price := menu_prices[m3_id];
        m3_name  := menu_names[m3_id];
      ELSE
        m3_id := NULL; m3_price := 0; m3_name := NULL;
      END IF;

      qty1    := 1 + (random() * 2)::INT;
      qty2    := 1 + (random() * 1)::INT;
      qty3    := 1;
      t_price := m1_price * qty1
               + CASE WHEN m2_id IS NOT NULL THEN m2_price * qty2 ELSE 0 END
               + CASE WHEN m3_id IS NOT NULL THEN m3_price * qty3 ELSE 0 END;

      ref_id := 'ORD-' || yr || LPAD(mo::TEXT,2,'0') || LPAD(i::TEXT,3,'0') || '-P';

      INSERT INTO orders
        (customer_name, table_number, order_type, total_price, status, payment_reference, created_at)
      VALUES (
        cust_names[cust_idx],
        tbl_nums[1 + (random() * 11)::INT],
        order_types[1 + (random() * 3)::INT],
        t_price,
        'paid',
        ref_id,
        make_timestamptz(yr, mo, day_offset,
          8 + (random() * 13)::INT,
          (random() * 59)::INT,
          0, 'Asia/Jakarta')
      ) RETURNING id INTO ord_id;

      INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
      VALUES (ord_id, m1_id, m1_name, m1_price, qty1, m1_price * qty1);

      IF m2_id IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
        VALUES (ord_id, m2_id, m2_name, m2_price, qty2, m2_price * qty2);
      END IF;

      IF m3_id IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
        VALUES (ord_id, m3_id, m3_name, m3_price, qty3, m3_price * qty3);
      END IF;

      INSERT INTO payments (order_id, gateway, reference_id, payment_status, created_at)
      VALUES (ord_id, 'midtrans', ref_id, 'paid',
        make_timestamptz(yr, mo, day_offset, 8 + (random() * 13)::INT, (random() * 59)::INT, 0, 'Asia/Jakarta'));
    END LOOP;

    FOR i IN 1..n_cancelled LOOP
      day_offset := 1 + (random() * 26)::INT;
      IF mo = 3 AND yr = 2026 AND day_offset > 12 THEN
        day_offset := 1 + (random() * 11)::INT;
      END IF;

      cust_idx  := 1 + (random() * 24)::INT;
      m1_id     := 1 + (random() * (total_menus - 1))::INT;
      m1_price  := menu_prices[m1_id];
      m1_name   := menu_names[m1_id];
      qty1      := 1 + (random() * 2)::INT;
      t_price   := m1_price * qty1;
      ref_id    := 'ORD-' || yr || LPAD(mo::TEXT,2,'0') || LPAD(i::TEXT,3,'0') || '-C';

      INSERT INTO orders
        (customer_name, table_number, order_type, total_price, status, created_at)
      VALUES (
        cust_names[cust_idx],
        tbl_nums[1 + (random() * 11)::INT],
        order_types[1 + (random() * 3)::INT],
        t_price,
        'cancelled',
        make_timestamptz(yr, mo, day_offset,
          8 + (random() * 13)::INT,
          (random() * 59)::INT,
          0, 'Asia/Jakarta')
      ) RETURNING id INTO ord_id;

      INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
      VALUES (ord_id, m1_id, m1_name, m1_price, qty1, m1_price * qty1);
    END LOOP;

  END LOOP;

END $$;

