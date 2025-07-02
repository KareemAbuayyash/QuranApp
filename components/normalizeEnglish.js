// Utility function to normalize English text for search
// Lowercase and remove hyphens
export default function normalizeEnglish(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // remove non-alphanumeric chars (spaces, dashes, etc)
} 