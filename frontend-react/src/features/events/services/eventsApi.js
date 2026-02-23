import { apiRequest } from "../../../shared/http/apiClient";

export class EventsApi {
  list(params) {
    const query = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    return apiRequest(`/events?${query.toString()}`);
  }

  options() {
    return apiRequest("/events/options");
  }

  findById(id) {
    return apiRequest(`/events/${id}`);
  }

  create(payload) {
    return apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  update(id, payload) {
    return apiRequest(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  remove(id) {
    return apiRequest(`/events/${id}`, {
      method: "DELETE",
    });
  }
}

