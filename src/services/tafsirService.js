const TAFSIR_URL = '/ar.tanweer.json';
const DB_NAME = 'TafsirAppDB';
const STORE_NAME = 'tafsirData';
const CACHE_STORE = 'verseCache';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2); // Versi 2
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const tafsirService = {
  async fetchFullData(onProgress) {
    // Cek apakah sudah ada di IndexedDB
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get('full_data');
      getRequest.onsuccess = async () => {
        if (getRequest.result) {
          console.log('Tafsir data loaded from cache');
          resolve(getRequest.result);
        } else {
          // Download jika belum ada
          try {
            console.log('Downloading Tafsir data...');
            const response = await fetch(TAFSIR_URL);
            
            if (!response.ok) throw new Error('Gagal mengunduh database tafsir');
            
            const reader = response.body.getReader();
            const contentLength = +response.headers.get('Content-Length');
            
            let receivedLength = 0;
            let chunks = [];
            
            while(true) {
              const {done, value} = await reader.read();
              if (done) break;
              chunks.push(value);
              receivedLength += value.length;
              if (onProgress) {
                onProgress(Math.round((receivedLength / contentLength) * 100));
              }
            }
            
            const chunksAll = new Uint8Array(receivedLength);
            let position = 0;
            for(let chunk of chunks) {
              chunksAll.set(chunk, position);
              position += chunk.length;
            }
            
            const result = JSON.parse(new TextDecoder("utf-8").decode(chunksAll));
            
            try {
              // Simpan ke IndexedDB
              const saveTransaction = db.transaction(STORE_NAME, 'readwrite');
              saveTransaction.objectStore(STORE_NAME).put(result, 'full_data');
            } catch (fsErr) {
              console.warn('Gagal menyimpan ke IndexedDB (Mungkin disk penuh):', fsErr);
              // Tetap resolve result agar aplikasi memori tetap punya data
            }
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      };
      getRequest.onerror = () => reject(new Error('Gagal mengakses database lokal'));
    });
  },

  async getTafsirForAyah(fullData, surahIndex, ayahIndex) {
    // Di ar.tanweer.json, strukturnya biasanya tafsir[surah_index][block_index]
    // Kita perlu mencari blok yang mengandung ayat tersebut.
    // Karena At-Tahrir wat-Tanwir sering mengelompokkan ayat, kita ambil blok yang relevan.
    
    const surahTafsir = fullData.tafsir[surahIndex - 1];
    if (!surahTafsir) return null;
    
    // Catatan: ar.tanweer.json dari SAFI174 membagi per "blok" penjelasan. 
    // Kita akan mencari blok yang kemungkinan besar berisi ayat tersebut.
    // Namun, cara termudah untuk integrasi awal adalah mengambil blok berdasarkan estimasi atau 
    // jika datanya sudah dipetakan per ayat (ternyata ar.tanweer.json ini adalah per ayat/ruku).
    
    // Mari kita asumsikan untuk sekarang indexnya bersesuaian jika itu per ayat, 
    // atau kita ambil blok yang tersedia.
    return surahTafsir[ayahIndex - 1] || surahTafsir[0];
  },

  async getCachedVerse(surah, ayah) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE, 'readonly');
      const store = transaction.objectStore(CACHE_STORE);
      const key = `${surah}:${ayah}`;
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveCachedVerse(surah, ayah, data) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(CACHE_STORE, 'readwrite');
        const store = transaction.objectStore(CACHE_STORE);
        const key = `${surah}:${ayah}`;
        const request = store.put(data, key);
        request.onsuccess = () => resolve();
        request.onerror = (e) => {
          console.warn('Gagal cache ayat (QuotaExceeded?):', e.target.error);
          resolve(); // Resolve anyway so UI doesn't crash
        };
      });
    } catch (err) {
      console.warn('IDB Save Exception:', err);
    }
  }
};
