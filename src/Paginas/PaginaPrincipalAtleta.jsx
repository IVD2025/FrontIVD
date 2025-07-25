import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Fade,
  Slide,
  Card,
  CardContent,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#800020', // Granada/Vino para fondo y botones
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7A4069', // Morado medio para acentos
    },
    background: {
      default: '#FFFFFF', // Fondo blanco puro
      paper: '#F5E8C7', // Beige claro para cards
    },
    text: {
      primary: '#333333', // Gris oscuro para texto principal
      secondary: '#666666', // Gris medio para texto secundario
    },
    error: {
      main: '#D32F2F', // Rojo oscuro para errores
    },
  },
  typography: {
    fontFamily: "'Arial', 'Helvetica', sans-serif", // Fuente sencilla y profesional
    h1: {
      fontWeight: 700,
      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
      letterSpacing: '0',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
      color: '#333333',
    },
    body2: {
      fontSize: '0.9rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '5px',
          padding: '8px 16px',
          fontWeight: 600,
          transition: 'background-color 0.3s ease',
          '&:hover': {
            boxShadow: 'none',
            transform: 'none',
            backgroundColor: '#A52A2A', // Tono más claro para hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const API_BASE_URL = 'http://localhost:5000'; // Ajusta según tu backend

function InicioAtleta() {
  const [atletas, setAtletas] = useState([]);
  const [clubes, setClubes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const atletasResponse = await axios.get(`${API_BASE_URL}/api/atletas`);
        const clubesResponse = await axios.get(`${API_BASE_URL}/api/clubes`);
        setAtletas(atletasResponse.data);
        setClubes(clubesResponse.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider>
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: 'background.default',
            color: 'text.primary',
            py: 4,
          }}
        >
          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h1"
                  sx={{ mb: 2, lineHeight: 1.2 }}
                  aria-label="Instituto Veracruzano del Deporte"
                >
                  Bienvenido Atleta
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: 600, mx: 'auto', mb: 4, fontSize: { xs: '0.9rem', md: '1.1rem' } }}
                >
                  Sabías que practicar deportes reduce el estrés en un 25% según la OMS. ¡Únete y mejora tu vida!
                </Typography>
              </Box>
            </Fade>

            <Slide in timeout={1000} direction="up">
              <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', textAlign: 'center', mb: 3 }}>
                  Atletas Inscritos
                </Typography>
                <Grid container spacing={3}>
                  {atletas.map((atleta) => (
                    <Grid item xs={12} sm={6} md={4} key={atleta._id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {atleta.nombre} {atleta.apellidopa} {atleta.apellidoma}
                          </Typography>
                          <Typography variant="body2">CURP: {atleta.curp}</Typography>
                          <Typography variant="body2">Rol: {atleta.rol}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Slide>

            <Slide in timeout={1200} direction="up">
              <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', textAlign: 'center', mb: 3 }}>
                  Clubes Registrados
                </Typography>
                <Grid container spacing={3}>
                  {clubes.map((club) => (
                    <Grid item xs={12} sm={6} md={4} key={club._id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {club.nombre}
                          </Typography>
                          <Typography variant="body2">Estado: {club.estadoNacimiento}</Typography>
                          <Typography variant="body2">Teléfono: {club.telefono}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Slide>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default InicioAtleta;