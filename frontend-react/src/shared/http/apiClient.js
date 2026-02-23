const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.message || body?.data?.message || "Erro inesperado";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return body?.data ?? body;
}

export async function apiRequest(path, init) {
  const traceId = globalThis.crypto?.randomUUID?.();
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(traceId ? { "x-trace-id": traceId } : {}),
      ...(init?.headers || {}),
    },
  });

  return parseResponse(response);
}

