import { createContext, useContext, useMemo } from "react";
import { EventsApi } from "../services/eventsApi";

const EventsApiContext = createContext(null);

export function EventsApiProvider({ children }) {
  const service = useMemo(() => new EventsApi(), []);

  return (
    <EventsApiContext.Provider value={service}>
      {children}
    </EventsApiContext.Provider>
  );
}

export function useEventsApi() {
  const service = useContext(EventsApiContext);

  if (!service) {
    throw new Error("useEventsApi deve ser usado dentro do EventsApiProvider");
  }

  return service;
}

