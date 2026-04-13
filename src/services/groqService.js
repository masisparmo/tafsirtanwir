let currentKeyIndex = 0;

export const groqService = {
  async extractTafsirInfo(arabicTafsirText, ayahArabicText, apiKeysString, surahName, ayahNumber, onProgress) {
    if (!apiKeysString) throw new Error('API Key belum diatur. Silakan atur di menu Pengaturan.');

    const keys = apiKeysString.split(',').map(k => k.trim()).filter(k => k);
    if (keys.length === 0) throw new Error('API Key tidak valid.');

  const truncatedTafsir = arabicTafsirText.length > 2500
      ? arabicTafsirText.substring(0, 2500) + "... [Teks dipotong agar AI lebih cepat]"
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
      const attemptMsg = `Mencoba Groq API dengan kunci ke-${currentKeyIndex + 1}/${keys.length}`;
      console.log(attemptMsg);
      if (onProgress) onProgress(attemptMsg);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
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
        let content = data.choices[0].message.content;

        // Membersihkan format markdown jika ada (```json ... ```)
        if (content.startsWith('```json')) {
          content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (content.startsWith('```')) {
          content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        return JSON.parse(content);

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
  },

  async extractDetailTafsirInfo(arabicTafsirText, ayahArabicText, apiKeysString, surahName, ayahNumber, onProgress) {
    if (!apiKeysString) throw new Error('API Key belum diatur. Silakan atur di menu Pengaturan.');

    const keys = apiKeysString.split(',').map(k => k.trim()).filter(k => k);
    if (keys.length === 0) throw new Error('API Key tidak valid.');

    // Memaksimalkan konteks, batas diperbesar atau tidak dipotong tergantung ukuran, kita batasi agak besar
    const truncatedTafsir = arabicTafsirText.length > 8000
      ? arabicTafsirText.substring(0, 8000) + "... [Teks dipotong agar tidak melebihi batas token]"
      : arabicTafsirText;

    const prompt = `
Anda adalah ahli Tafsir Al-Qur'an, ahli tata bahasa Arab, ahli sastra Arab, dan pakar bahasa Arab yang sangat mahir dan mendalam.
Tugas Anda adalah membaca potongan Kitab Tafsir At-Tahrir wat-Tanwir karya Ibnu 'Asyur (Bahasa Arab) untuk ayat tertentu dan memberikan penjelasan yang SANGAT DETAIL, PANJANG, dan KOMPREHENSIF.
Tujuan penjelasan ini adalah untuk menguraikan kemukjizatan, keajaiban, pemilihan kata, tata bahasa, dan sastra pada ayat tersebut sehingga pembaca semakin beriman kepada Al-Qur'an.

AYAT: "${ayahArabicText}" (${surahName} ayat ${ayahNumber})
TEKS TAFSIR ARAB (Potongan Kitab At-Tahrir wat-Tanwir):
"${truncatedTafsir}"

BERIKAN PENJELASAN MENDALAM DALAM BAHASA INDONESIA:
Tuliskan uraian yang komprehensif, terstruktur, dan mendalam seperti output dari sistem analisis canggih, yang mencakup analisis bahasa, pemilihan kata, struktur kalimat, makna teologis, dan keajaiban sastra (balaghah) yang diulas oleh Ibnu 'Asyur.

INSTRUKSI SANGAT PENTING (HARUS DIIKUTI):
1. Anda WAJIB MENGACU SEPENUHNYA pada TEKS TAFSIR ARAB At-Tahrir wat-Tanwir yang dilampirkan di atas.
2. JANGAN membuat analisis, tafsir, atau penjelasan umum yang tidak ada dasarnya di teks tersebut.
3. Sebutkan secara eksplisit temuan-temuan Ibnu 'Asyur dari teks tersebut (contoh: "Berdasarkan teks di atas, Ibnu 'Asyur menjelaskan...").
4. Gunakan paragraf yang panjang, poin-poin yang terperinci, dan penjelasan logika kebahasaan yang tajam yang diuraikan langsung oleh Ibnu 'Asyur di teks bahasa Arab tersebut. Jangan ragu untuk membuat teks yang panjang dan kaya makna, tetapi pastikan sumber pemikirannya HANYA dari potongan kitab tersebut.

FORMAT OUTPUT HARUS JSON VALID DENGAN SATU KEY UTAMA "penjelasanDetail" yang berisi string format Markdown dari uraian Anda:
{
  "penjelasanDetail": "Tuliskan uraian lengkap dan mendalam Anda di sini dalam format Markdown..."
}
`;

    let attempts = 0;
    let lastErrorMessage = '';

    while (attempts < keys.length) {
      const activeKey = keys[currentKeyIndex];
      const attemptMsg = `Mencoba Groq API untuk Penjelasan Detail dengan kunci ke-${currentKeyIndex + 1}/${keys.length}`;
      console.log(attemptMsg);
      if (onProgress) onProgress(attemptMsg);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // Waktu lebih lama untuk detail

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'Anda adalah asisten ahli Tafsir dan Sastra Arab yang selalu memberikan output penjelasan mendalam dalam format JSON valid.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
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
        let content = data.choices[0].message.content;

        if (content.startsWith('```json')) {
          content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (content.startsWith('```')) {
          content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        return JSON.parse(content);

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
