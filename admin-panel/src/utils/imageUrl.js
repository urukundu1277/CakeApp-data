const API_BASE_URL = (typeof window !== 'undefined' && window.__API_BASE_URL__) 
  || 'http://localhost:5000/api/v1';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath}`;
};

export default { getImageUrl };
