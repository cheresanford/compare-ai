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
  list: ({ page, size, q, sortBy, sortDir, categoryId } = {}) =>
    apiClient.get(
      `/events${toQueryString({ page, size, q, sortBy, sortDir, categoryId })}`,
    ),
  report: ({ startDate, endDate }) =>
    apiClient.get(`/events/report${toQueryString({ startDate, endDate })}`),
  get: (id) => apiClient.get(`/events/${id}`),
  create: (dto) => apiClient.post("/events", dto),
  update: (id, dto) => apiClient.patch(`/events/${id}`, dto),
  remove: (id) => apiClient.delete(`/events/${id}`),
};
