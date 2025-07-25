"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Fade,
  Slide,
  Paper,
  MenuItem,
} from "@mui/material";
import {
  Event as EventIcon,
  ArrowForward as ArrowRight,
  CalendarToday,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale";

// Tema personalizado
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#800020", // Granada/Vino para fondo y botones
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#7A4069", // Morado medio para acentos
    },
    background: {
      default: "#FFFFFF", // Fondo blanco puro
      paper: "#F5E8C7", // Beige claro para el formulario
    },
    text: {
      primary: "#333333", // Gris oscuro para texto principal
      secondary: "#666666", // Gris medio para texto secundario
    },
    error: {
      main: "#D32F2F", // Rojo oscuro para errores
    },
  },
  typography: {
    fontFamily: "'Arial', 'Helvetica', sans-serif", // Fuente sencilla y profesional
    h1: {
      fontWeight: 700,
      fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
      letterSpacing: "0",
    },
    body1: {
      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
      color: "#333333",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "5px",
          padding: "8px 16px",
          fontWeight: 600,
          transition: "background-color 0.3s ease",
          "&:hover": {
            boxShadow: "none",
            transform: "none",
            backgroundColor: "#A52A2A", // Tono más claro para hover
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "5px",
            backgroundColor: "#FFFFFF",
            "&:hover fieldset": {
              borderColor: "#800020",
            },
          },
        },
      },
      defaultProps: {
        size: "medium",
        variant: "outlined",
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

const PaginaPrincipalClub = () => {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [eventType, setEventType] = useState("");
  const [participants, setParticipants] = useState(1);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!eventName.trim()) newErrors.eventName = "El nombre del evento es requerido";
    if (!eventDate) newErrors.eventDate = "La fecha del evento es requerida";
    if (!eventType) newErrors.eventType = "El tipo de evento es requerido";
    if (participants < 1) newErrors.participants = "Debe haber al menos 1 participante";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Registrando evento con:", {
        eventName,
        eventDate,
        eventType,
        participants,
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Box
          sx={{
            minHeight: "100vh",
            backgroundColor: "background.default",
            color: "text.primary",
            py: 4,
          }}
        >
          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography
                  variant="h1"
                  sx={{ mb: 2, lineHeight: 1.2 }}
                  aria-label="Gestiona los eventos de tu club"
                >
                  Gestiona los eventos de tu club
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: 600, mx: "auto", mb: 4, fontSize: { xs: "0.9rem", md: "1.1rem" } }}
                >
                  Organiza torneos, entrenamientos y actividades para tu club con facilidad.
                </Typography>
              </Box>
            </Fade>

            <Slide in timeout={1000} direction="up">
              <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{
                  maxWidth: 1000,
                  mx: "auto",
                  p: { xs: 2, sm: 3 },
                  backgroundColor: "background.paper",
                }}
                role="form"
                aria-label="Formulario de gestión de eventos del club"
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      placeholder="Nombre del evento"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      label="Evento"
                      InputProps={{ startAdornment: <EventIcon sx={{ mr: 1, color: "primary.main" }} /> }}
                      error={!!errors.eventName}
                      helperText={errors.eventName}
                      aria-describedby="eventName-error"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="Fecha del evento"
                      value={eventDate}
                      onChange={(newValue) => setEventDate(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.eventDate,
                          helperText: errors.eventDate,
                        },
                      }}
                      aria-describedby="eventDate-error"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Tipo de evento"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      error={!!errors.eventType}
                      helperText={errors.eventType}
                      aria-describedby="eventType-error"
                    >
                      <MenuItem value="Torneo">Torneo</MenuItem>
                      <MenuItem value="Entrenamiento">Entrenamiento</MenuItem>
                      <MenuItem value="Reunión">Reunión</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      inputProps={{ min: 1, max: 100 }}
                      value={participants}
                      onChange={(e) => setParticipants(Number(e.target.value))}
                      label="Participantes"
                      error={!!errors.participants}
                      helperText={errors.participants}
                      aria-describedby="participants-error"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      endIcon={<ArrowRight />}
                      sx={{ py: 1.5, fontSize: "1rem" }}
                      aria-label="Registrar evento"
                    >
                      Registrar
                    </Button>
                  </Grid> 
                </Grid>
              </Paper>
            </Slide>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default PaginaPrincipalClub;