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

function toIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function listEvents(params) {
  const query = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.categoryId) {
    query.set("categoryId", String(params.categoryId));
  }

  return request(`/events?${query.toString()}`);
}

export async function listRelatorio(params) {
  const query = new URLSearchParams({
    startDate: Date(params.startDate),
    endDate: Date(params.endDate),
  });

  if (params.startDate?.trim()) {
    query.set("startDate", params.startDate?.trim());
  }

  if (params.endDate) {
    query.set("endDate", params.endDate?.trim());
  }

  return request(`/events/relatorio?${query.toString()}`);
}

export async function listCategoryOptions() {
  return request("/events/options/categories");
}

export async function listStatusOptions() {
  return request("/events/options/statuses");
}

export async function getEventDetails(eventId) {
  return request(`/events/${eventId}`);
}

export async function createEvent(input) {
  const payload = {
    title: input.title,
    startDate: toIsoOrNull(input.startDate),
    endDate: toIsoOrNull(input.endDate),
    location: input.location,
    organizerName: input.organizerName,
    organizerEmail: input.organizerEmail,
    statusId: Number(input.statusId),
    categoryId: input.categoryId ? Number(input.categoryId) : undefined,
  };

  return request("/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEvent(eventId, input) {
  const payload = {
    title: input.title,
    startDate: toIsoOrNull(input.startDate),
    endDate: toIsoOrNull(input.endDate),
    location: input.location,
    organizerName: input.organizerName,
    organizerEmail: input.organizerEmail,
    statusId: Number(input.statusId),
    categoryId: input.categoryId ? Number(input.categoryId) : null,
  };

  return request(`/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEvent(eventId) {
  return request(`/events/${eventId}?confirm=true`, {
    method: "DELETE",
  });
}
