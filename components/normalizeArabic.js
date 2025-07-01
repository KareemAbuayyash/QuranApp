// components/normalizeArabic.js
// Utility to normalize Arabic text for search and comparison
export default function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove harakat/diacritics
    .replace(/ء/g, '') // Optionally remove hamza
    .replace(/-/g, '') // Remove dashes
    .replace(/\s+/g, ''); // Remove extra spaces
} 