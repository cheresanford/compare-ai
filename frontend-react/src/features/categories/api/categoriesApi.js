const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
    throw new Error(payload?.message || `Erro ${response.status}`);
  }

  return payload;
}

export async function listCategories() {
  return request("/categories");
}

export async function createCategory(name) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateCategory(categoryId, name) {
  return request(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteCategory(categoryId) {
  return request(`/categories/${categoryId}`, {
    method: "DELETE",
  });
}
