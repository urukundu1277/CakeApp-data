const API_BASE_URL = (typeof window !== 'undefined' && window.__API_BASE_URL__)
  || (import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000');

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${normalized}`;
};

export const handleImageError = (e) => {
  const target = e.target;
  if (target && !target.dataset.fallbackShown) {
    target.dataset.fallbackShown = 'true';
    target.style.display = 'none';
    const fallback = target.parentElement?.querySelector('.img-fallback');
    if (fallback) fallback.style.display = 'flex';
  }
};
