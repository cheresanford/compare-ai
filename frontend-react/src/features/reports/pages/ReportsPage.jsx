import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { getEventsSummary } from "../api/reportsApi";

function toDateInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function formatRangeLabel(startDate, endDate) {
  if (!startDate || !endDate) return "-";
  return `${startDate} a ${endDate}`;
}

export function ReportsPage() {
  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(
    toDateInput(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)),
  );
  const [endDate, setEndDate] = useState(toDateInput(today));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await getEventsSummary({ startDate, endDate });
      setSummary(result);
    } catch (requestError) {
      setError(requestError.message || "Erro ao gerar relatorio.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner - Relatorio
          </Typography>
          <Button
            component={RouterLink}
            to="/events"
            variant="outlined"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Eventos
          </Button>
          <Button
            component={RouterLink}
            to="/categories"
            variant="outlined"
            color="inherit"
          >
            Categorias
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Periodo do relatorio
            </Typography>
            <Stack
              component="form"
              onSubmit={handleSubmit}
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
            >
              <TextField
                label="Data inicial"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="Data final"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
              >
                {loading ? "Gerando..." : "Gerar relatorio"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {summary ? (
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  Periodo selecionado
                </Typography>
                <Typography variant="h6">
                  {formatRangeLabel(startDate, endDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de eventos: {summary.total}
                </Typography>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              {summary.totalsByStatus?.map((status) => (
                <Grid item xs={12} md={6} key={status.id ?? status.name}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {status.name}
                      </Typography>
                      <Typography variant="h4">{status.total}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
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
                    {summary.totalsByCategory?.length ? (
                      summary.totalsByCategory.map((category) => (
                        <TableRow key={category.id ?? category.name}>
                          <TableCell>{category.name}</TableCell>
                          <TableCell align="right">
                            {category.total}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma categoria no periodo.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Stack>
        ) : null}
      </Container>
    </Box>
  );
}
