import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';

const ReportesEntrenador = () => {
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
          <AssessmentIcon sx={{ fontSize: 60, color: '#800020', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#800020', fontWeight: 'bold', mb: 2 }}>
            📊 Reportes y Análisis
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
              • Generar reportes de rendimiento individual
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#800020' }}>
              • Análisis de progreso de los atletas
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#800020' }}>
              • Estadísticas de participación en eventos
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#800020' }}>
              • Comparativas de rendimiento entre atletas
            </Typography>
            <Typography variant="body2" sx={{ color: '#800020' }}>
              • Exportar datos para análisis externos
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ReportesEntrenador;
