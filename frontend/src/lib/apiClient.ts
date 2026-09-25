// client HTTP minimal — toate cererile includ cookie-uri (credentials: 'include'),
// necesar pentru sesiunea setată de backend la login
const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let message = `Eroare ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // răspunsul nu era JSON, păstrăm mesajul generic
    }
    throw new Error(message);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res;
}

export const api = {
  register: (username: string, password: string) =>
    request('/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  login: (username: string, password: string) =>
    request('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  logout: () => request('/logout', { method: 'POST' }),

  me: () => request('/me'),

  listFiles: () => request('/files'),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/files`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error(`Eroare ${res.status}`);
    return res.json();
  },

  downloadFileUrl: (id: number) => `${BASE_URL}/api/files/${id}`,

  deleteFile: (id: number) => request(`/files/${id}`, { method: 'DELETE' }),
};
