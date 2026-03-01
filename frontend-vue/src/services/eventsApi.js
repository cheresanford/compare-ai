import { apiClient } from "./apiClient";

function toQueryString(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const eventsApi = {
  list: ({ page, size, q, sortBy, sortDir, categoryIdFilter } = {}) =>
    apiClient.get(
      `/events${toQueryString({ page, size, q, sortBy, sortDir, categoryIdFilter })}`,
    ),
  get: (id) => apiClient.get(`/events/${id}`),
  create: (dto) => apiClient.post("/events", dto),
  update: (id, dto) => apiClient.patch(`/events/${id}`, dto),
  remove: (id) => apiClient.delete(`/events/${id}`),
};
