import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const TablaResponsiva = ({
  datos = [],
  columnas = [],
  onRowClick,
  sortable = true,
  searchable = true,
  paginable = true,
  itemsPerPage = 10,
  className = '',
  style = {}
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Función para ordenar datos
  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Función para filtrar datos
  const filterData = (data) => {
    if (!searchTerm) return data;

    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Función para paginar datos
  const paginateData = (data) => {
    if (!paginable) return data;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Función para manejar el ordenamiento
  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Función para obtener el icono de ordenamiento
  const getSortIcon = (key) => {
    if (!sortable) return null;

    if (sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} />;
    }

    return sortConfig.direction === 'asc' ? (
      <FontAwesomeIcon icon={faSortUp} />
    ) : (
      <FontAwesomeIcon icon={faSortDown} />
    );
  };

  // Función para alternar fila expandida (móvil)
  const toggleRow = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  // Procesar datos
  const processedData = paginateData(filterData(sortData(datos)));
  const totalPages = Math.ceil(filterData(sortData(datos)).length / itemsPerPage);

  // Renderizado para móvil (cards)
  if (isMobile) {
    return (
      <div className={`tabla-movil ${className}`} style={style}>
        {/* Barra de búsqueda */}
        {searchable && (
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>
        )}

        {/* Cards de datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {processedData.map((item, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #eee',
                borderRadius: '12px',
                padding: '16px',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {/* Header de la card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => toggleRow(index)}
              >
                <h4 style={{ margin: 0, color: '#800020' }}>
                  {columnas[0]?.render ? columnas[0].render(item[columnas[0].key], item) : item[columnas[0]?.key]}
                </h4>
                <FontAwesomeIcon
                  icon={expandedRows.has(index) ? faChevronUp : faChevronDown}
                  color="#800020"
                />
              </div>

              {/* Contenido expandido */}
              {expandedRows.has(index) && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  {columnas.slice(1).map((columna, colIndex) => (
                    <div key={colIndex} style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#666' }}>{columna.label}: </strong>
                      <span>
                        {columna.render ? columna.render(item[columna.key], item) : item[columna.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Paginación */}
        {paginable && totalPages > 1 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                margin: '0 4px',
                border: '1px solid #800020',
                background: currentPage === 1 ? '#f0f0f0' : 'white',
                color: currentPage === 1 ? '#999' : '#800020',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Anterior
            </button>
            <span style={{ margin: '0 8px' }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                margin: '0 4px',
                border: '1px solid #800020',
                background: currentPage === totalPages ? '#f0f0f0' : 'white',
                color: currentPage === totalPages ? '#999' : '#800020',
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    );
  }

  // Renderizado para tablet y desktop (tabla tradicional)
  return (
    <div className={`tabla-desktop ${className}`} style={style}>
      {/* Barra de búsqueda */}
      {searchable && (
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>
      )}

      {/* Tabla */}
      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {columnas.map((columna, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(columna.key)}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                    cursor: sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {columna.label}
                    {sortable && getSortIcon(columna.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick && onRowClick(item)}
                style={{
                  borderBottom: '1px solid #eee',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.2s',
                  '&:hover': onRowClick ? { background: '#f8f9fa' } : {}
                }}
              >
                {columnas.map((columna, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    {columna.render ? columna.render(item[columna.key], item) : item[columna.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {paginable && totalPages > 1 && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              margin: '0 4px',
              border: '1px solid #800020',
              background: currentPage === 1 ? '#f0f0f0' : 'white',
              color: currentPage === 1 ? '#999' : '#800020',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Anterior
          </button>
          <span style={{ margin: '0 8px' }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              margin: '0 4px',
              border: '1px solid #800020',
              background: currentPage === totalPages ? '#f0f0f0' : 'white',
              color: currentPage === totalPages ? '#999' : '#800020',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TablaResponsiva;
