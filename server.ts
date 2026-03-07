import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "vantage_secret_key_123";

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- DATABASE SETUP ---
const db = new Database("vantage.db");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    phone TEXT,
    address TEXT, -- JSON string
    profiles TEXT, -- JSON string array of {id, name, avatar, relation}
    avatar TEXT, -- Profile picture URL
    role TEXT DEFAULT 'user',
    provider TEXT DEFAULT 'email',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add profiles column if it doesn't exist
try {
  db.prepare("SELECT profiles FROM users LIMIT 1").get();
} catch (e) {
  console.log("Adding 'profiles' column to 'users' table...");
  db.exec("ALTER TABLE users ADD COLUMN profiles TEXT");
}

// Migration: Add avatar column if it doesn't exist
try {
  db.prepare("SELECT avatar FROM users LIMIT 1").get();
} catch (e) {
  console.log("Adding 'avatar' column to 'users' table...");
  db.exec("ALTER TABLE users ADD COLUMN avatar TEXT");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    discountPrice REAL,
    category TEXT,
    sizes TEXT, -- JSON string array
    stock INTEGER DEFAULT 0,
    image TEXT,
    image2 TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    products TEXT, -- JSON string array of {productId, size, quantity, price}
    totalAmount REAL NOT NULL,
    paymentMethod TEXT,
    paymentId TEXT,
    paymentStatus TEXT,
    shippingAddress TEXT, -- JSON string
    orderStatus TEXT DEFAULT 'Pending',
    trackingNumber TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    details TEXT,
    adminId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    userId INTEGER,
    productId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, productId),
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(productId) REFERENCES products(id)
  );

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

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER,
    userId INTEGER,
    rating INTEGER,
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(productId) REFERENCES products(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discountType TEXT NOT NULL, -- 'percentage' or 'fixed'
    discountValue REAL NOT NULL,
    minOrderAmount REAL DEFAULT 0,
    expiryDate DATETIME,
    isActive INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize default settings
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  insertSetting.run("siteName", "VANTAGE");
  insertSetting.run("maintenanceMode", "false");
  insertSetting.run("shippingFee", "100");
  insertSetting.run("taxRate", "18");
}

// Migration: Add trackingNumber column to orders if it doesn't exist
try {
  db.prepare("SELECT trackingNumber FROM orders LIMIT 1").get();
} catch (e) {
  console.log("Adding 'trackingNumber' column to 'orders' table...");
  db.exec("ALTER TABLE orders ADD COLUMN trackingNumber TEXT");
}
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count < 1500) {
  console.log("Seeding massive product catalog (1800+ items)...");
  
  // Clear existing products to ensure clean state for this massive update
  db.prepare("DELETE FROM products").run();
  
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, discountPrice, category, sizes, stock, image, image2)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const categories = [
    { 
      name: "Oversize", 
      prefix: "OVRSZ", 
      basePrice: 1299,
      images: [
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e",
        "https://images.unsplash.com/photo-1523381235212-17c24e3c93f3",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
        "https://images.unsplash.com/photo-1578932750294-f5075e85f44a",
        "https://images.unsplash.com/photo-1552664199-fd31f7431a55"
      ]
    },
    { 
      name: "Graphic", 
      prefix: "GPHX", 
      basePrice: 1499,
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
        "https://images.unsplash.com/photo-1554568218-0f1715e72254"
      ]
    },
    { 
      name: "Basic", 
      prefix: "ESSNTL", 
      basePrice: 899,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820",
        "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc",
        "https://images.unsplash.com/photo-1527719327859-c6ce80353573",
        "https://images.unsplash.com/photo-1571945153237-4929e783ee4a"
      ]
    },
    { 
      name: "Logo", 
      prefix: "VNTG-LGO", 
      basePrice: 1199,
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
        "https://images.unsplash.com/photo-1554568218-0f1715e72254",
        "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9",
        "https://images.unsplash.com/photo-1551028719-00167b16eac5"
      ]
    },
    { 
      name: "Vintage", 
      prefix: "VNTG-WSH", 
      basePrice: 1899,
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
        "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3",
        "https://images.unsplash.com/photo-1551232864-3f0890e580d9"
      ]
    },
    { 
      name: "Accessories", 
      prefix: "ACC", 
      basePrice: 1599,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        "https://images.unsplash.com/photo-1509941943102-10c232535736",
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638",
        "https://images.unsplash.com/photo-1511499767390-90342f16b41f",
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d"
      ]
    },
    { 
      name: "Footwear", 
      prefix: "FTWR", 
      basePrice: 3499,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86"
      ]
    },
    { 
      name: "Fragrances", 
      prefix: "FRG", 
      basePrice: 1899,
      images: [
        "https://images.unsplash.com/photo-1541643600914-78b084683601",
        "https://images.unsplash.com/photo-1594035910387-fea47794261f",
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539",
        "https://images.unsplash.com/photo-1557170334-a9632e77c6e4",
        "https://images.unsplash.com/photo-1585232351009-aa87416fca90"
      ]
    },
    { 
      name: "Home Decor", 
      prefix: "HOME", 
      basePrice: 899,
      images: [
        "https://images.unsplash.com/photo-1603006905003-be475563bc59",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92",
        "https://images.unsplash.com/photo-1534349762230-e0cadf78f505",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f"
      ]
    }
  ];

  const productsPerCategory = 205; // Total ~1845 products

  db.transaction(() => {
    categories.forEach(cat => {
      for (let i = 1; i <= productsPerCategory; i++) {
        const idStr = i.toString().padStart(3, '0');
        const name = `${cat.name} ${cat.prefix}-${idStr}`;
        const description = `Premium ${cat.name} item from the VANTAGE collection. Crafted with high-quality materials and precision. This ${cat.name.toLowerCase()} piece is designed for the modern urban explorer who values both style and durability.`;
        
        // Randomize price slightly around base
        const priceVariation = Math.floor(Math.random() * 400) - 200;
        const price = cat.basePrice + priceVariation;
        const discountPrice = Math.random() > 0.8 ? Math.floor(price * 0.85) : null;
        
        const sizes = ["Accessories", "Fragrances", "Home Decor"].includes(cat.name)
          ? JSON.stringify(["One Size"])
          : JSON.stringify(["S", "M", "L", "XL", "XXL"]);
          
        const stock = Math.floor(Math.random() * 100) + 20;
        
        // Rotate through the pool of relevant images
        const imageIndex = (i - 1) % cat.images.length;
        const nextImageIndex = i % cat.images.length;
        
        const image = `${cat.images[imageIndex]}?w=800&q=80`;
        const image2 = `${cat.images[nextImageIndex]}?w=800&q=80`;
        
        insertProduct.run(name, description, price, discountPrice, cat.name, sizes, stock, image, image2);
      }
    });
  })();
  
  console.log("Massive seeding complete.");
}


// --- MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: "Admin access required" });
  next();
};

const logActivity = (action: string, details: string, adminId: number) => {
  try {
    db.prepare("INSERT INTO activity_logs (action, details, adminId) VALUES (?, ?, ?)")
      .run(action, details, adminId);
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = db.prepare("INSERT INTO users (name, email, password, role, provider) VALUES (?, ?, ?, ?, ?)")
      .run(name, email, hashedPassword, 'user', 'email');
    res.status(201).json({ message: "User created", id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !user.password) return res.status(400).json({ error: "Invalid credentials" });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post("/api/auth/mock-login", (req, res) => {
  const { name, email, provider } = req.body;
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  
  if (!user) {
    const info = db.prepare("INSERT INTO users (name, email, role, provider) VALUES (?, ?, ?, ?)")
      .run(name, email, 'user', provider);
    user = { id: info.lastInsertRowid, name, email, role: 'user', provider };
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post("/api/auth/admin-login", (req, res) => {
  const { secretCode } = req.body;
  if (secretCode === "ADMIN123") {
    let admin = db.prepare("SELECT * FROM users WHERE role = 'admin'").get() as any;
    if (!admin) {
      const info = db.prepare("INSERT INTO users (name, email, role, provider) VALUES (?, ?, ?, ?)")
        .run("Admin User", "admin@vantage.com", "admin", "admin");
      admin = { id: info.lastInsertRowid, name: "Admin User", email: "admin@vantage.com", role: "admin" };
    }
    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET);
    res.json({ token, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } else {
    res.status(401).json({ error: "Invalid secret code" });
  }
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT id, name, email, phone, address, profiles, avatar, role, provider, createdAt FROM users WHERE id = ?").get(req.user.id) as any;
  if (user) {
    if (user.address) user.address = JSON.parse(user.address);
    if (user.profiles) user.profiles = JSON.parse(user.profiles);
  }
  res.json(user);
});

app.put("/api/auth/profile", authenticateToken, (req: any, res) => {
  const { name, email, phone, address, profiles, avatar } = req.body;
  try {
    db.prepare("UPDATE users SET name = ?, email = ?, phone = ?, address = ?, profiles = ?, avatar = ? WHERE id = ?")
      .run(
        name, 
        email, 
        phone, 
        address ? JSON.stringify(address) : null, 
        profiles ? JSON.stringify(profiles) : null,
        avatar || null,
        req.user.id
      );
    res.json({ message: "Profile updated successfully" });
  } catch (e) {
    res.status(400).json({ error: "Email already in use or invalid data" });
  }
});

// --- PRODUCT ROUTES ---
app.get("/api/products", (req, res) => {
  const products = db.prepare(`
    SELECT p.*, 
           (SELECT AVG(rating) FROM reviews WHERE productId = p.id) as averageRating,
           (SELECT COUNT(*) FROM reviews WHERE productId = p.id) as reviewCount
    FROM products p 
    ORDER BY p.createdAt DESC
  `).all();
  res.json(products.map((p: any) => ({ ...p, sizes: JSON.parse(p.sizes) })));
});

app.get("/api/products/:id", (req, res) => {
  const product = db.prepare(`
    SELECT p.*, 
           (SELECT AVG(rating) FROM reviews WHERE productId = p.id) as averageRating,
           (SELECT COUNT(*) FROM reviews WHERE productId = p.id) as reviewCount
    FROM products p 
    WHERE p.id = ?
  `).get(req.params.id) as any;
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ ...product, sizes: JSON.parse(product.sizes) });
});

app.post("/api/products", authenticateToken, isAdmin, (req: any, res) => {
  const { name, description, price, category, sizes, stock, image } = req.body;
  const info = db.prepare("INSERT INTO products (name, description, price, category, sizes, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(name, description, price, category, JSON.stringify(sizes), stock, image);
  
  logActivity("PRODUCT_CREATED", `Added new product: ${name}`, req.user.id);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put("/api/products/:id", authenticateToken, isAdmin, (req: any, res) => {
  const { name, description, price, category, sizes, stock, image } = req.body;
  db.prepare("UPDATE products SET name = ?, description = ?, price = ?, category = ?, sizes = ?, stock = ?, image = ? WHERE id = ?")
    .run(name, description, price, category, JSON.stringify(sizes), stock, image, req.params.id);
  
  logActivity("PRODUCT_UPDATED", `Updated product: ${name} (ID: ${req.params.id})`, req.user.id);
  res.json({ message: "Product updated" });
});

app.delete("/api/products/:id", authenticateToken, isAdmin, (req: any, res) => {
  const product = db.prepare("SELECT name FROM products WHERE id = ?").get(req.params.id) as any;
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  
  if (product) {
    logActivity("PRODUCT_DELETED", `Deleted product: ${product.name} (ID: ${req.params.id})`, req.user.id);
  }
  res.json({ message: "Product deleted" });
});

// --- ORDER ROUTES ---
app.post("/api/orders", authenticateToken, (req: any, res) => {
  const { products, totalAmount, paymentMethod, paymentId, paymentStatus, shippingAddress } = req.body;
  
  // Mock payment success logic (90% success)
  const isSuccess = Math.random() < 0.9;
  
  if (!isSuccess && paymentMethod !== 'COD') {
    return res.status(400).json({ error: "Payment failed. Please try again." });
  }

  const finalPaymentId = paymentId || `PAY${Date.now()}`;
  const finalPaymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Success';

  const info = db.prepare(`
    INSERT INTO orders (userId, products, totalAmount, paymentMethod, paymentId, paymentStatus, shippingAddress)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, JSON.stringify(products), totalAmount, paymentMethod, finalPaymentId, finalPaymentStatus, JSON.stringify(shippingAddress));

  // Update stock
  products.forEach((item: any) => {
    db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(item.quantity, item.productId);
  });

  res.status(201).json({ id: info.lastInsertRowid, paymentId: finalPaymentId });
});

app.get("/api/orders/my-orders", authenticateToken, (req: any, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").all(req.user.id);
  res.json(orders.map((o: any) => ({ ...o, products: JSON.parse(o.products), shippingAddress: JSON.parse(o.shippingAddress) })));
});

// --- ADMIN ROUTES ---
app.get("/api/admin/stats", authenticateToken, isAdmin, (req, res) => {
  const totalRevenue = db.prepare("SELECT SUM(totalAmount) as total FROM orders WHERE paymentStatus = 'Success' OR paymentMethod = 'COD'").get() as any;
  const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as any;
  const activeProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
  const lowStock = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock < 10").get() as any;
  
  const topProducts = db.prepare(`
    SELECT p.name, p.image, COUNT(o.id) as sales
    FROM products p
    JOIN (
      SELECT json_each.value->>'$.productId' as pid, orders.id 
      FROM orders, json_each(orders.products)
    ) o ON p.id = o.pid
    GROUP BY p.id
    ORDER BY sales DESC
    LIMIT 5
  `).all();

  const recentActivity = db.prepare("SELECT * FROM activity_logs ORDER BY createdAt DESC LIMIT 10").all();

  res.json({
    revenue: totalRevenue.total || 0,
    orders: totalOrders.count,
    users: totalUsers.count,
    activeProducts: activeProducts.count,
    lowStock: lowStock.count,
    topProducts,
    recentActivity
  });
});

app.get("/api/admin/settings", authenticateToken, isAdmin, (req, res) => {
  const settings = db.prepare("SELECT * FROM settings").all();
  const settingsObj = settings.reduce((acc: any, s: any) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
  res.json(settingsObj);
});

app.post("/api/admin/settings", authenticateToken, isAdmin, (req: any, res) => {
  const updates = req.body;
  const updateStmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  Object.entries(updates).forEach(([key, value]) => {
    updateStmt.run(key, String(value));
  });
  
  logActivity("SETTINGS_UPDATED", `Updated system settings: ${Object.keys(updates).join(", ")}`, req.user.id);
  res.json({ message: "Settings updated" });
});

app.get("/api/admin/revenue-chart", authenticateToken, isAdmin, (req, res) => {
  const data = db.prepare(`
    SELECT date(createdAt) as date, SUM(totalAmount) as amount 
    FROM orders 
    WHERE paymentStatus = 'Success' OR paymentMethod = 'COD'
    GROUP BY date(createdAt)
    ORDER BY date ASC
    LIMIT 30
  `).all();
  res.json(data);
});

app.get("/api/admin/users", authenticateToken, isAdmin, (req, res) => {
  const users = db.prepare("SELECT id, name, email, role, provider, createdAt FROM users ORDER BY createdAt DESC").all();
  res.json(users);
});

app.delete("/api/admin/users/:id", authenticateToken, isAdmin, (req: any, res) => {
  const user = db.prepare("SELECT name FROM users WHERE id = ?").get(req.params.id) as any;
  db.prepare("DELETE FROM users WHERE id = ? AND role != 'admin'").run(req.params.id);
  
  if (user) {
    logActivity("USER_DELETED", `Deleted user: ${user.name} (ID: ${req.params.id})`, req.user.id);
  }
  res.json({ message: "User deleted" });
});

app.patch("/api/admin/users/:id/role", authenticateToken, isAdmin, (req: any, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: "Invalid role" });
  
  db.prepare("UPDATE users SET role = ? WHERE id = ? AND id != ?").run(role, req.params.id, req.user.id);
  logActivity("USER_ROLE_UPDATED", `Changed user ID ${req.params.id} role to ${role}`, req.user.id);
  res.json({ message: "User role updated" });
});

app.get("/api/admin/orders", authenticateToken, isAdmin, (req, res) => {
  const orders = db.prepare(`
    SELECT orders.*, users.name as userName, users.email as userEmail 
    FROM orders 
    JOIN users ON orders.userId = users.id 
    ORDER BY orders.createdAt DESC
  `).all();
  res.json(orders.map((o: any) => ({ ...o, products: JSON.parse(o.products), shippingAddress: JSON.parse(o.shippingAddress) })));
});

app.patch("/api/admin/orders/:id", authenticateToken, isAdmin, (req: any, res) => {
  const { orderStatus, trackingNumber } = req.body;
  
  let finalStatus = orderStatus;
  // Automatically set status to 'Shipped' if tracking number is provided and no status is explicitly sent
  if (trackingNumber && trackingNumber.trim() !== '' && !orderStatus) {
    const currentOrder = db.prepare("SELECT orderStatus FROM orders WHERE id = ?").get(req.params.id) as any;
    if (currentOrder && currentOrder.orderStatus === 'Pending') {
      finalStatus = 'Shipped';
    }
  }

  if (finalStatus !== undefined && trackingNumber !== undefined) {
    db.prepare("UPDATE orders SET orderStatus = ?, trackingNumber = ? WHERE id = ?").run(finalStatus, trackingNumber, req.params.id);
  } else if (finalStatus !== undefined) {
    db.prepare("UPDATE orders SET orderStatus = ? WHERE id = ?").run(finalStatus, req.params.id);
  } else if (trackingNumber !== undefined) {
    db.prepare("UPDATE orders SET trackingNumber = ? WHERE id = ?").run(trackingNumber, req.params.id);
  }

  logActivity("ORDER_UPDATED", `Updated order #${req.params.id} status to ${finalStatus || 'unchanged'} and tracking to ${trackingNumber || 'unchanged'}`, req.user.id);
  res.json({ message: "Order updated", orderStatus: finalStatus });
});

app.post("/api/admin/orders/bulk-update", authenticateToken, isAdmin, (req: any, res) => {
  const { ids, status } = req.body;
  if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ error: "Invalid data" });
  
  const stmt = db.prepare("UPDATE orders SET orderStatus = ? WHERE id = ?");
  const transaction = db.transaction((orderIds) => {
    for (const id of orderIds) stmt.run(status, id);
  });
  
  transaction(ids);
  logActivity("ORDERS_BULK_UPDATED", `Updated ${ids.length} orders to status: ${status}`, req.user.id);
  res.json({ message: `Updated ${ids.length} orders` });
});

// Allow users to update tracking number for their own orders (as requested)
app.patch("/api/orders/:id/tracking", authenticateToken, (req: any, res) => {
  const { trackingNumber } = req.body;
  const order = db.prepare("SELECT * FROM orders WHERE id = ? AND userId = ?").get(req.params.id, req.user.id) as any;
  if (!order) return res.status(404).json({ error: "Order not found" });
  
  // Update tracking number and set status to 'Shipped' if it was Pending
  const newStatus = (order.orderStatus === 'Pending' && trackingNumber) ? 'Shipped' : order.orderStatus;
  
  db.prepare("UPDATE orders SET trackingNumber = ?, orderStatus = ? WHERE id = ?").run(trackingNumber, newStatus, req.params.id);
  res.json({ message: "Tracking number updated", orderStatus: newStatus });
});

// --- WISHLIST ROUTES ---
app.get("/api/wishlist", authenticateToken, (req: any, res) => {
  const wishlist = db.prepare(`
    SELECT p.* FROM products p
    JOIN wishlist w ON p.id = w.productId
    WHERE w.userId = ?
  `).all(req.user.id);
  res.json(wishlist.map((p: any) => ({ ...p, sizes: JSON.parse(p.sizes) })));
});

app.post("/api/wishlist/toggle", authenticateToken, (req: any, res) => {
  const { productId } = req.body;
  const existing = db.prepare("SELECT * FROM wishlist WHERE userId = ? AND productId = ?").get(req.user.id, productId);
  
  if (existing) {
    db.prepare("DELETE FROM wishlist WHERE userId = ? AND productId = ?").run(req.user.id, productId);
    res.json({ action: "removed" });
  } else {
    db.prepare("INSERT INTO wishlist (userId, productId) VALUES (?, ?)").run(req.user.id, productId);
    res.json({ action: "added" });
  }
});

// --- CART ROUTES ---
app.get("/api/cart", authenticateToken, (req: any, res) => {
  const cart = db.prepare(`
    SELECT c.id as cartId, c.size, c.quantity, p.* 
    FROM cart c
    JOIN products p ON c.productId = p.id
    WHERE c.userId = ?
  `).all(req.user.id);
  res.json(cart.map((item: any) => ({ ...item, sizes: JSON.parse(item.sizes) })));
});

app.post("/api/cart", authenticateToken, (req: any, res) => {
  const { productId, size, quantity } = req.body;
  const existing = db.prepare("SELECT * FROM cart WHERE userId = ? AND productId = ? AND size = ?").get(req.user.id, productId, size) as any;
  
  if (existing) {
    db.prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?").run(quantity || 1, existing.id);
  } else {
    db.prepare("INSERT INTO cart (userId, productId, size, quantity) VALUES (?, ?, ?, ?)").run(req.user.id, productId, size, quantity || 1);
  }
  res.json({ message: "Cart updated" });
});

app.delete("/api/cart/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM cart WHERE id = ? AND userId = ?").run(req.params.id, req.user.id);
  res.json({ message: "Item removed" });
});

// --- REVIEW ROUTES ---
app.get("/api/products/:id/reviews", (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.name as userName, u.avatar as userAvatar
    FROM reviews r
    JOIN users u ON r.userId = u.id
    WHERE r.productId = ?
    ORDER BY r.createdAt DESC
  `).all(req.params.id);
  res.json(reviews);
});

app.post("/api/products/:id/reviews", authenticateToken, (req: any, res) => {
  const { rating, comment } = req.body;
  db.prepare("INSERT INTO reviews (productId, userId, rating, comment) VALUES (?, ?, ?, ?)")
    .run(req.params.id, req.user.id, rating, comment);
  res.status(201).json({ message: "Review added" });
});

// --- VITE MIDDLEWARE ---
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
