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

function toStartOfDayIso(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toEndOfDayIso(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 23, 59, 59, 999);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function getEventsSummary({ startDate, endDate }) {
  const startIso = toStartOfDayIso(startDate);
  const endIso = toEndOfDayIso(endDate);

  const query = new URLSearchParams({
    startDate: startIso ?? "",
    endDate: endIso ?? "",
  });

  return request(`/events/reports/summary?${query.toString()}`);
}
