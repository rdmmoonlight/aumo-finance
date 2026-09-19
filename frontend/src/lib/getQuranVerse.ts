export interface QuranVerse {
  textEn: string;
  surahName: string;
  surahNo: number;
  ayahNo: number;
}

const FALLBACK_VERSE: QuranVerse = {
  textEn: "Indeed, with hardship [will be] ease.",
  surahName: "Ash-Sharh",
  surahNo: 94,
  ayahNo: 6,
};

export async function getQuranVerse(): Promise<QuranVerse> {
  try {
    const res = await fetch(
      "https://api.alquran.cloud/v1/ayah/random/editions/quran-uthmani,en.sahih",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return FALLBACK_VERSE;
    const json = await res.json();
    return {
      textEn: json.data[1].text,
      surahName: json.data[1].surah.englishName,
      surahNo: json.data[1].surah.number,
      ayahNo: json.data[1].numberInSurah,
    };
  } catch {
    return FALLBACK_VERSE;
  }
}
