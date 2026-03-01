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

export const categoriesApi = {
  listAll: () => apiClient.get(`/categories`),
  get: (id) => apiClient.get(`/categories/${id}`),
  create: (dto) => apiClient.post("/categories", dto),
  update: (id, dto) => apiClient.patch(`/categories/${id}`, dto),
  remove: (id) => apiClient.delete(`/categories/${id}`),
};
