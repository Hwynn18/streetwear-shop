-- ============================================
-- Streetwear Shop DB Schema (MySQL 8.0+)
-- ============================================

CREATE DATABASE IF NOT EXISTS streetwear_shop
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE streetwear_shop;

-- 사용자
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(30)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(30)  NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 카테고리 (상의, 하의, 모자, 겉옷, 양말)
CREATE TABLE IF NOT EXISTS categories (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug  VARCHAR(30) NOT NULL UNIQUE,
  name  VARCHAR(30) NOT NULL
) ENGINE=InnoDB;

INSERT INTO categories (slug, name) VALUES
  ('tops', '상의'),
  ('bottoms', '하의'),
  ('hats', '모자'),
  ('outer', '겉옷'),
  ('socks', '양말')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 상품 (관리자가 CRUD)
CREATE TABLE IF NOT EXISTS products (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(100) NOT NULL,
  price        INT UNSIGNED NOT NULL,
  image_url    VARCHAR(500) NOT NULL,
  description  TEXT,
  stock        INT UNSIGNED NOT NULL DEFAULT 0,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_products_category (category_id),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB;

-- 리뷰
CREATE TABLE IF NOT EXISTS reviews (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,
  rating      TINYINT UNSIGNED NOT NULL,
  content     VARCHAR(1000) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_reviews_product (product_id)
) ENGINE=InnoDB;

-- 주문 (마이페이지 주문내역용 최소 구조)
CREATE TABLE IF NOT EXISTS orders (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  product_id   BIGINT UNSIGNED NOT NULL,
  quantity     INT UNSIGNED NOT NULL DEFAULT 1,
  total_price  INT UNSIGNED NOT NULL,
  status       ENUM('결제완료','배송중','배송완료','취소') NOT NULL DEFAULT '결제완료',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_orders_user (user_id)
) ENGINE=InnoDB;

-- FAQ
CREATE TABLE IF NOT EXISTS faqs (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question   VARCHAR(300) NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO faqs (question, answer, sort_order) VALUES
  ('배송은 얼마나 걸리나요?', '결제 완료 후 평균 2~3일 이내 출고됩니다.', 1),
  ('교환/환불은 어떻게 하나요?', '마이페이지 > 주문내역에서 신청 가능하며, 상품 수령 후 7일 이내 가능합니다.', 2),
  ('사이즈는 어떻게 확인하나요?', '각 상품 상세페이지 하단 사이즈 가이드를 참고해주세요.', 3);
