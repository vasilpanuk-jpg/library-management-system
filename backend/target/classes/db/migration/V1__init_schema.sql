-- Initial schema for Library Management System
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS readers (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  registration_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(50),
  year INTEGER,
  publisher VARCHAR(255),
  category VARCHAR(255),
  total_copies INTEGER DEFAULT 0,
  available_copies INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS loans (
  id BIGSERIAL PRIMARY KEY,
  reader_id BIGINT REFERENCES readers(id) ON DELETE SET NULL,
  book_id BIGINT REFERENCES books(id) ON DELETE SET NULL,
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  returned_date DATE,
  status VARCHAR(50) -- ISSUED, RETURNED, OVERDUE
);

CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  report_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT now(),
  payload JSONB
);
