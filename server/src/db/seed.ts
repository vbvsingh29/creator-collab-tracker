import { db, initDB } from './database';

export function seed() {
  initDB();

  // Clear all data: 100% clean production slate
  db.prepare('DELETE FROM collabs').run();
  db.prepare('DELETE FROM brands').run();
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM password_resets').run();

  console.log('✓ Production database ready: 0 users, 0 collabs, 0 brands.');
}

export function autoSeedIfEmpty() {
  // Pure production: zero automatic fake data insertion
  return;
}

if (require.main === module) {
  seed();
}
