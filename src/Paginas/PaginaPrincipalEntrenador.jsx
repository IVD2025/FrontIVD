import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions, Button, 
  Chip, Avatar, CircularProgress, Alert, Paper, Divider
} from '@mui/material';
import {
  People as PeopleIcon, Event as EventIcon, TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon, Group as GroupIcon, CalendarToday as CalendarIcon,
  Sports as SportsIcon, Work as WorkIcon, School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../Componentes/Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';

const PaginaPrincipalEntrenador = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalAtletas: 0,
    eventosProximos: 0,
    sesionesEsteMes: 0,
    atletasActivos: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [clubInfo, setClubInfo] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user) {
      cargarDatos();
    }
  }, [user, navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar información del club si está asignado
      if (user.clubId) {
        const clubResponse = await axios.get(`http://localhost:5000/api/clubes/${user.clubId}`);
        setClubInfo(clubResponse.data);
      }

      // Cargar estadísticas
      const statsResponse = await axios.get(`http://localhost:5000/api/entrenador/stats/${user.id}`);
      setStats(statsResponse.data);

      // Cargar actividad reciente
      const activityResponse = await axios.get(`http://localhost:5000/api/entrenador/activity/${user.id}`);
      setRecentActivity(activityResponse.data);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'gestionarAtletas':
        navigate('/entrenador/gestionar-atletas');
        break;
      case 'planificarSesiones':
        navigate('/entrenador/planificar-sesiones');
        break;
      case 'verReportes':
        navigate('/entrenador/reportes');
        break;
      case 'eventos':
        navigate('/entrenador/eventos');
        break;
      default:
        break;
    }
  };

  // Verificar si el usuario está autenticado
  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: '#800020' }} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: '#800020' }} />
      </Box>
    );
  }

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
      <Container maxWidth="xl" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center', pt: 4 }}>
        <Typography variant="h4" sx={{ color: '#800020', fontWeight: 'bold', mb: 2, fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
          🏆 Panel de Entrenador
        </Typography>
        <Typography variant="h6" sx={{ color: '#7A4069', mb: 1, fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
          Bienvenido, {user.nombre} {user.apellidopa}
        </Typography>
        {clubInfo && (
          <Chip 
            label={`Club: ${clubInfo.nombre}`} 
            sx={{ backgroundColor: '#2E7D32', color: 'white', fontWeight: 'bold' }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Estadísticas Principales */}
      <Grid container spacing={3} sx={{ mb: 4, px: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #800020 0%, #7A4069 100%)', 
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalAtletas}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Atletas Asignados
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)', 
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.atletasActivos}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Atletas Activos
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7A4069 0%, #9C27B0 100%)', 
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.eventosProximos}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Eventos Próximos
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)', 
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.sesionesEsteMes}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Sesiones Este Mes
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Acciones Rápidas y Actividad Reciente */}
      <Grid container spacing={4} sx={{ px: 4 }}>
        {/* Acciones Rápidas */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" sx={{ color: '#800020', fontWeight: 'bold', mb: 3 }}>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  border: '2px solid #F5E8C7', 
                  '&:hover': { borderColor: '#800020', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} onClick={() => handleQuickAction('gestionarAtletas')}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <GroupIcon sx={{ fontSize: 40, color: '#800020', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
                      Gestionar Atletas
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Ver y gestionar atletas asignados
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  border: '2px solid #F5E8C7', 
                  '&:hover': { borderColor: '#7A4069', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} onClick={() => handleQuickAction('planificarSesiones')}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <CalendarIcon sx={{ fontSize: 40, color: '#7A4069', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#7A4069', fontWeight: 'bold' }}>
                      Planificar Sesiones
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Crear y gestionar sesiones de entrenamiento
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  border: '2px solid #F5E8C7', 
                  '&:hover': { borderColor: '#2E7D32', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} onClick={() => handleQuickAction('eventos')}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <EventIcon sx={{ fontSize: 40, color: '#2E7D32', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                      Ver Eventos
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Consultar eventos y competencias
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  border: '2px solid #F5E8C7', 
                  '&:hover': { borderColor: '#1976D2', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} onClick={() => handleQuickAction('verReportes')}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <AssessmentIcon sx={{ fontSize: 40, color: '#1976D2', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#1976D2', fontWeight: 'bold' }}>
                      Ver Reportes
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Análisis y reportes de rendimiento
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Actividad Reciente */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" sx={{ color: '#800020', fontWeight: 'bold', mb: 3 }}>
              Actividad Reciente
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar sx={{ 
                        bgcolor: activity.tipo === 'sesion' ? '#2E7D32' : 
                                 activity.tipo === 'evento' ? '#7A4069' : '#800020',
                        mr: 2,
                        width: 32,
                        height: 32
                      }}>
                        {activity.tipo === 'sesion' ? <SportsIcon /> : 
                         activity.tipo === 'evento' ? <EventIcon /> : <WorkIcon />}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#800020' }}>
                        {activity.titulo}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {activity.descripcion}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(activity.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay actividad reciente
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Información del Entrenador */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, mx: 4 }}>
        <Typography variant="h5" sx={{ color: '#800020', fontWeight: 'bold', mb: 3 }}>
          Información Profesional
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#7A4069' }}>
                Especialidades:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {user.especialidades && user.especialidades.map((especialidad, index) => (
                  <Chip 
                    key={index} 
                    label={especialidad} 
                    size="small" 
                    sx={{ backgroundColor: '#F5E8C7', color: '#800020' }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#7A4069' }}>
                Certificaciones:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {user.certificaciones && user.certificaciones.map((certificacion, index) => (
                  <Chip 
                    key={index} 
                    label={certificacion} 
                    size="small" 
                    sx={{ backgroundColor: '#E8F5E8', color: '#2E7D32' }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#7A4069' }}>
              Años de Experiencia: {user.añosExperiencia || 0}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#7A4069' }}>
              Estado: {user.estado || 'Activo'}
            </Typography>
          </Grid>
                 </Grid>
       </Paper>
     </Container>
     </>
   );
 };

export default PaginaPrincipalEntrenador;