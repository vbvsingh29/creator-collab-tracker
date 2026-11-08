import { db, initDB } from './database';

export async function seed() {
  initDB();

  // Clear all data: 100% clean production slate
  await db.prepare('DELETE FROM collabs').run();
  await db.prepare('DELETE FROM brands').run();
  await db.prepare('DELETE FROM users').run();
  await db.prepare('DELETE FROM password_resets').run();

  console.log('✓ Production database ready: 0 users, 0 collabs, 0 brands.');
}

export function autoSeedIfEmpty() {
  // Pure production: zero automatic fake data insertion
  return;
}

if (require.main === module) {
  seed().catch(console.error);
}
