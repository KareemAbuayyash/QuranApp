// components/normalizeArabic.js
// Utility to normalize Arabic text for search and comparison
export default function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[أإآ]/g, 'ا')  // Normalize alef variations
    .replace(/ة/g, 'ه')      // Normalize taa marbouta to haa
    .replace(/[ى]/g, 'ي')    // Normalize alif maqsura to yaa
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove harakat/diacritics
    .replace(/ء/g, '')       // Remove hamza
    .replace(/\s+/g, ' ')    // Normalize spaces (keep single spaces)
    .trim()                  // Remove leading/trailing spaces
    .toLowerCase();          // Convert to lowercase for case-insensitive search
} 