-- PostgreSQL schema for optional persistent purchase tracking.
-- This project does not use an ORM by design.

CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  variant_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, customer_email)
);

CREATE INDEX IF NOT EXISTS purchases_customer_email_idx ON purchases (customer_email);
CREATE INDEX IF NOT EXISTS purchases_created_at_idx ON purchases (created_at DESC);
