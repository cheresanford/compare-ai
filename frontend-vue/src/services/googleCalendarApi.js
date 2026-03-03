import { apiBaseUrl, apiClient } from "./apiClient";

export const googleCalendarApi = {
  connectUrl: `${apiBaseUrl}/google-calendar/connect`,
  status: () => apiClient.get("/google-calendar/status"),
  disconnect: () => apiClient.post("/google-calendar/disconnect", {}),
  syncEvent: (eventId) => apiClient.post(`/google-calendar/sync/${eventId}`, {}),
};
