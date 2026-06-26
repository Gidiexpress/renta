export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/api/images/')) return url;
  if (url.startsWith('/uploads/')) return `/api/images/${url.replace(/^\//, '')}`;
  return url;
}

export function normalizePropertyImages(property) {
  if (!property?.images) return property;
  return {
    ...property,
    images: property.images.map((image) => ({
      ...image,
      url: normalizeImageUrl(image.url),
    })),
  };
}
