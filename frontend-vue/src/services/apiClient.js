const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const url = `${apiBaseUrl}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = payload?.message || payload?.error || res.statusText;
    const error = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  // A API usa ResponseInterceptor: { data, meta }
  return payload?.data ?? payload;
}

export const apiClient = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
