const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function toQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return qs.toString();
}

async function request(path, init) {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const body = await res.json().catch(() => ({}));
  const payload = body?.data ?? body;

  if (!res.ok) {
    const message =
      body?.message ||
      body?.error?.message ||
      body?.error ||
      "Não foi possível concluir a operação";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return payload;
}

export async function listCategories(params) {
  const query = toQuery(params);

  return request(`/categories${query ? `?${query}` : ""}`);
}

export async function getCategory(id) {
  return request(`/categories/${id}`);
}

export async function createCategory(payload) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(id, payload) {
  return request(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id) {
  return request(`/categories/${id}`, {
    method: "DELETE",
  });
}
