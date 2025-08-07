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
  ListItemSecondaryAction,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  PersonRemove as PersonRemoveIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';

const GestionAtletas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [error, setError] = useState('');
  const [atletas, setAtletas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [modalExpulsionOpen, setModalExpulsionOpen] = useState(false);
  const [atletaAExpulsar, setAtletaAExpulsar] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchAtletas();
    fetchSolicitudes();
  }, [user, navigate]);

  const fetchAtletas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/registros/atletas-club?clubId=${user.id}`);
      setAtletas(response.data);
      setError('');
    } catch (error) {
      console.error('Error al obtener atletas:', error);
      setError('Error al cargar los atletas. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitudes = async () => {
    try {
      setLoadingSolicitudes(true);
      const response = await axios.get(`http://localhost:5000/api/registros/solicitudes-club?clubId=${user.id}`);
      const solicitudesPendientes = response.data.filter(s => s.estado === 'pendiente');
      setSolicitudes(solicitudesPendientes);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setSolicitudes([]);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const handleAceptarSolicitud = async (solicitudId) => {
    try {
      await axios.put(`http://localhost:5000/api/registros/solicitudes-club/${solicitudId}`, { estado: 'aceptada' });
      setError('');
      fetchSolicitudes();
      fetchAtletas();
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
      setError('Error al procesar la solicitud. Intente de nuevo.');
    }
  };

  const handleRechazarSolicitud = async (solicitudId) => {
    try {
      await axios.put(`http://localhost:5000/api/registros/solicitudes-club/${solicitudId}`, { estado: 'rechazada' });
      setError('');
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      setError('Error al procesar la solicitud. Intente de nuevo.');
    }
  };

  const handleVerSolicitud = (solicitud) => {
    // Aquí puedes implementar un modal para ver más detalles de la solicitud
    console.log('Ver solicitud:', solicitud);
  };

  const handleExpulsarAtleta = (atleta) => {
    setAtletaAExpulsar(atleta);
    setModalExpulsionOpen(true);
  };

  const confirmarExpulsion = async () => {
    try {
      // Desasociar atleta del club (quitar clubId)
      await axios.put(`http://localhost:5000/api/registros/${atletaAExpulsar._id}`, {
        clubId: null
      });
      
      setError('');
      setModalExpulsionOpen(false);
      setAtletaAExpulsar(null);
      fetchAtletas();
    } catch (error) {
      console.error('Error al expulsar atleta:', error);
      setError('Error al expulsar al atleta. Intente de nuevo.');
    }
  };

  const cancelarExpulsion = () => {
    setModalExpulsionOpen(false);
    setAtletaAExpulsar(null);
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
        🏃 Gestión de Atletas del Club
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Solicitudes de Atletas para unirse al Club */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonAddIcon sx={{ color: '#800020' }} />
              <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
                Solicitudes de Atletas para unirse al Club
              </Typography>
              {solicitudes.length > 0 && (
                <Chip 
                  label={solicitudes.length} 
                  color="warning" 
                  size="small"
                />
              )}
            </Box>

            {loadingSolicitudes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={30} />
              </Box>
            ) : solicitudes.length === 0 ? (
              <Alert severity="info">
                No hay solicitudes pendientes en este momento.
              </Alert>
            ) : (
              <List>
                {solicitudes.map((solicitud) => (
                  <ListItem 
                    key={solicitud._id} 
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px', 
                      mb: 1,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#800020' }}>
                            {solicitud.datosAtleta?.nombre?.charAt(0) || 'A'}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {solicitud.datosAtleta?.nombreCompleto || 'Atleta'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Edad:</strong> {solicitud.datosAtleta?.edad || 'N/A'} años
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Género:</strong> {solicitud.datosAtleta?.genero || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Fecha:</strong> {formatearFecha(solicitud.fechaSolicitud)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          color="success"
                          onClick={() => handleAceptarSolicitud(solicitud._id)}
                          title="Aceptar solicitud"
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleRechazarSolicitud(solicitud._id)}
                          title="Rechazar solicitud"
                        >
                          <CloseIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleVerSolicitud(solicitud)}
                          title="Ver detalles"
                        >
                          <GroupIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Atletas pertenecientes al club */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PeopleIcon sx={{ color: '#800020' }} />
              <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
                Atletas pertenecientes al club
              </Typography>
              {atletas.length > 0 && (
                <Chip 
                  label={atletas.length} 
                  color="success" 
                  size="small"
                />
              )}
            </Box>

            {atletas.length === 0 ? (
              <Alert severity="info">
                No hay atletas registrados en este club.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Nombre Completo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>CURP</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Teléfono</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Correo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Género</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Fecha de Ingreso</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {atletas.map((atleta) => (
                      <TableRow key={atleta._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#800020' }}>
                              {atleta.nombre?.charAt(0) || 'A'}
                            </Avatar>
                            <Typography variant="body2">
                              {atleta.nombre} {atleta.apellidopa} {atleta.apellidoma}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{atleta.curp || 'N/A'}</TableCell>
                        <TableCell>{atleta.telefono || 'N/A'}</TableCell>
                        <TableCell>{atleta.gmail || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={atleta.sexo || 'N/A'} 
                            size="small"
                            color={atleta.sexo === 'masculino' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="Activo" 
                            color="success" 
                            size="small"
                          />
                        </TableCell>
                                                 <TableCell>
                           {atleta.fechaIngresoClub ? 
                             formatearFecha(atleta.fechaIngresoClub) : 
                             (atleta.createdAt ? formatearFecha(atleta.createdAt) : 'N/A')
                           }
                         </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => handleExpulsarAtleta(atleta)}
                            title="Expulsar del club"
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'rgba(244, 67, 54, 0.1)' 
                              } 
                            }}
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal de confirmación de expulsión */}
      <Dialog open={modalExpulsionOpen} onClose={cancelarExpulsion} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#f57c00' }} />
            <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
              Confirmar Expulsión
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            ¿Estás seguro de que quieres expulsar a{' '}
            <strong>{atletaAExpulsar?.nombre} {atletaAExpulsar?.apellidopa} {atletaAExpulsar?.apellidoma}</strong> del club?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Esta acción:
          </Typography>
          <ul>
            <li>Desvinculará al atleta del club</li>
            <li>El atleta quedará como atleta independiente</li>
            <li>No se podrá deshacer automáticamente</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelarExpulsion} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={confirmarExpulsion} 
            color="error" 
            variant="contained"
            startIcon={<PersonRemoveIcon />}
          >
            Confirmar Expulsión
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionAtletas;