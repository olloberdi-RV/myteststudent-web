/**
 * IndexedDB Storage Layer for MyTestStudent Web
 * Provides robust, offline persistent storage for tests and test attempt history.
 */

const DB_NAME = 'MyTestStudentDB';
const DB_VERSION = 1;

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      // Fallback for non-browser / test environments
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('tests')) {
        const testStore = db.createObjectStore('tests', { keyPath: 'id' });
        testStore.createIndex('title', 'meta.title', { unique: false });
        testStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        historyStore.createIndex('testId', 'testId', { unique: false });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Saves or updates a test in IndexedDB.
 * @param {Object} test
 * @returns {Promise<string>} test id
 */
export async function saveTest(test) {
  const db = await getDB();
  const testId = test.id || `test_${Date.now()}`;
  const record = {
    ...test,
    id: testId,
    updatedAt: new Date().toISOString()
  };

  if (!db) {
    try {
      localStorage.setItem(`mytest_test_${testId}`, JSON.stringify(record));
    } catch (e) {}
    return testId;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tests'], 'readwrite');
    const store = tx.objectStore('tests');
    const req = store.put(record);
    req.onsuccess = () => resolve(testId);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves all saved tests.
 * @returns {Promise<Array<Object>>}
 */
export async function getAllTests() {
  const db = await getDB();
  if (!db) {
    const list = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mytest_test_')) {
          list.push(JSON.parse(localStorage.getItem(key)));
        }
      }
    } catch (e) {}
    return list;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tests'], 'readonly');
    const store = tx.objectStore('tests');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Deletes a test from IndexedDB.
 * @param {string} testId
 * @returns {Promise<boolean>}
 */
export async function deleteTest(testId) {
  const db = await getDB();
  if (!db) {
    try {
      localStorage.removeItem(`mytest_test_${testId}`);
      return true;
    } catch (e) {
      return false;
    }
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tests'], 'readwrite');
    const store = tx.objectStore('tests');
    const req = store.delete(testId);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Saves a completed test session to history.
 * @param {Object} historyRecord
 * @returns {Promise<number>}
 */
export async function saveAttemptHistory(historyRecord) {
  const db = await getDB();
  const record = {
    ...historyRecord,
    timestamp: new Date().toISOString()
  };

  if (!db) return Date.now();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['history'], 'readwrite');
    const store = tx.objectStore('history');
    const req = store.add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
