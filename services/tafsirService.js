// خدمة التفسير باستخدام Al-Quran Cloud API
const BASE_URL = 'https://api.alquran.cloud/v1';

// التفاسير المتاحة بالعربية
export const TAFSIR_OPTIONS = {
  muyassar: {
    id: 'ar.muyassar',
    name: 'التفسير الميسر',
    description: 'تفسير ميسر من مجمع الملك فهد'
  },
  jalalayn: {
    id: 'ar.jalalayn',
    name: 'تفسير الجلالين',
    description: 'تفسير الجلالين للمحلي والسيوطي'
  }
};

/**
 * جلب تفسير آية معينة
 * @param {number} surahNumber - رقم السورة (1-114)
 * @param {number} ayahNumber - رقم الآية في السورة
 * @param {string} tafsirId - معرف التفسير (مثل 'ar.muyassar')
 * @returns {Promise<Object>} - كائن يحتوي على التفسير
 */
export async function getAyahTafsir(surahNumber, ayahNumber, tafsirId = 'ar.muyassar') {
  try {
    // لا تحاول جلب تفسير البسملة (verse_0)
    if (ayahNumber === 0) {
      return {
        success: false,
        error: 'البسملة ليس لها تفسير منفصل'
      };
    }
    
    const url = `${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${tafsirId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200 || data.status !== 'OK') {
      throw new Error(data.data || 'فشل في جلب التفسير');
    }
    
    return {
      success: true,
      ayahNumber: data.data.number,
      ayahText: data.data.text,
      tafsirText: data.data.text,
      surahName: data.data.surah?.name || '',
      surahNameArabic: data.data.surah?.name || '',
      edition: data.data.edition?.name || tafsirId
    };
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    return {
      success: false,
      error: error.message || 'حدث خطأ أثناء جلب التفسير'
    };
  }
}

/**
 * جلب تفسير سورة كاملة
 * @param {number} surahNumber - رقم السورة (1-114)
 * @param {string} tafsirId - معرف التفسير
 * @returns {Promise<Object>} - كائن يحتوي على جميع تفاسير آيات السورة
 */
export async function getSurahTafsir(surahNumber, tafsirId = 'ar.muyassar') {
  try {
    const url = `${BASE_URL}/surah/${surahNumber}/${tafsirId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200 || data.status !== 'OK') {
      throw new Error(data.data || 'فشل في جلب التفسير');
    }
    
    return {
      success: true,
      surahNumber: data.data.number,
      surahName: data.data.name,
      surahNameArabic: data.data.name,
      ayahs: data.data.ayahs.map(ayah => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        tafsir: ayah.text
      })),
      edition: data.data.edition?.name || tafsirId
    };
  } catch (error) {
    console.error('Error fetching surah tafsir:', error);
    return {
      success: false,
      error: error.message || 'حدث خطأ أثناء جلب التفسير'
    };
  }
}

/**
 * جلب قائمة بجميع التفاسير المتاحة
 * @returns {Promise<Array>} - قائمة التفاسير
 */
export async function getAvailableTafsirs() {
  try {
    const url = `${BASE_URL}/edition/type/tafsir`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200 || data.status !== 'OK') {
      throw new Error('فشل في جلب قائمة التفاسير');
    }
    
    // فلترة التفاسير العربية فقط
    const arabicTafsirs = data.data.filter(edition => 
      edition.language === 'ar' && edition.type === 'tafsir'
    );
    
    return {
      success: true,
      tafsirs: arabicTafsirs
    };
  } catch (error) {
    console.error('Error fetching available tafsirs:', error);
    return {
      success: false,
      error: error.message || 'حدث خطأ أثناء جلب قائمة التفاسير',
      tafsirs: []
    };
  }
}
