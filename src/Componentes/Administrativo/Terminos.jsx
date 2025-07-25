import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Terminos = () => {
  const [termino, setTermino] = useState({ titulo: '', contenido: '' });
  const [terminos, setTerminos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTerminos();
  }, []);

  const fetchTerminos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/terminos');
      const formattedTerminos = response.data.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: t.updatedAt ? new Date(t.updatedAt) : null,
      }));
      setTerminos(formattedTerminos);
    } catch (err) {
      setError('Error al cargar los términos. Verifica tu conexión o el servidor.');
      console.error('Error al obtener términos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'titulo' && value.length > 255) return;
    if (name === 'contenido' && value.length > 2000) return;
    setTermino({ ...termino, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termino.titulo.trim() || !termino.contenido.trim()) {
      MySwal.fire({
        title: '¡Error!',
        text: 'El título y el contenido son obligatorios.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#800020',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { titulo: termino.titulo.trim(), contenido: termino.contenido.trim() };
      let response;

      if (editingId) {
        response = await axios.put(`http://localhost:5000/api/terminos/${editingId}`, payload);
        // Verificar si la operación fue exitosa y actualizar el estado
        if (response.status === 200 || response.status === 201) {
          MySwal.fire({
            title: '¡Éxito!',
            text: 'Término actualizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#7A4069',
          });
          setTerminos(terminos.map(t => t._id.toString() === editingId ? { ...response.data, createdAt: new Date(response.data.createdAt), updatedAt: new Date(response.data.updatedAt) } : t));
        } else {
          throw new Error(response.data?.message || 'Error desconocido');
        }
      } else {
        response = await axios.post('http://localhost:5000/api/terminos', payload);
        MySwal.fire({
          title: '¡Éxito!',
          text: 'Término creado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#7A4069',
        });
        setTerminos([...terminos, { ...response.data, createdAt: new Date(response.data.createdAt), updatedAt: new Date(response.data.updatedAt) }]);
      }
      setTermino({ titulo: '', contenido: '' });
      setEditingId(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'No se pudo guardar el término. Intenta de nuevo.';
      MySwal.fire({
        title: '¡Error!',
        text: errorMessage,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#800020',
      });
      console.error('Error al guardar término:', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800020',
      cancelButtonColor: '#7A4069',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await axios.delete(`http://localhost:5000/api/terminos/${id}`);
        // Verificar si la operación fue exitosa y actualizar el estado
        if (response.status === 200) {
          setTerminos(terminos.filter(t => t._id.toString() !== id));
          MySwal.fire({
            title: '¡Éxito!',
            text: 'Término eliminado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#7A4069',
          });
        } else {
          throw new Error(response.data?.message || 'Error desconocido');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'No se pudo eliminar el término.';
        MySwal.fire({
          title: '¡Error!',
          text: errorMessage,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#800020',
        });
        console.error('Error al eliminar término:', err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (termino) => {
    setTermino({ titulo: termino.titulo, contenido: termino.contenido });
    setEditingId(termino._id.toString());
  };

  const handleCancel = () => {
    setTermino({ titulo: '', contenido: '' });
    setEditingId(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestión de Términos</h1>
      {loading && <p style={styles.loading}>Cargando...</p>}
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.flexContainer}>
        <section style={styles.gestionTerminosContainer}>
          <h2 style={styles.subtitle}>Gestionar Término</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Título (máx. 255 caracteres)</label>
                <input
                  type="text"
                  name="titulo"
                  placeholder="Título del término"
                  value={termino.titulo}
                  onChange={handleChange}
                  maxLength={255}
                  required
                  style={styles.input}
                />
                <span style={styles.charCount}>{termino.titulo.length}/255</span>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Contenido (máx. 2000 caracteres)</label>
                <textarea
                  name="contenido"
                  placeholder="Contenido del término (usa saltos de línea para separar puntos)"
                  value={termino.contenido}
                  onChange={handleChange}
                  maxLength={2000}
                  required
                  style={{ ...styles.input, height: '150px', resize: 'vertical' }}
                />
                <span style={styles.charCount}>{termino.contenido.length}/2000</span>
              </div>
            </div>
            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.editButton} disabled={loading}>
                {editingId ? 'Actualizar Término' : 'Crear Término'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} style={styles.cancelButton} disabled={loading}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.terminosGuardadosContainer}>
          <h2 style={styles.subtitle}>Términos Guardados</h2>
          {terminos.length === 0 && !loading && <p>No hay términos guardados.</p>}
          {terminos.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Título</th>
                  <th style={styles.th}>Contenido</th>
                  <th style={styles.th}>Fecha de Creación</th>
                  <th style={styles.th}>Última Actualización</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {terminos.map((termino) => (
                  <tr key={termino._id} style={styles.tr}>
                    <td style={styles.td}>{termino.titulo}</td>
                    <td style={styles.td}>
                      <ul style={styles.contentList}>
                        {termino.contenido.split('\n').map((item, index) => (
                          item.trim() && <li key={index} style={styles.contentItem}>{item.trim()}</li>
                        ))}
                      </ul>
                    </td>
                    <td style={styles.td}>{termino.createdAt.toLocaleString()}</td>
                    <td style={styles.td}>{termino.updatedAt ? termino.updatedAt.toLocaleString() : 'N/A'}</td>
                    <td style={styles.td}>
                      <div style={styles.buttonGroup}>
                        <button
                          style={styles.editButton}
                          onClick={() => handleEdit(termino)}
                          disabled={loading}
                        >
                          Editar
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDelete(termino._id.toString())}
                          disabled={loading}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

// Estilos para el componente (sin cambios)
const styles = {
  container: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '30px',
    background: '#F5E8C7',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Arial', 'Helvetica', sans-serif",
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#800020',
    letterSpacing: '0.05em',
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#800020',
  },
  flexContainer: {
    display: 'flex',
    gap: '25px',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gestionTerminosContainer: {
    flex: '1 1 45%',
    padding: '20px',
    background: '#FFFFFF',
    borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease',
    cursor: 'default',
  },
  terminosGuardadosContainer: {
    flex: '1 1 50%',
    padding: '20px',
    background: '#FFFFFF',
    borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '700',
    marginBottom: '8px',
    color: '#7A4069',
    fontSize: '15px',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '2px solid #D3D0F7',
    backgroundColor: '#FAFAFF',
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
    outline: 'none',
    fontWeight: '500',
    color: '#333333',
  },
  charCount: {
    fontSize: '12px',
    color: '#7A4069',
    textAlign: 'right',
    marginTop: '4px',
  },
  buttonGroup: {
    marginTop: '28px',
    display: 'flex',
    gap: '18px',
    justifyContent: 'flex-start',
  },
  editButton: {
    background: '#800020',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 4px 10px rgba(128, 0, 32, 0.3)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  cancelButton: {
    background: '#7A4069',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 4px 10px rgba(122, 64, 105, 0.3)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  deleteButton: {
    background: '#D32F2F',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    background: '#800020',
    color: '#FFFFFF',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #F5E8C7',
  },
  tr: {
    borderBottom: '1px solid #EEEEEE',
  },
  td: {
    padding: '12px',
    verticalAlign: 'top',
  },
  contentList: {
    listStyleType: 'disc',
    paddingLeft: '20px',
    margin: '10px 0',
  },
  contentItem: {
    margin: '5px 0',
    color: '#333333',
  },
  loading: {
    textAlign: 'center',
    color: '#7A4069',
    fontSize: '18px',
  },
  error: {
    textAlign: 'center',
    color: '#D32F2F',
    fontSize: '18px',
  },
};

export default Terminos;