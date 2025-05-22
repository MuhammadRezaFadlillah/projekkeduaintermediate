import { openDB } from 'idb';

const DATABASE_NAME = 'storyApp';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';

// Inisialisasi IndexedDB. Ini akan dijalankan hanya sekali.
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    // Membuat object store jika belum ada saat upgrade database
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id', // Menentukan 'id' sebagai primary key
    });
  },
});

/**
 * Fungsi pembantu untuk mendapatkan object store dari transaksi IndexedDB.
 * @param {string} mode - Mode transaksi ('readonly' atau 'readwrite').
 * @returns {Promise<IDBObjectStore>} - Object store yang siap digunakan.
 */
async function getObjectStore(mode) {
  const db = await dbPromise;
  const tx = db.transaction(OBJECT_STORE_NAME, mode);
  return tx.objectStore(OBJECT_STORE_NAME);
}

const Database = {
  /**
   * Menyimpan atau memperbarui cerita ke IndexedDB.
   * @param {object} story - Objek cerita yang akan disimpan. Harus memiliki properti 'id'.
   * @returns {Promise<any>} - Hasil operasi put.
   * @throws {Error} Jika objek cerita tidak memiliki properti 'id'.
   */
  async putStory(story) {
    if (!story || typeof story.id === 'undefined') {
      throw new Error('`id` is required to save a story.');
    }
    const store = await getObjectStore('readwrite');
    return store.put(story);
  },

  /**
   * Mengambil cerita berdasarkan ID dari IndexedDB.
   * @param {string} id - ID cerita yang akan diambil.
   * @returns {Promise<object | undefined>} - Objek cerita atau undefined jika tidak ditemukan.
   * @throws {Error} Jika ID tidak diberikan.
   */
  async getStoryById(id) {
    if (!id) {
      throw new Error('`id` is required to get a story.');
    }
    const store = await getObjectStore('readonly');
    return store.get(id);
  },

  /**
   * Mengambil semua cerita yang tersimpan di IndexedDB.
   * @returns {Promise<Array<object>>} - Array berisi semua objek cerita.
   */
  async getAllStories() {
    const store = await getObjectStore('readonly');
    return store.getAll();
  },

  /**
   * Menghapus cerita berdasarkan ID dari IndexedDB.
   * @param {string} id - ID cerita yang akan dihapus.
   * @returns {Promise<void>} - Promise yang selesai setelah cerita dihapus.
   * @throws {Error} Jika ID tidak diberikan.
   */
  async removeStory(id) {
    if (!id) {
      throw new Error('`id` is required to remove a story.');
    }
    const store = await getObjectStore('readwrite');
    return store.delete(id);
  },
};

export default Database;
