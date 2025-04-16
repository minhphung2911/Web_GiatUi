-- SQLite schema for WebGiatUi

-- Drop tables if they exist (comment these out in production)
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS users_roles;
-- DROP TABLE IF EXISTS services;
-- DROP TABLE IF EXISTS roles;
-- DROP TABLE IF EXISTS users;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT
);

-- Create users_roles join table
CREATE TABLE IF NOT EXISTS users_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    price_per_kg REAL NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    weight REAL,
    received_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL,
    note TEXT,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); 