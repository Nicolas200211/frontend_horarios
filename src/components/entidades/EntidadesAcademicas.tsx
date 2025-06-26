import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';

type TipoEntidad = 'Escuela' | 'Instituto' | 'Centro';
type EstadoEntidad = 'Activo' | 'Inactivo';

interface EntidadAcademica {
  id: number;
  nombre: string;
  tipo: TipoEntidad;
  codigo: string;
  estado: EstadoEntidad;
  fechaCreacion: string;
}

interface FormData {
  nombre: string;
  tipo: TipoEntidad;
  codigo: string;
  estado: EstadoEntidad;
}

// Datos de ejemplo para las entidades académicas
const entidadesEjemplo: EntidadAcademica[] = [
  { 
    id: 1, 
    nombre: 'Escuela Profesional de Ingeniería de Sistemas', 
    tipo: 'Escuela', 
    codigo: 'EPIS',
    estado: 'Activo',
    fechaCreacion: '2020-01-15'
  },
  { 
    id: 2, 
    nombre: 'Instituto de Idiomas', 
    tipo: 'Instituto', 
    codigo: 'IDIOMAS',
    estado: 'Activo',
    fechaCreacion: '2019-05-20'
  },
  { 
    id: 3, 
    nombre: 'Centro de Educación Continua', 
    tipo: 'Centro', 
    codigo: 'CEC',
    estado: 'Activo',
    fechaCreacion: '2021-03-10'
  },
  { 
    id: 4, 
    nombre: 'Escuela de Posgrado', 
    tipo: 'Escuela', 
    codigo: 'EPG',
    estado: 'Inactivo',
    fechaCreacion: '2018-11-05'
  },
];

const EntidadesAcademicas: React.FC = () => {
  const [entidades, setEntidades] = useState<EntidadAcademica[]>([]);
  const [filtro, setFiltro] = useState<string>('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
  const [entidadEdicion, setEntidadEdicion] = useState<EntidadAcademica | null>(null);
  
  // Estados para el formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'Escuela',
    codigo: '',
    estado: 'Activo',
  });

  // Cargar datos de ejemplo al montar el componente
  useEffect(() => {
    setEntidades(entidadesEjemplo);
  }, []);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    } as FormData));
  };

  // Filtrar entidades según los filtros aplicados
  const entidadesFiltradas = entidades.filter(entidad => {
    const coincideBusqueda = entidad.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                          entidad.codigo.toLowerCase().includes(filtro.toLowerCase());
    const coincideTipo = tipoFiltro === 'todos' || entidad.tipo === tipoFiltro;
    return coincideBusqueda && coincideTipo;
  });

  // Manejar envío del formulario
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (entidadEdicion) {
      // Actualizar entidad existente
      setEntidades(entidades.map(ent => 
        ent.id === entidadEdicion.id ? { ...formData, id: entidadEdicion.id, fechaCreacion: entidadEdicion.fechaCreacion } : ent
      ));
    } else {
      // Crear nueva entidad
      const nuevaEntidad: EntidadAcademica = {
        ...formData,
        id: Date.now(),
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      setEntidades([...entidades, nuevaEntidad]);
    }
    
    // Limpiar formulario y cerrar
    setFormData({ 
      nombre: '', 
      tipo: 'Escuela', 
      codigo: '', 
      estado: 'Activo' 
    });
    setEntidadEdicion(null);
    setMostrarFormulario(false);
  };

  // Editar entidad
  const handleEditar = (entidad: EntidadAcademica): void => {
    setEntidadEdicion(entidad);
    setFormData({
      nombre: entidad.nombre,
      tipo: entidad.tipo,
      codigo: entidad.codigo,
      estado: entidad.estado
    });
    setMostrarFormulario(true);
  };

  // Eliminar entidad
  const handleEliminar = (id: number): void => {
    if (window.confirm('¿Está seguro de eliminar esta entidad académica?')) {
      setEntidades(entidades.filter(ent => ent.id !== id));
    }
  };

  // Cancelar edición/creación
  const handleCancelar = (): void => {
    setMostrarFormulario(false);
    setEntidadEdicion(null);
    setFormData({ 
      nombre: '', 
      tipo: 'Escuela', 
      codigo: '', 
      estado: 'Activo' 
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Entidades Académicas</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Entidad
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filtro}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltro(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={tipoFiltro}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setTipoFiltro(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="Escuela">Escuela</option>
              <option value="Instituto">Instituto</option>
              <option value="Centro">Centro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de entidades */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entidadesFiltradas.length > 0 ? (
                entidadesFiltradas.map((entidad) => (
                  <tr key={entidad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entidad.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entidad.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entidad.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        entidad.estado === 'Activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entidad.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entidad.fechaCreacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditar(entidad)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(entidad.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron entidades académicas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {entidadEdicion ? 'Editar Entidad' : 'Nueva Entidad'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="Escuela">Escuela</option>
                      <option value="Instituto">Instituto</option>
                      <option value="Centro">Centro</option>

                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelar}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {entidadEdicion ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntidadesAcademicas;
