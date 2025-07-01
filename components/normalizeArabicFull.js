// components/normalizeArabicFull.js
// Enhanced Arabic text normalization for advanced search
export default function normalizeArabicFull(text) {
  if (!text) return '';
  let normalized = text;
  // Remove all Arabic diacritics and marks
  normalized = normalized.replace(/[\u064B-\u065F]/g, ''); // Standard diacritics
  normalized = normalized.replace(/[\u0670]/g, ''); // Superscript Alef
  normalized = normalized.replace(/[\u06D6-\u06ED]/g, ''); // Quranic marks
  normalized = normalized.replace(/[\u06DC-\u06E4]/g, ''); // Additional marks
  normalized = normalized.replace(/[\u06E7-\u06E8]/g, ''); // More marks
  normalized = normalized.replace(/[\u06EA-\u06ED]/g, ''); // Extended marks
  normalized = normalized.replace(/[\u08F0-\u08FF]/g, ''); // Extended Arabic marks
  // Normalize letter forms
  const letterMappings = {
    'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
    'ى': 'ي', 'ئ': 'ي',
    'ة': 'ه',
    'ؤ': 'و',
    'ء': '', // Remove standalone hamza for better matching
    'ـ': ''  // Remove Tatweel (kashida)
  };
  for (const [original, replacement] of Object.entries(letterMappings)) {
    normalized = normalized.replace(new RegExp(original, 'g'), replacement);
  }
  // Clean up and normalize
  return normalized
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase();
} 