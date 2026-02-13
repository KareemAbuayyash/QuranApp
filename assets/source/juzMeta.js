import juzMap from './juzMap';

const juzNameAr = (i) => `الجزء ${i}`;
const juzNameEn = (i) => `Juz' ${i}`;

const pad2 = (n) => String(n).padStart(2, '0');

const juzMeta = Array.from({ length: 30 }, (_, idx) => {
  const i = idx + 1;
  const key = pad2(i);
  const ranges = juzMap[key] || [];

  const first = ranges[0];
  const last = ranges[ranges.length - 1];

  return {
    index: key,                 // "01".."30"
    titleAr: juzNameAr(i),      // "الجزء 1" ...
    titleEn: juzNameEn(i),      // "Juz' 1" ...
    start: first
      ? { surah: first.surah, verse: first.start }
      : null,
    end: last
      ? { surah: last.surah, verse: last.end }
      : null,
    rangesCount: ranges.length  // كم قطعة ضمن هذا الجزء (مفيد للـ UI)
  };
});

export default juzMeta;
