import { useEffect, useState } from "react";
import { Alert, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import { useEventsApi } from "../providers/EventsApiProvider";

export function EventFormPage() {
  const api = useEventsApi();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [options, setOptions] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const optionsPromise = api.options();
        const eventPromise = isEdit ? api.findById(id) : Promise.resolve(null);
        const [optionsResponse, eventResponse] = await Promise.all([
          optionsPromise,
          eventPromise,
        ]);

        setOptions(optionsResponse);
        setEvent(eventResponse);
      } catch (err) {
        setError(err.message || "Falha ao carregar formulário");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [api, id, isEdit]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError("");

    try {
      if (isEdit) {
        await api.update(id, payload);
      } else {
        await api.create(payload);
      }

      navigate("/events");
    } catch (err) {
      setError(err.message || "Falha ao salvar evento");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">{isEdit ? "Editar evento" : "Novo evento"}</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <EventForm
          initialValue={event}
          options={options}
          submitting={submitting}
          submitError={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/events")}
        />
      </Paper>
    </Stack>
  );
}

