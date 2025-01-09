import Database from 'better-sqlite3';

const db = new Database('auth.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function createUser({ email, password, name }) {
  const stmt = db.prepare(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
  );
  return stmt.run(email, password, name);
}

export default db;
