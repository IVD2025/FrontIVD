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
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  Speed as SpeedIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../Componentes/Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';

const PaginaPrincipalClub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [club, setClub] = useState(null);
  const [atletasRecientes, setAtletasRecientes] = useState([]);
  const [eventosRecientes, setEventosRecientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [modalEventoOpen, setModalEventoOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  useEffect(() => {
    if (!user || user.rol !== 'club') {
      navigate('/login');
      return;
    }
    cargarDatosClub();
  }, [user, navigate]);

  const cargarDatosClub = async () => {
    try {
      setLoading(true);
      
      // Cargar información del club
      const clubRes = await axios.get(`http://localhost:5000/api/clubes/${user.id}`);
      setClub(clubRes.data);
      
      // Cargar atletas recién ingresados (últimos 5)
      const atletasRes = await axios.get(`http://localhost:5000/api/registros/atletas-club?clubId=${user.id}&limit=5&sort=createdAt`);
      setAtletasRecientes(atletasRes.data);
      
      // Cargar eventos recientes (últimos 5)
      const eventosRes = await axios.get(`http://localhost:5000/api/eventos?limit=5`);
      setEventosRecientes(eventosRes.data);
      
      // Cargar estadísticas del club
      const estadisticasRes = await axios.get(`http://localhost:5000/api/resultados?clubId=${user.id}`);
      calcularEstadisticas(atletasRes.data, estadisticasRes.data);
      
    } catch (error) {
      console.error('Error al cargar datos del club:', error);
      setError('Error al cargar los datos del club');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (atletasData, resultadosData) => {
    const totalAtletas = atletasData.length;
    const atletasActivos = atletasData.filter(a => a.estado !== 'inactivo').length;
    const totalResultados = resultadosData.length;
    const podios = resultadosData.filter(r => r.posicion && r.posicion <= 3).length;
    
    setEstadisticas({
      totalAtletas,
      atletasActivos,
      totalResultados,
      podios
    });
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const fechaActual = new Date();
    const fechaNac = new Date(fechaNacimiento);
    const edad = fechaActual.getFullYear() - fechaNac.getFullYear();
    const mes = fechaActual.getMonth() - fechaNac.getMonth();
    return mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNac.getDate()) ? edad - 1 : edad;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obtenerTextoEstado = (estado) => {
    if (estado === true || estado === 'activo') return 'Activo';
    if (estado === false || estado === 'inactivo') return 'Inactivo';
    return 'Desconocido';
  };

  const obtenerColorEstado = (estado) => {
    if (estado === true || estado === 'activo') return 'success';
    if (estado === false || estado === 'inactivo') return 'error';
    return 'default';
  };

  const handleVerEvento = (evento) => {
    setEventoSeleccionado(evento);
    setModalEventoOpen(true);
  };

  const handleVerAtletas = () => {
    navigate('/club/gestionAtletas');
  };

  const handleVerEventos = () => {
    navigate('/club/eventos');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: '#800020' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold', mb: 4 }}>
        🏆 Dashboard del Club - {club?.nombre}
      </Typography>

      {/* Información del club */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#800020', fontSize: '2rem' }}>
              <GroupIcon />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" sx={{ color: '#800020', fontWeight: 'bold' }}>
              {club?.nombre}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {club?.direccion}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Entrenador: {club?.entrenador || 'No asignado'} • Tel: {club?.telefono}
            </Typography>
            {club?.email && (
              <Typography variant="body2" color="textSecondary">
                Email: {club?.email}
              </Typography>
            )}
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate('/club/perfil')}
              sx={{ color: '#800020', borderColor: '#800020' }}
            >
              Editar Perfil
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Estadísticas generales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, color: '#800020', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {estadisticas.totalAtletas || 0}
                </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Atletas
                </Typography>
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
                  <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ fontSize: 40, color: '#800020', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {estadisticas.atletasActivos || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Atletas Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
                  </Grid>
        
                  <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SpeedIcon sx={{ fontSize: 40, color: '#800020', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {estadisticas.totalResultados || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Resultados Registrados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
                  </Grid>
        
                  <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EmojiEventsIcon sx={{ fontSize: 40, color: '#800020', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {estadisticas.podios || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Podios Obtenidos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Atletas Recién Ingresados */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon sx={{ color: '#800020' }} />
                <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
                  Atletas Recién Ingresados
                </Typography>
                {atletasRecientes.length > 0 && (
                  <Chip 
                    label={atletasRecientes.length} 
                    color="success" 
                    size="small"
                  />
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleVerAtletas}
                sx={{ color: '#800020', borderColor: '#800020' }}
              >
                Ver Todos
              </Button>
            </Box>

            {atletasRecientes.length === 0 ? (
              <Alert severity="info">
                No hay atletas registrados en este club.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {atletasRecientes.map((atleta) => (
                  <Grid item xs={12} sm={6} key={atleta._id}>
                    <Card variant="outlined" sx={{ borderColor: '#800020' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ width: 48, height: 48, bgcolor: '#800020' }}>
                            {atleta.nombre?.charAt(0) || 'A'}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#800020' }}>
                              {atleta.nombre} {atleta.apellidopa}
                            </Typography>
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label="Miembro Activo" 
                              color="success" 
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Edad:</strong> {calcularEdad(atleta.fechaNacimiento)} años
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Género:</strong> {atleta.sexo || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Teléfono:</strong> {atleta.telefono || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
                  </Grid>

        {/* Eventos Recientes */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon sx={{ color: '#800020' }} />
                <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
                  Eventos Recientes
                </Typography>
                {eventosRecientes.length > 0 && (
                  <Chip 
                    label={eventosRecientes.length} 
                    color="primary" 
                    size="small"
                  />
                )}
              </Box>
                    <Button
                variant="outlined"
                size="small"
                onClick={handleVerEventos}
                sx={{ color: '#800020', borderColor: '#800020' }}
              >
                Ver Todos
              </Button>
            </Box>

            {eventosRecientes.length === 0 ? (
              <Alert severity="info">
                No hay eventos disponibles en este momento.
              </Alert>
            ) : (
              <List>
                {eventosRecientes.map((evento) => (
                  <ListItem 
                    key={evento._id} 
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px', 
                      mb: 1,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#800020' }}>
                        <EventIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {evento.titulo}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            <CalendarIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {formatearFecha(evento.fecha)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <LocationIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {evento.lugar}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Disciplina:</strong> {evento.disciplina} • <strong>Categoría:</strong> {evento.categoria}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleVerEvento(evento)}
                      title="Ver detalles del evento"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

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
                      <Typography variant="body2" paragraph>
                        <strong>Fecha de Cierre:</strong> {formatearFecha(eventoSeleccionado.fechaCierre)}
                      </Typography>
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
          </Container>
  );
};

export default PaginaPrincipalClub;