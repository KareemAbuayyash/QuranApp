import surahMeta from './surah.json';

// الناتج: { "01": [ {surah:"001", start:"verse_1", end:"verse_7"}, ... ], ... "30": [...] }
const juzMap = surahMeta.reduce((acc, s) => {
  (s.juz || []).forEach((j) => {
    const juzIndex = j.index; // "01".."30"
    if (!acc[juzIndex]) acc[juzIndex] = [];
    acc[juzIndex].push({
      surah: s.index,            // "001".."114"
      start: j.verse.start,      // "verse_1"
      end: j.verse.end           // "verse_141"
    });
  });
  return acc;
}, {});

export default juzMap;
