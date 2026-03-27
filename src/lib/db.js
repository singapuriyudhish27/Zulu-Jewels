import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

let connection;

export async function getConnection() {
  if (connection) return connection;

  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
    });

    console.log('✅ MySQL connected successfully');

    // Users Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100) NOT NULL,
      lastName VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      dob DATE,
      is_active BOOLEAN DEFAULT TRUE,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Categories Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        image_url VARCHAR(255),
        available_materials JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Products Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        category_id BIGINT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL,
        material VARCHAR(255),
        gender VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      ) ENGINE=InnoDB;
    `);

    // Product Variants Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT NOT NULL,
        material VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(12,2),
        stock INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // Products Images/Videos Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT NOT NULL,
        variant_id BIGINT, 
        media_url VARCHAR(255) NOT NULL,
        media_type ENUM('image', 'video') DEFAULT 'image',
        is_primary BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // Migration logic for existing tables
    try {
      const [columns] = await connection.execute("SHOW COLUMNS FROM product_images");
      const hasImageUrl = columns.some(c => c.Field === 'image_url');
      const hasMediaType = columns.some(c => c.Field === 'media_type');
      const hasVariantId = columns.some(c => c.Field === 'variant_id');

      if (hasImageUrl) {
        await connection.execute("ALTER TABLE product_images CHANGE image_url media_url VARCHAR(255) NOT NULL");
        console.log("✅ Migrated product_images.image_url to media_url");
      }
      if (!hasMediaType) {
        await connection.execute("ALTER TABLE product_images ADD COLUMN media_type ENUM('image', 'video') DEFAULT 'image' AFTER media_url");
        console.log("✅ Added product_images.media_type column");
      }
      if (!hasVariantId) {
        await connection.execute("ALTER TABLE product_images ADD COLUMN variant_id BIGINT AFTER product_id");
        console.log("✅ Added product_images.variant_id column");
      }
      
      // Categories migration
      const [cCols] = await connection.execute("SHOW COLUMNS FROM categories");
      if (!cCols.some(c => c.Field === 'image_url')) {
        await connection.execute("ALTER TABLE categories ADD COLUMN image_url VARCHAR(255) AFTER name");
        console.log("✅ Added categories.image_url column");
      }
      if (cCols.find(c => c.Field === 'available_materials')?.Null === 'NO') {
        await connection.execute("ALTER TABLE categories MODIFY available_materials JSON NULL");
        console.log("✅ Modified categories.available_materials to allow NULL");
      }

      // Products migration
      const [pCols] = await connection.execute("SHOW COLUMNS FROM products");
      if (!pCols.some(c => c.Field === 'material')) {
        await connection.execute("ALTER TABLE products ADD COLUMN material VARCHAR(255) AFTER price");
      }
      if (!pCols.some(c => c.Field === 'gender')) {
        await connection.execute("ALTER TABLE products ADD COLUMN gender VARCHAR(100) AFTER material");
      }
      
    } catch (migrateError) {
      console.warn("⚠️ Migration warning:", migrateError.message);
    }

    // Customers Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED,
        customer_name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB;
    `);

    // Orders Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        customer_id BIGINT,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(100),
        shipping_address TEXT,
        is_paid BOOLEAN DEFAULT FALSE,
        receipt_url VARCHAR(255),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      ) ENGINE=InnoDB;
    `);

    // Order Items
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      ) ENGINE=InnoDB;
    `);

    // Inquiries Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED,
        inquiry_category VARCHAR(150),
        message TEXT,
        status VARCHAR(50) DEFAULT 'Unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB;
    `);

    // Reviews & Rating Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED,
        order_id BIGINT,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        review_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      ) ENGINE=InnoDB;
    `);

    // Marketing Tables
    // Coupons Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        coupon_code VARCHAR(100) UNIQUE NOT NULL,
        discount DECIMAL(10,2) NOT NULL,
        discount_type ENUM('%', '$') NOT NULL,
        min_order_amount DECIMAL(12,2),
        max_discount DECIMAL(12,2),
        valid_until DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Banners Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(150),
        status BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Content Pages Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS content_pages (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(255),
        url VARCHAR(255),
        content TEXT,
        social_links JSON,
        status BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Shipping Zones Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shipping_zones (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        zone_name VARCHAR(150),
        areas TEXT,
        location VARCHAR(255),
        shipping_rate DECIMAL(12,2),
        delivery_time VARCHAR(100),
        partner_id BIGINT,
        status BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Shipping Partner Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shipping_partners (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        partner_name VARCHAR(255),
        type VARCHAR(100),
        tracking_url VARCHAR(255),
        status BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Payment Options Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_options (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(150),
        bank_details JSON,
        option_details JSON,
        status BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Transactions Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT,
        customer_id BIGINT,
        amount DECIMAL(12,2),
        payment_method VARCHAR(100),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      ) ENGINE=InnoDB;
    `);

    // Wishlist Products Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_likes (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        product_id BIGINT NOT NULL,
        is_custom BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      ) ENGINE=InnoDB;
    `);

    // Cart Items Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        product_id BIGINT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_cart_item (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      ) ENGINE=InnoDB;
    `);

    console.log('✅ Tables ensured');

    return connection;
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
    throw error;
  }
}
