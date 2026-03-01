const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.data?.message || response.statusText;
    if (Array.isArray(message)) {
      throw new Error(message.join(', '));
    }
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

export function listEvents(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });
  const queryString = query.toString();
  return apiRequest(`/events${queryString ? `?${queryString}` : ''}`);
}

export function getEvent(id) {
  return apiRequest(`/events/${id}`);
}

export function createEvent(payload) {
  return apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateEvent(id, payload) {
  return apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteEvent(id) {
  return apiRequest(`/events/${id}`, {
    method: 'DELETE',
  });
}
