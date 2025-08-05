import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Container,
  Modal,
  IconButton,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';

const GestionResultados = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');

  const [formData, setFormData] = useState({
    eventoId: '',
    atletaId: '',
    disciplina: '',
    categoria: '',
    tiempo: '',
    posicion: '',
    marca: '',
    observaciones: ''
  });

  const disciplinas = [
    '75 m. Planos', '150 m. Planos', '300 m. Planos', '600 m. Planos', '2000 m. Planos', '5000 m. Planos', '10000 m. Planos',
    '80 m. con Vallas', '100 m. con Vallas', '110 m. con Vallas', '300 m. con Vallas', '400 m. con Vallas', '2000 m. con obstáculos',
    '3000 m. con obstáculos', '5000 m. Marcha', '3000 m. Marcha', '10000 m. Caminata', 'Salto de Altura', 'Salto de Longitud',
    'Salto Triple', 'Salto con Garrocha', 'Lanzamiento de Disco', 'Lanzamiento de Bala', 'Lanzamiento de Pelota', 'Lanzamiento de Martillo',
    'Lanzamiento de Jabalina', 'Tetratlón', 'Heptatlón', 'Decatlón'
  ];

  const categorias = [
    'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20', 'Sub-23', 'Libre'
  ];

  useEffect(() => {
    if (!user || user.rol !== 'administrador') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Obtener eventos
      const eventosRes = await axios.get('http://localhost:5000/api/eventos');
      setEventos(eventosRes.data);

      // Obtener atletas
      const atletasRes = await axios.get('http://localhost:5000/api/registros/atletas');
      setAtletas(atletasRes.data);

      // Obtener resultados
      await fetchResultados();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrorMessage('Error al cargar los datos');
    }
  };

  const fetchResultados = async () => {
    try {
      let url = 'http://localhost:5000/api/resultados';
      const params = new URLSearchParams();
      if (filtroEvento) params.append('eventoId', filtroEvento);
      if (filtroDisciplina) params.append('disciplina', filtroDisciplina);
      if (params.toString()) url += '?' + params.toString();

      const response = await axios.get(url);
      setResultados(response.data);
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      setErrorMessage('Error al cargar los resultados');
    }
  };

  useEffect(() => {
    fetchResultados();
  }, [filtroEvento, filtroDisciplina]);

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      const resultado = resultados[index];
      setFormData({
        eventoId: resultado.eventoId,
        atletaId: resultado.atletaId,
        disciplina: resultado.disciplina,
        categoria: resultado.categoria,
        tiempo: resultado.tiempo || '',
        posicion: resultado.posicion || '',
        marca: resultado.marca || '',
        observaciones: resultado.observaciones || ''
      });
      setEditIndex(index);
    } else {
      setFormData({
        eventoId: '',
        atletaId: '',
        disciplina: '',
        categoria: '',
        tiempo: '',
        posicion: '',
        marca: '',
        observaciones: ''
      });
      setEditIndex(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditIndex(null);
    setFormData({
      eventoId: '',
      atletaId: '',
      disciplina: '',
      categoria: '',
      tiempo: '',
      posicion: '',
      marca: '',
      observaciones: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.eventoId || !formData.atletaId || !formData.disciplina || !formData.categoria) {
        setErrorMessage('Evento, atleta, disciplina y categoría son requeridos');
        return;
      }

      const dataToSend = {
        ...formData,
        registradoPor: user.id
      };

      if (editIndex !== null) {
        // Actualizar resultado existente
        await axios.put(`http://localhost:5000/api/resultados/${resultados[editIndex]._id}`, dataToSend);
        setSuccessMessage('Resultado actualizado correctamente');
      } else {
        // Crear nuevo resultado
        await axios.post('http://localhost:5000/api/resultados', dataToSend);
        setSuccessMessage('Resultado registrado correctamente');
      }

      handleCloseModal();
      fetchResultados();
      setErrorMessage('');
    } catch (error) {
      console.error('Error al guardar resultado:', error);
      setErrorMessage(error.response?.data?.message || 'Error al guardar el resultado');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este resultado?')) {
      try {
        await axios.delete(`http://localhost:5000/api/resultados/${id}`);
        setSuccessMessage('Resultado eliminado correctamente');
        fetchResultados();
      } catch (error) {
        console.error('Error al eliminar resultado:', error);
        setErrorMessage('Error al eliminar el resultado');
      }
    }
  };

  const getAtletaName = (atletaId) => {
    const atleta = atletas.find(a => a._id === atletaId);
    return atleta ? `${atleta.nombre} ${atleta.apellidopa} ${atleta.apellidoma}` : 'N/A';
  };

  const getEventoName = (eventoId) => {
    const evento = eventos.find(e => e._id === eventoId);
    return evento ? evento.titulo : 'N/A';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold', mb: 4 }}>
        Gestión de Resultados
      </Typography>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {successMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </Box>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3, background: '#FFFFFF', borderRadius: '12px' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#800020', mb: 2 }}>
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Evento</InputLabel>
                <Select
                  value={filtroEvento}
                  onChange={(e) => setFiltroEvento(e.target.value)}
                  label="Evento"
                >
                  <MenuItem value="">Todos los eventos</MenuItem>
                  {eventos.map((evento) => (
                    <MenuItem key={evento._id} value={evento._id}>
                      {evento.titulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Disciplina</InputLabel>
                <Select
                  value={filtroDisciplina}
                  onChange={(e) => setFiltroDisciplina(e.target.value)}
                  label="Disciplina"
                >
                  <MenuItem value="">Todas las disciplinas</MenuItem>
                  {disciplinas.map((disciplina) => (
                    <MenuItem key={disciplina} value={disciplina}>
                      {disciplina}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Botón Agregar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            backgroundColor: '#800020',
            '&:hover': { backgroundColor: '#A52A2A' },
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Agregar Resultado
        </Button>
      </Box>

      {/* Tabla de Resultados */}
      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Evento</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Atleta</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Disciplina</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Tiempo</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Posición</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Marca</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultados.map((resultado, index) => (
              <TableRow key={resultado._id} sx={{ '&:hover': { backgroundColor: '#FAFAFF' } }}>
                <TableCell>{getEventoName(resultado.eventoId)}</TableCell>
                <TableCell>{resultado.nombreAtleta || getAtletaName(resultado.atletaId)}</TableCell>
                <TableCell>{resultado.disciplina}</TableCell>
                <TableCell>
                  <Chip 
                    label={resultado.categoria} 
                    size="small" 
                    sx={{ backgroundColor: '#7A4069', color: 'white' }}
                  />
                </TableCell>
                <TableCell>{resultado.tiempo || 'N/A'}</TableCell>
                <TableCell>
                  {resultado.posicion ? (
                    <Chip 
                      label={`${resultado.posicion}°`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: resultado.posicion <= 3 ? '#FFD700' : '#7A4069',
                        color: 'white'
                      }}
                    />
                  ) : 'N/A'}
                </TableCell>
                <TableCell>{resultado.marca || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(index)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(resultado._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal para Agregar/Editar */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            p: 4,
            borderRadius: '12px',
            fontFamily: "'Arial', 'Helvetica', sans-serif",
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
              {editIndex !== null ? 'Editar Resultado' : 'Agregar Resultado'}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Evento</InputLabel>
                <Select
                  value={formData.eventoId}
                  onChange={(e) => setFormData({ ...formData, eventoId: e.target.value })}
                  label="Evento"
                >
                  {eventos.map((evento) => (
                    <MenuItem key={evento._id} value={evento._id}>
                      {evento.titulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Atleta</InputLabel>
                <Select
                  value={formData.atletaId}
                  onChange={(e) => setFormData({ ...formData, atletaId: e.target.value })}
                  label="Atleta"
                >
                  {atletas.map((atleta) => (
                    <MenuItem key={atleta._id} value={atleta._id}>
                      {`${atleta.nombre} ${atleta.apellidopa} ${atleta.apellidoma}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Disciplina</InputLabel>
                <Select
                  value={formData.disciplina}
                  onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                  label="Disciplina"
                >
                  {disciplinas.map((disciplina) => (
                    <MenuItem key={disciplina} value={disciplina}>
                      {disciplina}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  label="Categoría"
                >
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tiempo"
                value={formData.tiempo}
                onChange={(e) => setFormData({ ...formData, tiempo: e.target.value })}
                placeholder="ej: 10.5s"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Posición"
                type="number"
                value={formData.posicion}
                onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                placeholder="ej: 1"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="ej: 7.50m"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                sx={{ mb: 3 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseModal} variant="outlined">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{
                backgroundColor: '#800020',
                '&:hover': { backgroundColor: '#A52A2A' }
              }}
            >
              {editIndex !== null ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default GestionResultados; 