CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  wallet_json JSONB DEFAULT '{"usdBalance":20000,"btcBalance":0.35,"bonus":185}'::jsonb,
  positions_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


--EN SQL 

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  wallet_json JSON DEFAULT ('{"usdBalance":20000,"btcBalance":0.35,"bonus":185}'),
  positions_json JSON DEFAULT ('[]'),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);