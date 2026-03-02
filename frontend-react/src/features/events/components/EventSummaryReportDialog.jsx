import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { getEventsSummaryReport } from "../api/eventsApi";

function todayDateOnly() {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function EventSummaryReportDialog({ open, onClose }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!open) return;

    const today = todayDateOnly();
    setStartDate((current) => current || today);
    setEndDate((current) => current || today);
    setError("");
    setReport(null);
  }, [open]);

  const isValidRange = useMemo(() => {
    if (!startDate || !endDate) return false;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
    return end.getTime() >= start.getTime();
  }, [startDate, endDate]);

  async function handleConsult() {
    setError("");
    setReport(null);

    if (!isValidRange) {
      setError("Informe um período válido.");
      return;
    }

    setLoading(true);
    try {
      const result = await getEventsSummaryReport({ startDate, endDate });
      setReport(result);
    } catch (err) {
      setError(err?.message || "Erro ao consultar relatório.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Relatório resumido de eventos</DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Data inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
            fullWidth
          />

          <TextField
            label="Data final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
            fullWidth
          />

          <Box sx={{ display: "flex", alignItems: "end" }}>
            <Button
              variant="contained"
              onClick={handleConsult}
              disabled={loading || !startDate || !endDate}
              sx={{ minWidth: 140 }}
            >
              {loading ? "Consultando..." : "Consultar"}
            </Button>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Período selecionado: {startDate || "-"} até {endDate || "-"}
        </Typography>

        {report ? (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Total de eventos no período: {report.totalEvents ?? 0}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Totais por status
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(report.totalsByStatus || []).map((row) => (
                    <TableRow key={String(row.id)}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Totais por categoria
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(report.totalsByCategory || []).map((row) => (
                    <TableRow key={row.id === null ? "uncategorized" : String(row.id)}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
