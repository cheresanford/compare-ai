import { apiClient } from "./apiClient";

export const categoriesApi = {
  list: () => apiClient.get("/categories"),
  create: (dto) => apiClient.post("/categories", dto),
  update: (id, dto) => apiClient.patch(`/categories/${id}`, dto),
  remove: (id) => apiClient.delete(`/categories/${id}`),
};
