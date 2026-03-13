-- ============================================================
--  Orderly — PostgreSQL Database Schema
--  Run this script to create all tables from scratch.
-- ============================================================

-- Drop existing tables if re-running (order matters due to FK)
DROP TABLE IF EXISTS payments      CASCADE;
DROP TABLE IF EXISTS order_item_package_selections CASCADE;
DROP TABLE IF EXISTS package_menu_rule_items CASCADE;
DROP TABLE IF EXISTS package_menu_rules CASCADE;
DROP TABLE IF EXISTS order_items   CASCADE;
DROP TABLE IF EXISTS orders        CASCADE;
DROP TABLE IF EXISTS menus         CASCADE;
DROP TABLE IF EXISTS categories    CASCADE;

-- ── categories ────────────────────────────────────────────────────
CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  icon_key   VARCHAR(50)  NOT NULL DEFAULT 'tag',
  color_key  VARCHAR(50)  NOT NULL DEFAULT 'primary',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── menus ─────────────────────────────────────────────────────────
CREATE TABLE menus (
  id           SERIAL PRIMARY KEY,
  category_id  INT          REFERENCES categories(id) ON DELETE SET NULL,
  name         VARCHAR(200) NOT NULL,
  price        NUMERIC(12, 0) NOT NULL CHECK (price >= 0),
  image_url    TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_package   BOOLEAN NOT NULL DEFAULT FALSE,
  levels       JSONB   NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE INDEX idx_menus_category ON menus(category_id);

-- ── package_menu_rules ───────────────────────────────────────────
CREATE TABLE package_menu_rules (
  id              SERIAL PRIMARY KEY,
  package_menu_id INT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  rule_name       VARCHAR(120) NOT NULL DEFAULT 'Isi Paket',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_package_rules_menu ON package_menu_rules(package_menu_id);

-- Admin-defined composition items for a package rule.
-- Customer buys the package; admin decides the included items here.
CREATE TABLE package_menu_rule_items (
  id                   SERIAL PRIMARY KEY,
  package_menu_rule_id INT NOT NULL REFERENCES package_menu_rules(id) ON DELETE CASCADE,
  selected_menu_id     INT NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
  selected_level       VARCHAR(100),
  qty                  INT NOT NULL DEFAULT 1 CHECK (qty > 0),
  sort_order           INT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pmri_rule ON package_menu_rule_items(package_menu_rule_id);
CREATE INDEX idx_pmri_menu ON package_menu_rule_items(selected_menu_id);

-- ── orders ────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                SERIAL PRIMARY KEY,
  customer_name     VARCHAR(200) NOT NULL,
  customer_phone    VARCHAR(20),
  customer_email    VARCHAR(200),
  table_number      VARCHAR(20),
  order_type        VARCHAR(20)  NOT NULL DEFAULT 'dine_in'
                    CHECK (order_type IN ('dine_in', 'takeaway')),
  total_price       NUMERIC(14, 0) NOT NULL CHECK (total_price >= 0),
  status            VARCHAR(20)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'cancelled', 'ready', 'completed')),
  payment_reference VARCHAR(200),
  browser_id        VARCHAR(36),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_browser_id ON orders(browser_id);

CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ── order_items ───────────────────────────────────────────────────
CREATE TABLE order_items (
  id        SERIAL PRIMARY KEY,
  order_id  INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id   INT           REFERENCES menus(id) ON DELETE SET NULL,
  menu_name VARCHAR(200),
  price     NUMERIC(12,0) NOT NULL,
  qty       INT           NOT NULL CHECK (qty > 0),
  subtotal  NUMERIC(14,0) NOT NULL,
  level     VARCHAR(100)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ── order_item_package_selections ───────────────────────────────
CREATE TABLE order_item_package_selections (
  id                   SERIAL PRIMARY KEY,
  order_item_id        INT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  package_menu_rule_id INT REFERENCES package_menu_rules(id) ON DELETE SET NULL,
  selected_menu_id     INT REFERENCES menus(id) ON DELETE SET NULL,
  selected_menu_name   VARCHAR(200),
  selected_level       VARCHAR(100),
  qty                  INT NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_oips_order_item ON order_item_package_selections(order_item_id);
CREATE INDEX idx_oips_selected_menu ON order_item_package_selections(selected_menu_id);

-- ── payments ──────────────────────────────────────────────────────
CREATE TABLE payments (
  id             SERIAL PRIMARY KEY,
  order_id       INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway        VARCHAR(50)  NOT NULL DEFAULT 'mock',
  reference_id   VARCHAR(200) NOT NULL,
  qris_url       TEXT,
  payment_status VARCHAR(20)  NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order     ON payments(order_id);
CREATE INDEX idx_payments_reference ON payments(reference_id);
