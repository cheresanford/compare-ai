import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { deleteEvent, getEventDetails } from "../api/eventsApi";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function DetailLine({ label, value }) {
  return (
    <Stack direction="row" spacing={1}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

export function EventDetailsDialog({
  open,
  eventId,
  onClose,
  onEdit,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eventData, setEventData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || !eventId) return;

    let isActive = true;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const details = await getEventDetails(eventId);
        if (isActive) {
          setEventData(details);
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
    const confirmed = window.confirm("Deseja realmente excluir este evento?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteEvent(eventId);
      onDeleted();
    } catch (deleteError) {
      setError(deleteError.message || "Erro ao excluir evento.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalhes do evento</DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Typography variant="body2">Carregando...</Typography>
        ) : eventData ? (
          <Stack spacing={1.2}>
            <Typography variant="h6">{eventData.title}</Typography>

            <Box>
              <Chip
                label={eventData.status?.name || "-"}
                color="primary"
                size="small"
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <DetailLine
              label="Início"
              value={formatDate(eventData.startDate)}
            />
            <DetailLine label="Término" value={formatDate(eventData.endDate)} />
            <DetailLine
              label="Criado em"
              value={formatDate(eventData.createdAt)}
            />
            <DetailLine label="Local" value={eventData.location || "-"} />
            <DetailLine
              label="Organizador"
              value={`${eventData.organizer?.name || "-"} (${eventData.organizer?.email || "-"})`}
            />
            <DetailLine
              label="Categoria"
              value={eventData.category?.name || "Sem categoria"}
            />
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={() => onEdit(eventId)} disabled={loading || deleting}>
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
