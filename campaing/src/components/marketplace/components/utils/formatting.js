/**
 * Format large numbers to compact version (e.g. 1.2K, 1M)
 * @param {number} num 
 * @returns {string}
 */
export const formatCompactNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  const n = Number(num);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
};

/**
 * Format date to 'time ago' string (Native implementation)
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatTimeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return past.toLocaleDateString();
};

/**
 * Format price to KES string: 1500 → "KES 1,500"
 */
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return "—";
  return `KES ${Number(amount).toLocaleString('en-KE')}`;
};

/**
 * Generate a URL-safe SEO slug from a string
 * "Campaign T-Shirt (Large) - Red!" → "campaign-t-shirt-large-red"
 */
export const generateSlug = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

