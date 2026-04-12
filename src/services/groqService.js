let currentKeyIndex = 0;

export const groqService = {
  async extractTafsirInfo(arabicTafsirText, ayahArabicText, apiKeysString, surahName, ayahNumber) {
    if (!apiKeysString) throw new Error('API Key belum diatur. Silakan atur di menu Pengaturan.');

    const keys = apiKeysString.split(',').map(k => k.trim()).filter(k => k);
    if (keys.length === 0) throw new Error('API Key tidak valid.');

  const truncatedTafsir = arabicTafsirText.length > 3500 
      ? arabicTafsirText.substring(0, 3500) + "... [Teks dipotong agar AI lebih cepat]"
      : arabicTafsirText;

    const prompt = `
Anda adalah ahli Tafsir Al-Qur'an dan pakar Bahasa Indonesia. 
Tugas Anda adalah mengekstrak informasi berharga dari potongan Kitab Tafsir At-Tahrir wat-Tanwir karya Ibnu 'Asyur (Bahasa Arab) untuk ayat tertentu.

AYAT: "${ayahArabicText}" (${surahName} ayat ${ayahNumber})
TEKS TAFSIR ARAB (Potongan): 
"${truncatedTafsir}"

EKSTRAK INFORMASI BERIKUT DALAM BAHASA INDONESIA:
1. terjemahan: Terjemahan ayat yang puitis dan akurat dalam Bahasa Indonesia.
2. asbabunNuzul: Latar belakang turunnya ayat jika disebutkan. Jika tidak ada, berikan penjelasan konteks historis singkat. (Maks 1-2 paragraf)
3. balaghah: Minimal 2 poin tentang keindahan sastra (Balaghah) yang dijelaskan Ibnu 'Asyur. Berikan judul poin dan deskripsinya.
4. maqashid: Minimal 2 poin tentang tujuan syari'at atau pesan filosofis utama ayat ini. Berikan judul poin dan deskripsinya.
5. ustadzPoin: Minimal 4 butir poin (bullets) sebagai bahan khutbah atau ceramah yang relevan dengan kehidupan modern.
6. kuis: 2 pertanyaan pilihan ganda (4 pilihan) beserta pembahasan dan indeks jawaban yang benar (0-3).

FORMAT OUTPUT HARUS JSON VALID:
{
  "surah": "${surahName}",
  "ayat": ${ayahNumber},
  "arabic": "${ayahArabicText}",
  "terjemahan": "...",
  "asbabunNuzul": "...",
  "balaghah": [ { "title": "...", "desc": "..." } ],
  "maqashid": [ { "title": "...", "desc": "..." } ],
  "ustadzPoin": [ "...", "...", "...", "..." ],
  "kuis": [ { "pertanyaan": "...", "pilihan": ["...", "...", "...", "..."], "jawabanBenar": 0, "pembahasan": "..." } ],
  "tags": ["#Tag1", "#Tag2"]
}
`;

    let attempts = 0;
    let lastErrorMessage = '';

    while (attempts < keys.length) {
      const activeKey = keys[currentKeyIndex];
      console.log(`Mencoba Groq API dengan kunci ke-${currentKeyIndex + 1}/${keys.length}`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: 'Anda adalah asisten ahli Tafsir yang selalu memberikan output dalam format JSON valid.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          const msg = err.error?.message || `HTTP Error ${response.status}`;
          throw new Error(msg);
        }

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);

      } catch (error) {
        console.warn(`Kunci ke-${currentKeyIndex + 1} gagal (${attempts + 1}/${keys.length}):`, error.message);
        lastErrorMessage = error.message;
        
        // Rotasi ke kunci berikutnya untuk percobaan selanjutnya
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        attempts++;
        
        // Berikan jeda sangat singkat sebelum mencoba kunci berikutnya
        if (attempts < keys.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    throw new Error(`Semua ${keys.length} API Key telah dicoba dan gagal. Error terakhir: ${lastErrorMessage}`);
  }
};
