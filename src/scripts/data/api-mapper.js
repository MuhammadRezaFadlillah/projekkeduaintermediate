import Map from '../utils/map';

export async function storyMapper(story) {
  const lat = story.lat ?? null;
  const lon = story.lon ?? null;

  // Menggunakan ternary operator untuk menentukan placeName
  const placeName = (lat !== null && lon !== null)
    ? await Map.getPlaceNameByCoordinate(lat, lon)
    : 'Lokasi tidak ada';

  return {
    ...story,
    location: {
      latitude: lat,
      longitude: lon,
      placeName: placeName,
    },
  };
}
