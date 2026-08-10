-- PostgreSQL Database Schema Setup

-- Users Table (Phone Number-based shopper accounts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    image_url TEXT,
    description TEXT,
    history TEXT,
    properties TEXT,
    care TEXT
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    fabric VARCHAR(100) NOT NULL,
    occasion VARCHAR(100) NOT NULL,
    colour VARCHAR(50) NOT NULL,
    tags TEXT[] NOT NULL,
    is_reel BOOLEAN DEFAULT FALSE,
    views VARCHAR(50),
    rating DECIMAL(2,1) DEFAULT 4.5,
    reviews INTEGER DEFAULT 0,
    blouse BOOLEAN DEFAULT FALSE,
    description TEXT,
    image TEXT,
    stock INTEGER NOT NULL DEFAULT 10,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    variants JSONB DEFAULT '[]'::jsonb,
    reel_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'placed', -- placed, paid, processing, shipped, delivered, cancelled
    tracking_id VARCHAR(100),            -- AWB / tracking number from courier
    carrier_name VARCHAR(100),           -- e.g. Shiprocket, India Post, Delhivery
    tracking_url TEXT,                   -- clickable customer-facing tracking link
    processing_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    coupon_code VARCHAR(50),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    fabric VARCHAR(100) NOT NULL,
    colour VARCHAR(50) NOT NULL,
    qty INTEGER NOT NULL
);

-- Bulk Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    boutique VARCHAR(255),
    whatsapp VARCHAR(20) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    preferred_type VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offer Banners (admin-managed scrollable home page banners)
CREATE TABLE IF NOT EXISTS offer_banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    badge_text VARCHAR(100),
    cta_text VARCHAR(100) DEFAULT 'Explore Now',
    cta_link VARCHAR(100) DEFAULT 'deals',
    bg_from VARCHAR(30) DEFAULT '#E8920E',
    bg_to VARCHAR(30) DEFAULT '#C4601A',
    discount_percent INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(10) NOT NULL,           -- 'percent' | 'flat'
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_discount_cap DECIMAL(10,2),               -- NULL = no cap
    usage_limit INTEGER,                          -- NULL = unlimited
    used_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    applicable_category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usages (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(100),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video Reels (admin links product to a video)
CREATE TABLE IF NOT EXISTS reels (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Returns & Refunds
CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason VARCHAR(50) NOT NULL,           -- damaged | wrong_item | not_as_described | changed_mind | size_issue | other
    description TEXT,
    resolution VARCHAR(20) NOT NULL,       -- refund | exchange
    status VARCHAR(30) DEFAULT 'requested', -- requested | approved | picked_up | refunded | rejected
    items JSONB NOT NULL DEFAULT '[]',     -- [{id, name, qty, price}]
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
