import { db, initDB } from './database';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../utils/security';

export function seed() {
  initDB();

  // Clear existing data: remove all collabs and brands
  db.prepare('DELETE FROM collabs').run();
  db.prepare('DELETE FROM brands').run();
  db.prepare('DELETE FROM users').run();

  // 1. Create Demo Creators with scrypt secure hashing (Aarav, Priya, and Agency Admin)
  const defaultPassword = 'password123';
  const passwordHash = hashPassword(defaultPassword);
  const now = new Date().toISOString();

  const userAaravId = uuidv4();
  const userPriyaId = uuidv4();
  const userAdminId = uuidv4();

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, handle, platform, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    userAaravId,
    'Aarav Sharma',
    'aarav@tech.com',
    passwordHash,
    '@aaravtech',
    'youtube',
    'https://api.dicebear.com/7.x/initials/svg?seed=Aarav%20Sharma&backgroundColor=b6e3f4,c0aede,d1d4f9',
    now
  );

  insertUser.run(
    userPriyaId,
    'Priya Mehta',
    'priya@lifestyle.com',
    passwordHash,
    '@priyastyle',
    'instagram',
    'https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Mehta&backgroundColor=ffd5dc,ffdfba,d1d4f9',
    now
  );

  insertUser.run(
    userAdminId,
    'Agency Admin',
    'admin@collabflow.app',
    passwordHash,
    '@admin',
    'both',
    'https://api.dicebear.com/7.x/initials/svg?seed=Agency%20Admin&backgroundColor=0f766e,115e59',
    now
  );
  try {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(userAdminId);
  } catch {}

  console.log('✓ Demo accounts ready:');
  console.log('   1. Aarav Sharma (Tech/YouTube): aarav@tech.com / password123');
  console.log('   2. Priya Mehta (Beauty/Instagram): priya@lifestyle.com / password123');
  console.log('   3. Agency Admin: admin@collabflow.app / password123');
  console.log('✓ Cleared all seeder data: collabs (0 deals) and brands (0 brands).');
}

export function autoSeedIfEmpty() {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (!userCount || userCount.count === 0) {
      console.log('🌱 Database has 0 users. Initializing demo accounts (Aarav & Priya)...');
      seed();
    }
  } catch (err) {
    console.warn('Auto-seed check error:', err);
  }
}

if (require.main === module) {
  seed();
}
