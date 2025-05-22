import CONFIG from '../../config';
import { getAccessToken } from '../utils/auth';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  GET_STORIES: `${CONFIG.BASE_URL}/stories`, // Nama yang lebih deskriptif
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

/**
 * Fungsi pembantu untuk melakukan permintaan API.
 * Menangani parsing JSON dan pengecekan respons 'ok'.
 * @param {string} url - URL endpoint.
 * @param {object} options - Opsi untuk fetch (method, headers, body).
 * @returns {Promise<object>} - Objek hasil respons dengan properti 'ok'.
 */
async function request(url, options = {}) {
  const fetchResponse = await fetch(url, options);
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

/**
 * Fungsi pembantu untuk membuat header otentikasi.
 * @returns {object} - Objek header Authorization.
 */
function getAuthHeaders() {
  const accessToken = getAccessToken();
  return { Authorization: `Bearer ${accessToken}` };
}

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });
  return request(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });
  return request(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
}

export async function getAllStories() {
  return request(ENDPOINTS.GET_STORIES, {
    headers: getAuthHeaders(),
  });
}

export async function getStoryById(id) {
  return request(ENDPOINTS.DETAIL_STORY(id), {
    method: 'GET', // Method GET adalah default, tapi bisa ditulis untuk eksplisit
    headers: getAuthHeaders(),
  });
}

export async function addStory({ description, image, latitude, longitude }) {
  const formData = new FormData();
  formData.append('photo', image);
  formData.set('description', description);
  // Pastikan `latitude` dan `longitude` ditambahkan hanya jika ada
  if (latitude !== undefined && latitude !== null) {
    formData.set('lat', latitude);
  }
  if (longitude !== undefined && longitude !== null) {
    formData.set('lon', longitude);
  }

  return request(ENDPOINTS.ADD_STORY, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });
  return request(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Gabungkan header otentikasi
    },
    body: data,
  });
}

export async function unsubscribePushNotification({ endpoint }) {
  const data = JSON.stringify({ endpoint });
  return request(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE', // Pastikan menggunakan method DELETE
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // Gabungkan header otentikasi
    },
    body: data,
  });
}
