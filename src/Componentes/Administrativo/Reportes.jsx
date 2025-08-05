import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { 
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reportes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Filtros
  const [filtroEvento, setFiltroEvento] = useState('');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('todos');
  
  // Datos
  const [eventos, setEventos] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [mejoresTiempos, setMejoresTiempos] = useState([]);
  const [progresoAtletas, setProgresoAtletas] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    cargarDatos();
  }, [user]);

  useEffect(() => {
    if (resultados.length > 0) {
      calcularEstadisticas();
    }
  }, [resultados, filtroEvento, filtroDisciplina, filtroCategoria]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar eventos
      const eventosRes = await axios.get('http://localhost:5000/api/eventos');
      setEventos(eventosRes.data);
      
      // Cargar resultados
      const resultadosRes = await axios.get('http://localhost:5000/api/resultados');
      setResultados(resultadosRes.data);
      
      // Cargar atletas
      const atletasRes = await axios.get('http://localhost:5000/api/registros?rol=atleta');
      setAtletas(atletasRes.data);
      
      // Cargar clubes
      const clubesRes = await axios.get('http://localhost:5000/api/clubes');
      setClubes(clubesRes.data);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos para los reportes');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    let datosFiltrados = [...resultados];
    
    // Aplicar filtros
    if (filtroEvento) {
      datosFiltrados = datosFiltrados.filter(r => r.eventoId === filtroEvento);
    }
    if (filtroDisciplina) {
      datosFiltrados = datosFiltrados.filter(r => r.disciplina === filtroDisciplina);
    }
    if (filtroCategoria) {
      datosFiltrados = datosFiltrados.filter(r => r.categoria === filtroCategoria);
    }
    if (filtroFecha !== 'todos') {
      const fechaLimite = new Date();
      if (filtroFecha === 'mes') {
        fechaLimite.setMonth(fechaLimite.getMonth() - 1);
      } else if (filtroFecha === 'trimestre') {
        fechaLimite.setMonth(fechaLimite.getMonth() - 3);
      } else if (filtroFecha === 'año') {
        fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
      }
      datosFiltrados = datosFiltrados.filter(r => new Date(r.fechaEvento) >= fechaLimite);
    }

    // Estadísticas generales
    const totalResultados = datosFiltrados.length;
    const totalAtletas = new Set(datosFiltrados.map(r => r.atletaId)).size;
    const totalEventos = new Set(datosFiltrados.map(r => r.eventoId)).size;
    const podios = datosFiltrados.filter(r => r.posicion && r.posicion <= 3).length;

    // Mejores tiempos por disciplina
    const mejoresPorDisciplina = {};
    datosFiltrados.forEach(resultado => {
      if (resultado.tiempo) {
        if (!mejoresPorDisciplina[resultado.disciplina] || 
            resultado.tiempo < mejoresPorDisciplina[resultado.disciplina].tiempo) {
          mejoresPorDisciplina[resultado.disciplina] = resultado;
        }
      }
    });

    // Distribución por categorías
    const distribucionCategorias = {};
    datosFiltrados.forEach(r => {
      distribucionCategorias[r.categoria] = (distribucionCategorias[r.categoria] || 0) + 1;
    });

    // Progreso temporal
    const progreso = datosFiltrados
      .sort((a, b) => new Date(a.fechaEvento) - new Date(b.fechaEvento))
      .map(r => ({
        fecha: new Date(r.fechaEvento).toLocaleDateString('es-ES'),
        disciplina: r.disciplina,
        tiempo: r.tiempo,
        posicion: r.posicion
      }));

    setEstadisticas({
      totalResultados,
      totalAtletas,
      totalEventos,
      podios,
      mejoresPorDisciplina,
      distribucionCategorias,
      progreso
    });

    setMejoresTiempos(Object.values(mejoresPorDisciplina));
  };

  const generarPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const lineHeight = fontSize * 1.2;
      
      let y = height - 50;
      
      // Título
      page.drawText('REPORTE DE RESULTADOS - PAGESTADIA', {
        x: 50,
        y,
        size: 18,
        font,
        color: rgb(0.5, 0, 0.125)
      });
      y -= 30;
      
      // Fecha del reporte
      page.drawText(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, {
        x: 50,
        y,
        size: fontSize,
        font
      });
      y -= 30;
      
      // Estadísticas generales
      page.drawText('ESTADÍSTICAS GENERALES:', {
        x: 50,
        y,
        size: 14,
        font,
        color: rgb(0.5, 0, 0.125)
      });
      y -= 20;
      
      page.drawText(`Total de resultados: ${estadisticas.totalResultados}`, {
        x: 50,
        y,
        size: fontSize,
        font
      });
      y -= lineHeight;
      
      page.drawText(`Total de atletas: ${estadisticas.totalAtletas}`, {
        x: 50,
        y,
        size: fontSize,
        font
      });
      y -= lineHeight;
      
      page.drawText(`Total de eventos: ${estadisticas.totalEventos}`, {
        x: 50,
        y,
        size: fontSize,
        font
      });
      y -= lineHeight;
      
      page.drawText(`Podios obtenidos: ${estadisticas.podios}`, {
        x: 50,
        y,
        size: fontSize,
        font
      });
      y -= 30;
      
      // Mejores tiempos
      if (mejoresTiempos.length > 0) {
        page.drawText('MEJORES TIEMPOS POR DISCIPLINA:', {
          x: 50,
          y,
          size: 14,
          font,
          color: rgb(0.5, 0, 0.125)
        });
        y -= 20;
        
        mejoresTiempos.forEach(resultado => {
          page.drawText(`${resultado.disciplina}: ${resultado.tiempo}s - ${resultado.nombreAtleta}`, {
            x: 50,
            y,
            size: fontSize,
            font
          });
          y -= lineHeight;
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-resultados-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setError('Error al generar el PDF');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        📊 Reportes y Estadísticas
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filtros</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Evento</InputLabel>
              <Select
                value={filtroEvento}
                onChange={(e) => setFiltroEvento(e.target.value)}
                label="Evento"
              >
                <MenuItem value="">Todos los eventos</MenuItem>
                {eventos.map(evento => (
                  <MenuItem key={evento._id} value={evento._id}>
                    {evento.titulo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Disciplina</InputLabel>
              <Select
                value={filtroDisciplina}
                onChange={(e) => setFiltroDisciplina(e.target.value)}
                label="Disciplina"
              >
                <MenuItem value="">Todas las disciplinas</MenuItem>
                {Array.from(new Set(resultados.map(r => r.disciplina))).map(disciplina => (
                  <MenuItem key={disciplina} value={disciplina}>{disciplina}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                label="Categoría"
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {Array.from(new Set(resultados.map(r => r.categoria))).map(categoria => (
                  <MenuItem key={categoria} value={categoria}>{categoria}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                label="Período"
              >
                <MenuItem value="todos">Todos los períodos</MenuItem>
                <MenuItem value="mes">Último mes</MenuItem>
                <MenuItem value="trimestre">Último trimestre</MenuItem>
                <MenuItem value="año">Último año</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
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
                    Atletas Participantes
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
                    {estadisticas.totalEventos || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Eventos Realizados
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
                <TrendingUpIcon sx={{ fontSize: 40, color: '#800020', mr: 2 }} />
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

      {/* Botón de exportar PDF */}
      <Box sx={{ mb: 3, textAlign: 'right' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={generarPDF}
          sx={{ bgcolor: '#800020', '&:hover': { bgcolor: '#600018' } }}
        >
          Exportar PDF
        </Button>
      </Box>

      {/* Tabs para diferentes tipos de reportes */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Gráficos" />
          <Tab label="Mejores Tiempos" />
          <Tab label="Distribución por Categorías" />
          <Tab label="Progreso Temporal" />
        </Tabs>

        {/* Contenido de los tabs */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Resultados por Disciplina</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(estadisticas.distribucionCategorias || {}).map(([categoria, cantidad]) => ({
                    categoria,
                    cantidad
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#800020" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Distribución de Categorías</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(estadisticas.distribucionCategorias || {}).map(([categoria, cantidad], index) => ({
                        name: categoria,
                        value: cantidad
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(estadisticas.distribucionCategorias || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Mejores Tiempos por Disciplina</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Disciplina</TableCell>
                    <TableCell>Atleta</TableCell>
                    <TableCell>Tiempo</TableCell>
                    <TableCell>Evento</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mejoresTiempos.map((resultado, index) => (
                    <TableRow key={index}>
                      <TableCell>{resultado.disciplina}</TableCell>
                      <TableCell>{resultado.nombreAtleta}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${resultado.tiempo}s`} 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{resultado.nombreEvento}</TableCell>
                      <TableCell>
                        {new Date(resultado.fechaEvento).toLocaleDateString('es-ES')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Distribución de Resultados por Categoría</Typography>
              <Grid container spacing={2}>
                {Object.entries(estadisticas.distribucionCategorias || {}).map(([categoria, cantidad]) => (
                  <Grid item xs={12} sm={6} md={4} key={categoria}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" color="primary">
                          {cantidad}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {categoria}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Progreso Temporal de Resultados</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={estadisticas.progreso || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tiempo" 
                    stroke="#800020" 
                    strokeWidth={2}
                    dot={{ fill: '#800020', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Reportes; 