import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { CreateEventoPayload } from "../api/eventosApi";
import { useCreateEvento } from "../hooks/useCreateEvento";
export function EventosCreatePage() {
  const { createEvento, loading, error, success } = useCreateEvento();
  const [eventoPayload , setEventoPayload] = useState<CreateEventoPayload>({
    nome_evento: "",
    data_evento: null,
    local_evento: "",
  });

  useEffect(() => {
    if (success) {
      setEventoPayload({ nome_evento: "", data_evento: null, local_evento: "" });
    }
  }, [success]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createEvento({...eventoPayload
    });
  }


  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Criar Evento</Typography>

          {error && <Alert severity="error">Erro brutal: {error}</Alert>}
          {success && <Alert severity="success">Evento criado com sucesso!</Alert>}

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="Nome do Evento"
              value={eventoPayload.nome_evento}
              onChange={(e) =>
                setEventoPayload((prev) => ({ ...prev, nome_evento: e.target.value }))
              }
              disabled={loading}
              required
            />

            

            <TextField
              label="Local do Evento"
              value={eventoPayload.local_evento}
              onChange={(e) =>
                setEventoPayload((prev) => ({ ...prev, local_evento: e.target.value }))
              }
              disabled={loading}
              required
            />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker  
            value={eventoPayload.data_evento}
            onChange={(newValue) =>
              setEventoPayload((prev) => ({ ...prev, data_evento: newValue }))
            }
            format="DD/MM/YYYY"
            slotProps={{ textField: { required: true, disabled: loading } }}
            />
          </LocalizationProvider>


            <Button
              type="submit"
              variant="contained"
              disabled={loading || !eventoPayload.data_evento}
            >
              {loading ? "Salvando..." : "Criar"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

    </Container>
  );
}
