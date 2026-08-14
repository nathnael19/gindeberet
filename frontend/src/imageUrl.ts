const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

export function getImageUrl(imagePath: string) {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  }
  if (imagePath.startsWith('http')) {
    try {
      const parsedUrl = new URL(imagePath);
      if (parsedUrl.pathname.startsWith('/uploads/')) {
        return `${BACKEND_BASE_URL}${parsedUrl.pathname}`;
      }
    } catch {
      return imagePath;
    }
    return imagePath;
  }
  // Frontend public assets (awards, promo, static images)
  if (imagePath.startsWith('/images/') || imagePath.startsWith('/promo/') || imagePath.startsWith('/logo')) {
    return imagePath;
  }
  return `${BACKEND_BASE_URL}${imagePath}`;
}
