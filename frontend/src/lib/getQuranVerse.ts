export interface QuranVerse {
  textEn: string;
  textAr: string;
  surahName: string;
  surahNo: number;
  ayahNo: number;
}

const FALLBACK_VERSE: QuranVerse = {
  textAr: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
  textEn: "Indeed, with hardship [will be] ease.",
  surahName: "Ash-Sharh",
  surahNo: 94,
  ayahNo: 6,
};

export async function getQuranVerse(): Promise<QuranVerse> {
  try {
    const res = await fetch(
      "https://api.alquran.cloud/v1/ayah/random/editions/quran-uthmani,en.sahih",
      { next: { revalidate: 3600 } }, // Cache di server selama 1 jam
    );
    if (!res.ok) return FALLBACK_VERSE;
    const json = await res.json();
    return {
      textAr: json.data[0].text,
      textEn: json.data[1].text,
      surahName: json.data[1].surah.englishName,
      surahNo: json.data[1].surah.number,
      ayahNo: json.data[1].numberInSurah,
    };
  } catch {
    return FALLBACK_VERSE;
  }
}
