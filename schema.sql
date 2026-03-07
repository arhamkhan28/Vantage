-- VANTAGE Streetwear Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    phone TEXT,
    address TEXT, -- JSON string: { street, city, zip }
    profiles TEXT, -- JSON string array: [{ id, name, avatar, relation }]
    avatar TEXT, -- URL to profile picture
    role TEXT DEFAULT 'user', -- 'user' or 'admin'
    provider TEXT DEFAULT 'email', -- 'email', 'google', etc.
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    discountPrice REAL,
    category TEXT,
    sizes TEXT, -- JSON string array: ["S", "M", "L", "XL"]
    stock INTEGER DEFAULT 0,
    image TEXT, -- Main product image URL
    image2 TEXT, -- Secondary product image URL (for hover effects)
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    products TEXT NOT NULL, -- JSON string array: [{ productId, name, size, quantity, price, image }]
    totalAmount REAL NOT NULL,
    paymentMethod TEXT, -- 'Credit Card', 'Debit Card', 'UPI', 'COD'
    paymentId TEXT, -- Transaction ID from payment gateway
    paymentStatus TEXT DEFAULT 'Pending', -- 'Pending', 'Success', 'Failed'
    shippingAddress TEXT, -- JSON string: { street, city, zip }
    orderStatus TEXT DEFAULT 'Pending', -- 'Pending', 'Shipped', 'Delivered', 'Cancelled'
    trackingNumber TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
);

-- Wishlist Table (Server-side persistence)
CREATE TABLE IF NOT EXISTS wishlist (
    userId INTEGER,
    productId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, productId),
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(productId) REFERENCES products(id)
);

-- Cart Table (Server-side persistence)
CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    productId INTEGER,
    size TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(productId) REFERENCES products(id)
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Admin Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT,
    adminId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(adminId) REFERENCES users(id)
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER,
    userId INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(productId) REFERENCES products(id),
    FOREIGN KEY(userId) REFERENCES users(id)
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discountType TEXT NOT NULL, -- 'percentage' or 'fixed'
    discountValue REAL NOT NULL,
    minOrderAmount REAL DEFAULT 0,
    expiryDate DATETIME,
    isActive INTEGER DEFAULT 1
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
