import { apiRequest } from "../../../shared/http/apiClient";

export class CategoriesApi {
  list() {
    return apiRequest("/categories");
  }

  create(payload) {
    return apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  update(id, payload) {
    return apiRequest(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  remove(id) {
    return apiRequest(`/categories/${id}`, {
      method: "DELETE",
    });
  }
}
