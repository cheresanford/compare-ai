import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { deleteEvent, getEventDetails, syncEventToGoogle } from "../api/eventsApi";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

export function EventDetailsDialog({ open, eventId, onClose, onEdit, onDeleted }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    if (!open || !eventId) return;

    let isActive = true;
    async function loadDetails() {
      setLoading(true);
      setError("");
      setSyncMessage("");

      try {
        const result = await getEventDetails(eventId);
        if (isActive) {
          setDetails(result);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || "Erro ao carregar detalhes do evento.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      isActive = false;
    };
  }, [open, eventId]);

  async function handleDelete() {
    if (!eventId) return;

    const confirmed = window.confirm("Deseja realmente excluir este evento?");
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteEvent(eventId);
      onDeleted?.();
    } catch (deleteError) {
      setError(deleteError.message || "Erro ao excluir evento.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSync() {
    if (!eventId) return;

    setSyncing(true);
    setSyncMessage("");
    setError("");

    try {
      const result = await syncEventToGoogle(eventId);
      setSyncMessage("Evento sincronizado com sucesso.");
      if (result?.googleEventId) {
        setDetails((current) => ({
          ...current,
          googleEventId: result.googleEventId,
        }));
      }
    } catch (syncError) {
      setError(syncError.message || "Erro ao sincronizar evento.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Detalhes do evento</DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {syncMessage ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {syncMessage}
          </Alert>
        ) : null}

        {details ? (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Google Calendar
              </Typography>
              <Typography variant="body2">
                {details.googleEventId ? "Sincronizado" : "Nao sincronizado"}
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Titulo
              </Typography>
              <Typography>{details.title}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Inicio
              </Typography>
              <Typography>{formatDate(details.startDate)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Termino
              </Typography>
              <Typography>{formatDate(details.endDate)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Local
              </Typography>
              <Typography>{details.location || "-"}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Typography>{details.status?.name || "-"}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Categoria
              </Typography>
              <Typography>{details.category?.name || "Sem categoria"}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Organizador
              </Typography>
              <Typography>
                {details.organizer?.name || "-"} ({details.organizer?.email || "-"})
              </Typography>
            </Stack>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          onClick={handleSync}
          disabled={loading || deleting || syncing}
        >
          {syncing ? "Sincronizando..." : "Sincronizar no Calendar"}
        </Button>
        <Button
          onClick={() => onEdit?.(eventId)}
          disabled={!details || deleting}
        >
          Editar
        </Button>
        <Button
          color="error"
          onClick={handleDelete}
          disabled={loading || deleting}
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
