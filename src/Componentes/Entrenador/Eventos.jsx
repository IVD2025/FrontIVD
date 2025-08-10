import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

const EventosEntrenador = () => {
  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
      <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <EventIcon sx={{ fontSize: 60, color: '#800020', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#800020', fontWeight: 'bold', mb: 2 }}>
            🏆 Gestión de Eventos
          </Typography>
          <Typography variant="h6" sx={{ color: '#7A4069' }}>
            Funcionalidad en desarrollo
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#7A4069', mb: 2 }}>
            Esta funcionalidad permitirá a los entrenadores:
          </Typography>
          <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#800020' }}>
              • Ver todos los eventos y competencias disponibles
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#800020' }}>
              • Inscribir atletas en eventos específicos
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#800020' }}>
              • Seguimiento del rendimiento en competencias
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#800020' }}>
              • Consultar resultados y estadísticas
            </Typography>
            <Typography variant="body2" sx={{ color: '#800020' }}>
              • Coordinar participación de atletas del club
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default EventosEntrenador;
