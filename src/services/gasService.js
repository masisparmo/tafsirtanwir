export const gasService = {
  async searchInCloud(gasUrl, surah, ayah) {
    if (!gasUrl) return null;
    
    try {
      const url = `${gasUrl}?surah=${surah}&ayah=${ayah}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      
      const result = await response.json();
      return result.found ? result.data : null;
    } catch (error) {
      console.warn('Cloud Search unavailable (CORS or Network):', error.message);
      return null;
    }
  },

  async saveToCloud(gasUrl, surah, ayah, data) {
    if (!gasUrl) return;
    
    try {
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          surah_num: surah,
          ayah_num: ayah,
          data: data
        })
      });
      console.log('Data saved to Cloud (GAS)');
    } catch (error) {
      console.error('GAS Save Error:', error);
    }
  }
};
