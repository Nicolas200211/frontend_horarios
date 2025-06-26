import React, { useState, useEffect } from 'react';

type EstadoClase = 'En curso' | 'Por comenzar' | 'Finalizado';

interface Clase {
  id: number;
  materia: string;
  salon: string;
  capacidad: number;
  inscriptos: number;
  horario: string;
  dias: string[];
  estado: EstadoClase;
}

interface Profesor {
  id: number;
  nombre: string;
  imagen: string;
  especialidad: string;
  clases: Clase[];
}

// Datos de ejemplo para los profesores y sus clases
const profesoresEjemplo: Profesor[] = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    imagen: 'https://randomuser.me/api/portraits/men/1.jpg',
    especialidad: 'Matemáticas',
    clases: [
      {
        id: 101,
        materia: 'Álgebra Lineal',
        salon: 'A-201',
        capacidad: 30,
        inscriptos: 28,
        horario: '08:00 - 10:00',
        dias: ['Lunes', 'Miércoles'],
        estado: 'En curso'
      },
      {
        id: 102,
        materia: 'Cálculo Diferencial',
        salon: 'B-105',
        capacidad: 25,
        inscriptos: 22,
        horario: '14:00 - 16:00',
        dias: ['Martes', 'Jueves'],
        estado: 'Por comenzar'
      }
    ]
  },
  {
    id: 2,
    nombre: 'María González',
    imagen: 'https://randomuser.me/api/portraits/women/2.jpg',
    especialidad: 'Literatura',
    clases: [
      {
        id: 201,
        materia: 'Literatura Contemporánea',
        salon: 'C-301',
        capacidad: 20,
        inscriptos: 18,
        horario: '10:00 - 12:00',
        dias: ['Lunes', 'Viernes'],
        estado: 'En curso'
      }
    ]
  }
];

interface TarjetaClaseProps {
  clase: Clase;
  profesor: {
    nombre: string;
    imagen: string;
  };
}

// Componente para la tarjeta de cada clase
const TarjetaClase: React.FC<TarjetaClaseProps> = ({ clase, profesor }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{clase.materia}</h3>
          <p className="text-sm text-gray-600">{clase.salon} • {clase.horario}</p>
          <p className="text-sm text-gray-600 mt-1">{clase.dias.join(', ')}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          clase.estado === 'En curso' ? 'bg-green-100 text-green-800' :
          clase.estado === 'Por comenzar' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {clase.estado}
        </span>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="ml-2 text-gray-700">{clase.inscriptos}/{clase.capacidad} alumnos</span>
          </div>
          <div className="text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {clase.horario}
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <img 
          className="h-8 w-8 rounded-full object-cover" 
          src={profesor.imagen} 
          alt={profesor.nombre} 
        />
        <span className="ml-2 text-sm font-medium text-gray-700">
          {profesor.nombre}
        </span>
      </div>
      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
        Ver detalles
      </button>
    </div>
  </div>
);

// Componente principal de Perfil de Horario
const PerfilHorario: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [filtro, setFiltro] = useState<string>('');
  const [filtroDia, setFiltroDia] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<Profesor | null>(null);

  // Cargar datos de ejemplo al montar el componente
  useEffect(() => {
    setProfesores(profesoresEjemplo);
  }, []);

  // Filtrar profesores según los filtros aplicados
  const profesoresFiltrados = profesores.filter(profesor => {
    // Filtrar por búsqueda
    const coincideBusqueda = profesor.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                          profesor.especialidad.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtrar por día si hay clases que coincidan
    const tieneClaseDia = filtroDia === 'todos' || 
      profesor.clases.some(clase => clase.dias.includes(filtroDia));
    
    // Filtrar por estado si hay clases que coincidan
    const tieneClaseEstado = filtroEstado === 'todos' ||
      profesor.clases.some(clase => clase.estado === filtroEstado);
    
    return coincideBusqueda && tieneClaseDia && tieneClaseEstado;
  });

  // Obtener días únicos de todas las clases para el filtro
  const diasUnicos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Perfiles de Horario</h1>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar profesor o materia..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
            >
              <option value="todos">Todos los días</option>
              {diasUnicos.map((dia) => (
                <option key={dia} value={dia}>{dia}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la clase</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="En curso">En curso</option>
              <option value="Por comenzar">Por comenzar</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de profesores y sus clases */}
      <div className="space-y-6">
        {profesoresFiltrados.length > 0 ? (
          profesoresFiltrados.map((profesor) => (
            <div key={profesor.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <img 
                    className="h-12 w-12 rounded-full object-cover" 
                    src={profesor.imagen} 
                    alt={profesor.nombre} 
                  />
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-800">{profesor.nombre}</h2>
                    <p className="text-sm text-gray-600">{profesor.especialidad}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-md font-medium text-gray-700 mb-3">Clases asignadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profesor.clases
                    .filter(clase => 
                      (filtroDia === 'todos' || clase.dias.includes(filtroDia)) &&
                      (filtroEstado === 'todos' || clase.estado === filtroEstado)
                    )
                    .map((clase) => (
                      <TarjetaClase 
                        key={clase.id} 
                        clase={clase} 
                        profesor={profesor} 
                      />
                    ))}
                </div>
                
                {profesor.clases.filter(clase => 
                  (filtroDia === 'todos' || clase.dias.includes(filtroDia)) &&
                  (filtroEstado === 'todos' || clase.estado === filtroEstado)
                ).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No hay clases que coincidan con los filtros seleccionados.
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron profesores</h3>
            <p className="mt-1 text-gray-500">Intenta con otros criterios de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal de detalles de la clase (se muestra cuando se selecciona una clase) */}
      {profesorSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">Detalles de la Clase</h2>
                <button 
                  onClick={() => setProfesorSeleccionado(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{profesorSeleccionado.nombre}</h3>
                  <p className="text-sm text-gray-500">{profesorSeleccionado.especialidad}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Información de la Clase</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Materia</p>
                      <p className="font-medium">Álgebra Lineal</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salón</p>
                      <p className="font-medium">A-201</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium">08:00 - 10:00</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Días</p>
                      <p className="font-medium">Lunes, Miércoles</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estudiantes</p>
                      <p className="font-medium">28/30 inscritos</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="font-medium">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          En curso
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600">
                    Clase de Álgebra Lineal enfocada en espacios vectoriales, transformaciones lineales y sus aplicaciones.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setProfesorSeleccionado(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ver asistencia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilHorario;
