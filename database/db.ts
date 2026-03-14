import { openDB, IDBPDatabase } from 'idb';

const DATABASE_NAME = 'soulpages_db';
const DATABASE_VERSION = 2;

export async function initDB() {
  return openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        // Create an index for username to allow login
        userStore.createIndex('username', 'username', { unique: true });
      }
      if (!db.objectStoreNames.contains('diary')) {
        db.createObjectStore('diary', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('memories')) {
        db.createObjectStore('memories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('mistakes')) {
        db.createObjectStore('mistakes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('secrets')) {
        db.createObjectStore('secrets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('achievements')) {
        db.createObjectStore('achievements', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('streaks')) {
        db.createObjectStore('streaks', { keyPath: 'id' });
      }
    },
  });
}

export const dbService = {
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await initDB();
    return db.getAll(storeName);
  },
  async getById<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await initDB();
    return db.get(storeName, id);
  },
  async add<T>(storeName: string, item: T) {
    const db = await initDB();
    return db.add(storeName, item);
  },
  async put<T>(storeName: string, item: T) {
    const db = await initDB();
    return db.put(storeName, item);
  },
  async delete(storeName: string, id: string) {
    const db = await initDB();
    return db.delete(storeName, id);
  },
  async getByUsername(username: string) {
    const db = await initDB();
    return db.getFromIndex('users', 'username', username);
  }
};
