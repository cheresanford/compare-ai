const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function extractErrorMessage(payload, status) {
  const message = payload?.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (Array.isArray(message) && message.length) {
    return message.filter(Boolean).join("\n");
  }

  if (payload?.error && typeof payload.error === "string") {
    return payload.error;
  }

  return `Erro ${status}`;
}

async function request(path, options) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const json = await response.json().catch(() => ({}));
  const payload = json?.data ?? json;

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, response.status),
      response.status,
      payload,
    );
  }

  return payload;
}

export function connectGoogle() {
  window.location.href = `${apiUrl}/auth/google`;
}

export async function getGoogleStatus() {
  return request("/auth/google/status");
}

export async function disconnectGoogle() {
  return request("/auth/google/logout", { method: "POST" });
}
