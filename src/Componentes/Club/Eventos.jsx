import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Event as EventIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';

const Eventos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventos, setEventos] = useState([]);
  const [modalEventoOpen, setModalEventoOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [atletasClub, setAtletasClub] = useState([]);
  const [openAtletasModal, setOpenAtletasModal] = useState(false);
  const [atletasDisponibles, setAtletasDisponibles] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    cargarEventos();
    cargarAtletasClub();
  }, [user, navigate]);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/eventos');
      // Filtrar solo eventos futuros o próximos
      const eventosFuturos = response.data.filter(evento => {
        const fechaEvento = new Date(evento.fecha);
        const fechaActual = new Date();
        return fechaEvento >= fechaActual;
      });
      setEventos(eventosFuturos);
      setError('');
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setError('Error al cargar los eventos. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const cargarAtletasClub = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/registros/atletas-club?clubId=${user.id}`);
      setAtletasClub(response.data);
    } catch (error) {
      console.error('Error al cargar atletas del club:', error);
    }
  };

  const cargarAtletasDisponibles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/registros?rol=atleta&sinClub=true');
      setAtletasDisponibles(response.data);
    } catch (error) {
      console.error('Error al cargar atletas disponibles:', error);
    }
  };

  const handleAbrirModalAtletas = async () => {
    setOpenAtletasModal(true);
    await cargarAtletasDisponibles();
  };

  const handleAsociarAtleta = async (atletaId) => {
    try {
      await axios.put(`http://localhost:5000/api/registros/${atletaId}`, { clubId: user.id });
      await cargarAtletasClub();
      await cargarAtletasDisponibles();
    } catch (error) {
      console.error('Error al asociar atleta:', error);
    }
  };

  const handleDesasociarAtleta = async (atletaId) => {
    try {
      await axios.put(`http://localhost:5000/api/registros/${atletaId}`, { clubId: null });
      await cargarAtletasClub();
      await cargarAtletasDisponibles();
    } catch (error) {
      console.error('Error al desasociar atleta:', error);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return 'N/A';
      }
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Finalizado';
      case 'pendiente': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'cancelado': return 'error';
      case 'finalizado': return 'default';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const handleVerEvento = (evento) => {
    setEventoSeleccionado(evento);
    setModalEventoOpen(true);
  };

  const verificarAtletaParticipando = (evento) => {
    // Verificar si algún atleta del club está participando en este evento
    // Esto sería una verificación básica - en un sistema real necesitarías
    // una tabla de inscripciones para verificar esto correctamente
    return atletasClub.some(atleta => {
      // Verificar si el atleta cumple con los criterios del evento
      const edadAtleta = calcularEdad(atleta.fechaNacimiento);
      const cumpleEdad = edadAtleta >= evento.edadMin && edadAtleta <= evento.edadMax;
      const cumpleGenero = evento.genero === 'Mixto' || atleta.sexo === evento.genero;
      return cumpleEdad && cumpleGenero;
    });
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    const fechaActual = new Date();
    const fechaNac = new Date(fechaNacimiento);
    const edad = fechaActual.getFullYear() - fechaNac.getFullYear();
    const mes = fechaActual.getMonth() - fechaNac.getMonth();
    return mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNac.getDate()) ? edad - 1 : edad;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: '#800020' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold', mb: 4 }}>
        🏃‍♂️ Eventos Próximos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon sx={{ color: '#800020' }} />
            <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
              Todos los Eventos Disponibles
            </Typography>
            {eventos.length > 0 && (
              <Chip 
                label={eventos.length} 
                color="primary" 
                size="small"
              />
            )}
          </Box>
        <Button
            variant="outlined"
            startIcon={<GroupIcon />}
            onClick={handleAbrirModalAtletas}
          sx={{
              color: '#800020', 
              borderColor: '#800020',
            '&:hover': {
                backgroundColor: '#800020',
                color: 'white'
              }
            }}
          >
            Gestionar Atletas del Club
        </Button>
      </Box>

        {eventos.length === 0 ? (
          <Alert severity="info">
            No hay eventos próximos disponibles en este momento.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {eventos.map((evento) => (
              <Grid item xs={12} sm={6} md={4} key={evento._id}>
                <Card 
                  variant="outlined" 
            sx={{
                    borderColor: '#800020',
                    height: '100%',
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(128, 0, 32, 0.2)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: '#800020' }}>
                        <EventIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#800020' }}>
                          {evento.titulo}
            </Typography>
                        <Chip 
                          label={obtenerTextoEstado(evento.estado)} 
                          color={obtenerColorEstado(evento.estado)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      <CalendarIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {formatearFecha(evento.fecha)}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {evento.lugar}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      <strong>Disciplina:</strong> {evento.disciplina}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      <strong>Categoría:</strong> {evento.categoria}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      <strong>Edad:</strong> {evento.edadMin}-{evento.edadMax} años • <strong>Género:</strong> {evento.genero}
                    </Typography>

                    {verificarAtletaParticipando(evento) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CheckCircleIcon sx={{ color: 'green', fontSize: 16 }} />
                        <Typography variant="body2" color="success.main" sx={{ fontSize: '0.75rem' }}>
                          Atletas de tu club pueden participar
                        </Typography>
                      </Box>
                    )}

              <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleVerEvento(evento)}
                sx={{
                        color: '#800020', 
                        borderColor: '#800020',
                  '&:hover': {
                          backgroundColor: '#800020',
                          color: 'white'
                        }
                      }}
                      fullWidth
                    >
                      Ver Detalles
              </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Modal de Detalles del Evento */}
      <Dialog open={modalEventoOpen} onClose={() => setModalEventoOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
            📋 Detalles del Evento
          </Typography>
        </DialogTitle>
        <DialogContent>
          {eventoSeleccionado && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#800020' }}>
                    {eventoSeleccionado.titulo}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>📅 Información General</Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Fecha:</strong> {formatearFecha(eventoSeleccionado.fecha || eventoSeleccionado.createdAt)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Hora:</strong> {eventoSeleccionado.hora}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Lugar:</strong> {eventoSeleccionado.lugar}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Estado:</strong> 
                        <Chip 
                          label={obtenerTextoEstado(eventoSeleccionado.estado)} 
                          color={obtenerColorEstado(eventoSeleccionado.estado)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>🏃 Información Deportiva</Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Disciplina:</strong> {eventoSeleccionado.disciplina}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Categoría:</strong> {eventoSeleccionado.categoria}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Rango de Edad:</strong> {eventoSeleccionado.edadMin} - {eventoSeleccionado.edadMax} años
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Género:</strong> {eventoSeleccionado.genero}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {eventoSeleccionado.descripcion && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>📝 Descripción</Typography>
                        <Typography variant="body2">
                          {eventoSeleccionado.descripcion}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>📊 Información Técnica</Typography>
                      <Typography variant="body2" paragraph>
                        <strong>ID del Evento:</strong> {eventoSeleccionado._id}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Fecha de Creación:</strong> {formatearFecha(eventoSeleccionado.createdAt)}
                      </Typography>
                      {eventoSeleccionado.fechaCierre && (
                        <Typography variant="body2" paragraph>
                          <strong>Fecha de Cierre:</strong> {formatearFecha(eventoSeleccionado.fechaCierre)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEventoOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para gestionar atletas del club */}
      <Dialog open={openAtletasModal} onClose={() => setOpenAtletasModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
            Gestionar Atletas del Club
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Atletas del Club ({atletasClub.length})
              </Typography>
            <List>
                {atletasClub.map((atleta) => (
                  <ListItem key={atleta._id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#800020' }}>
                        {atleta.nombre?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                  <ListItemText
                      primary={`${atleta.nombre} ${atleta.apellidopa} ${atleta.apellidoma}`}
                      secondary={`Edad: ${calcularEdad(atleta.fechaNacimiento)} años • ${atleta.sexo}`}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDesasociarAtleta(atleta._id)}
                    >
                      Desasociar
                    </Button>
                </ListItem>
              ))}
                {atletasClub.length === 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No hay atletas asociados a este club
                  </Typography>
                )}
            </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Atletas Disponibles ({atletasDisponibles.length})
              </Typography>
              <List>
                {atletasDisponibles.map((atleta) => (
                  <ListItem key={atleta._id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        {atleta.nombre?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${atleta.nombre} ${atleta.apellidopa} ${atleta.apellidoma}`}
                      secondary={`Edad: ${calcularEdad(atleta.fechaNacimiento)} años • ${atleta.sexo}`}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleAsociarAtleta(atleta._id)}
                    >
                      Asociar
                    </Button>
                  </ListItem>
                ))}
                {atletasDisponibles.length === 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No hay atletas disponibles para asociar
                  </Typography>
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAtletasModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Eventos;