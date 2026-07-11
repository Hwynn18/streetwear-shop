import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// ============================================================
// 테스트용 자체 데이터 저장소
// - MySQL(lib/db.js, database/schema.sql)은 그대로 남겨두고,
//   지금은 이 파일이 실제 데이터 소스로 사용됩니다.
// - 운영 전환 시 이 파일의 함수 시그니처만 유지한 채
//   내부 구현을 MySQL 쿼리로 교체하면 됩니다.
// ============================================================

const DATA_DIR = path.join(process.cwd(), 'lib', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

function defaultData() {
  const now = new Date().toISOString();
  return {
    categories: [
      { id: 1, slug: 'tops', name: '상의' },
      { id: 2, slug: 'bottoms', name: '하의' },
      { id: 3, slug: 'hats', name: '모자' },
      { id: 4, slug: 'outer', name: '겉옷' },
      { id: 5, slug: 'socks', name: '양말' },
    ],
    users: [],
    products: [
      {
        id: 1,
        category_id: 1,
        name: '오버사이즈 그래픽 롱슬리브',
        price: 39000,
        image_url: 'https://picsum.photos/seed/tee1/600/800',
        description: '헤비 코튼 소재의 오버사이즈 롱슬리브 티셔츠.',
        stock: 25,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        category_id: 2,
        name: '와이드 카고 반바지',
        price: 45000,
        image_url: 'https://picsum.photos/seed/shorts1/600/800',
        description: '넉넉한 핏의 카키 카고 반바지.',
        stock: 18,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 3,
        category_id: 4,
        name: '윈드브레이커 후드 자켓',
        price: 68000,
        image_url: 'https://picsum.photos/seed/jacket1/600/800',
        description: '가벼운 발수 소재의 후드 윈드브레이커.',
        stock: 12,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 4,
        category_id: 3,
        name: '로우캡 볼캡',
        price: 22000,
        image_url: 'https://picsum.photos/seed/cap1/600/800',
        description: '차분한 톤의 데일리 볼캡.',
        stock: 40,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 5,
        category_id: 5,
        name: '헤비 크루 삭스 2족 세트',
        price: 12000,
        image_url: 'https://picsum.photos/seed/socks1/600/800',
        description: '두툼한 파일 원단의 크루 삭스.',
        stock: 60,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
    ],
    reviews: [],
    orders: [],
    cartItems: [],
    faqs: [
      { id: 1, question: '배송은 얼마나 걸리나요?', answer: '결제 완료 후 평균 2~3일 이내 출고됩니다.', sort_order: 1 },
      { id: 2, question: '교환/환불은 어떻게 하나요?', answer: '마이페이지 > 주문내역에서 신청 가능하며, 상품 수령 후 7일 이내 가능합니다.', sort_order: 2 },
      { id: 3, question: '사이즈는 어떻게 확인하나요?', answer: '각 상품 상세페이지 하단 사이즈 가이드를 참고해주세요.', sort_order: 3 },
    ],
    _seq: { users: 0, products: 5, reviews: 0, orders: 0, cartItems: 0 },
  };
}

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[STORE LOAD ERROR]', err.message);
  }
  return defaultData();
}

function persist() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    // 테스트 환경(서버리스 등) 파일쓰기 실패 시에도 메모리 데이터로는 계속 동작하도록 함
    console.error('[STORE PERSIST ERROR]', err.message);
  }
}

// Next.js 개발 서버 핫리로드 대비 전역 캐싱 (mysql pool과 동일 패턴)
let db = global.__store;
if (!db) {
  db = load();

  // 최초 관리자 계정 시드
  if (!db.users.some((u) => u.role === 'admin')) {
    db._seq.users += 1;
    db.users.push({
      id: db._seq.users,
      username: 'admin',
      password_hash: bcrypt.hashSync('admin', 10),
      name: '관리자',
      phone: '010-0000-0000',
      email: 'admin@example.com',
      role: 'admin',
      created_at: new Date().toISOString(),
    });
  }

  global.__store = db;
  persist();
}

function nextId(collection) {
  db._seq[collection] += 1;
  return db._seq[collection];
}

// ---------------- Users ----------------
export function findUserByUsername(username) {
  return db.users.find((u) => u.username === username) || null;
}

export function findUserByUsernameOrEmail(username, email) {
  return db.users.find((u) => u.username === username || u.email === email) || null;
}

export function findUserById(id) {
  return db.users.find((u) => u.id === Number(id)) || null;
}

export function createUser({ username, password_hash, name, phone, email }) {
  const user = {
    id: nextId('users'),
    username,
    password_hash,
    name,
    phone,
    email,
    role: 'user',
    created_at: new Date().toISOString(),
  };
  db.users.push(user);
  persist();
  return user;
}

export function updateUserProfile(id, { name, phone }) {
  const user = findUserById(id);
  if (!user) return null;
  user.name = name;
  user.phone = phone;
  persist();
  return user;
}

// ---------------- Categories ----------------
export function listCategories() {
  return db.categories;
}

export function findCategoryBySlug(slug) {
  return db.categories.find((c) => c.slug === slug) || null;
}

export function findCategoryById(id) {
  return db.categories.find((c) => c.id === Number(id)) || null;
}

// ---------------- Products ----------------
function withCategory(product) {
  const category = findCategoryById(product.category_id);
  return { ...product, category: category?.slug, category_name: category?.name };
}

export function listProducts({ categorySlug, includeInactive = false } = {}) {
  let items = db.products;
  if (!includeInactive) items = items.filter((p) => p.is_active === 1);
  if (categorySlug) {
    const category = findCategoryBySlug(categorySlug);
    items = category ? items.filter((p) => p.category_id === category.id) : [];
  }
  return items
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(withCategory);
}

export function getProductById(id) {
  const product = db.products.find((p) => p.id === Number(id));
  return product ? withCategory(product) : null;
}

export function createProduct(data) {
  const now = new Date().toISOString();
  const product = {
    id: nextId('products'),
    category_id: data.category_id,
    name: data.name,
    price: data.price,
    image_url: data.image_url,
    description: data.description || '',
    stock: data.stock ?? 0,
    is_active: data.is_active === false ? 0 : 1,
    created_at: now,
    updated_at: now,
  };
  db.products.push(product);
  persist();
  return product;
}

export function updateProduct(id, data) {
  const product = db.products.find((p) => p.id === Number(id));
  if (!product) return null;
  Object.assign(product, {
    category_id: data.category_id,
    name: data.name,
    price: data.price,
    image_url: data.image_url,
    description: data.description || '',
    stock: data.stock ?? 0,
    is_active: data.is_active === false ? 0 : 1,
    updated_at: new Date().toISOString(),
  });
  persist();
  return product;
}

export function deleteProduct(id) {
  const idx = db.products.findIndex((p) => p.id === Number(id));
  if (idx === -1) return false;
  db.products.splice(idx, 1);
  persist();
  return true;
}

export function decrementStock(id, quantity) {
  const product = db.products.find((p) => p.id === Number(id));
  if (!product) return null;
  product.stock = Math.max(0, product.stock - quantity);
  persist();
  return product;
}

// ---------------- Reviews ----------------
export function listReviews({ productId } = {}) {
  let items = db.reviews;
  if (productId) items = items.filter((r) => r.product_id === Number(productId));
  return items
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((r) => {
      const user = findUserById(r.user_id);
      const product = db.products.find((p) => p.id === r.product_id);
      return { ...r, user_name: user?.name || '탈퇴한 회원', product_name: product?.name || '삭제된 상품' };
    });
}

export function createReview({ user_id, product_id, rating, content }) {
  const review = {
    id: nextId('reviews'),
    user_id,
    product_id,
    rating,
    content,
    created_at: new Date().toISOString(),
  };
  db.reviews.push(review);
  persist();
  return review;
}

// ---------------- FAQ ----------------
export function listFaqs() {
  return db.faqs.slice().sort((a, b) => a.sort_order - b.sort_order);
}

// ---------------- Cart ----------------
function withProductInfo(item) {
  const product = db.products.find((p) => p.id === item.product_id);
  return {
    ...item,
    product_name: product?.name || '삭제된 상품',
    image_url: product?.image_url || '',
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    is_active: product?.is_active ?? 0,
  };
}

export function getCartByUser(userId) {
  return db.cartItems
    .filter((c) => c.user_id === Number(userId))
    .map(withProductInfo)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function addToCart(userId, productId, quantity) {
  const existing = db.cartItems.find((c) => c.user_id === Number(userId) && c.product_id === Number(productId));
  if (existing) {
    existing.quantity += quantity;
  } else {
    db.cartItems.push({
      id: nextId('cartItems'),
      user_id: Number(userId),
      product_id: Number(productId),
      quantity,
      created_at: new Date().toISOString(),
    });
  }
  persist();
  return getCartByUser(userId);
}

export function updateCartItemQuantity(userId, itemId, quantity) {
  const item = db.cartItems.find((c) => c.id === Number(itemId) && c.user_id === Number(userId));
  if (!item) return null;
  item.quantity = quantity;
  persist();
  return item;
}

export function removeCartItem(userId, itemId) {
  const idx = db.cartItems.findIndex((c) => c.id === Number(itemId) && c.user_id === Number(userId));
  if (idx === -1) return false;
  db.cartItems.splice(idx, 1);
  persist();
  return true;
}

export function clearCart(userId) {
  db.cartItems = db.cartItems.filter((c) => c.user_id !== Number(userId));
  persist();
}

// ---------------- Orders ----------------
export function listOrdersByUser(userId) {
  return db.orders
    .filter((o) => o.user_id === Number(userId))
    .map((o) => {
      const product = db.products.find((p) => p.id === o.product_id);
      return { ...o, product_name: product?.name || '삭제된 상품', image_url: product?.image_url || '' };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function createOrdersFromCart(userId) {
  const items = getCartByUser(userId);
  if (items.length === 0) return [];

  const created = items.map((item) => {
    const order = {
      id: nextId('orders'),
      user_id: Number(userId),
      product_id: item.product_id,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      status: '결제완료',
      created_at: new Date().toISOString(),
    };
    db.orders.push(order);
    decrementStock(item.product_id, item.quantity);
    return order;
  });

  clearCart(userId);
  persist();
  return created;
}
