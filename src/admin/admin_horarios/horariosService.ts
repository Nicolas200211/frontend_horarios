import type { Horario, HorarioFormData, FiltrosHorario, HorarioListResponse } from './types';

const API_BASE_URL = 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/horarios`;

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    throw new Error('Error al procesar la respuesta del servidor');
  }
  
  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });
    
    const errorMessage = data.detail || 
                        data.message || 
                        (typeof data === 'string' ? data : 'Error en la petición');
    
    const error = new Error(errorMessage);
    (error as any).response = data;
    (error as any).status = response.status;
    throw error;
  }
  return data;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Common headers for requests
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Obtener rango de fechas para el calendario
export const getRangoFechas = async (fechaInicio: string, fechaFin: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/rango-fechas/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<string[]>(response);
  } catch (error) {
    console.error('Error al obtener el rango de fechas:', error);
    throw error;
  }
};

// Get class types
export const getTiposClase = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/tipos-clase/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<string[]>(response);
  } catch (error) {
    console.error('Error al obtener tipos de clase:', error);
    throw error;
  }
};

// Obtener horarios con paginación y filtros
export const getHorarios = async (filtros: FiltrosHorario = {}): Promise<HorarioListResponse> => {
  try {
    const params = new URLSearchParams();
    
    // Agregar filtros a los parámetros de consulta
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Formatear fechas al formato YYYY-MM-DD
        if (value instanceof Date) {
          params.append(key, value.toISOString().split('T')[0]);
        } else if (key === 'fecha_clase' || key.endsWith('_at')) {
          // Asegurarse de que las fechas estén en el formato correcto
          params.append(key, String(value).split('T')[0]);
        } else {
          params.append(key, String(value));
        }
      }
    });

    const url = `${API_URL}/?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    return handleResponse<HorarioListResponse>(response);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    throw error;
  }
};

// Get a schedule by ID
export const getHorarioById = async (id: number): Promise<Horario> => {
  try {
    const response = await fetch(`${API_URL}/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Horario>(response);
  } catch (error) {
    console.error(`Error al obtener el horario con ID ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo horario
export const createHorario = async (data: HorarioFormData): Promise<Horario> => {
  try {
    // Asegurarse de que la fecha esté en el formato correcto
    let fechaClase: string;
    let diaSemana: string | undefined;
    
    if (!data.fecha_clase) {
      throw new Error('La fecha de la clase es requerida');
    }
    
    if (typeof data.fecha_clase === 'string') {
      // Validar el formato de la fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.fecha_clase)) {
        throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
      }
      
      fechaClase = data.fecha_clase;
      const [year, month, day] = fechaClase.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
    } else if (data.fecha_clase && typeof data.fecha_clase === 'object' && 'format' in data.fecha_clase) {
      // Es un objeto Day.js o similar con método format
      fechaClase = (data.fecha_clase as any).format('YYYY-MM-DD');
      diaSemana = (data.fecha_clase as any).format('dddd');
    } else {
      throw new Error('Formato de fecha no soportado');
    }
      
    const horarioData: HorarioFormData = {
      ...data,
      aula_id: Number(data.aula_id),
      curso_id: Number(data.curso_id),
      profesor_id: Number(data.profesor_id),
      unidad_academica_id: Number(data.unidad_academica_id || 1),
      fecha_clase: fechaClase,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      tipo_clase: data.tipo_clase,
      // Mantener dia para compatibilidad con el backend si es necesario
      dia: diaSemana,
    };

    console.log('Enviando datos al servidor:', horarioData);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(horarioData),
    });
    return handleResponse<Horario>(response);
  } catch (error) {
    console.error('Error al crear el horario:', error);
    throw error;
  }
};

// Actualizar un horario existente
export const updateHorario = async (
  id: number,
  data: Partial<HorarioFormData>
): Promise<Horario> => {
  try {
    // Asegurarse de que la fecha esté en el formato correcto
    let horarioData = { ...data };
    
    if (data.fecha_clase) {
      if (typeof data.fecha_clase === 'string') {
        // Si es string, asumimos que ya está en formato YYYY-MM-DD
        const [year, month, day] = data.fecha_clase.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        horarioData.dia = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
      } else if (data.fecha_clase && typeof data.fecha_clase === 'object' && 'format' in data.fecha_clase) {
        // Es un objeto Day.js o similar con método format
        horarioData.fecha_clase = (data.fecha_clase as any).format('YYYY-MM-DD');
        horarioData.dia = (data.fecha_clase as any).format('dddd');
      }
    }
    
    console.log('Actualizando horario con datos:', horarioData);

    const response = await fetch(`${API_URL}/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(horarioData),
    });
    return handleResponse<Horario>(response);
  } catch (error) {
    console.error(`Error al actualizar el horario con ID ${id}:`, error);
    throw error;
  }
};

// Delete a schedule
export const deleteHorario = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar el horario');
    }
  } catch (error) {
    console.error(`Error al eliminar el horario con ID ${id}:`, error);
    throw error;
  }
};

// Get classrooms
export const getAulas = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/aulas/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await handleResponse<any>(response);
    // Handle both response formats: direct array or { items: [...] }
    return Array.isArray(data) ? data : (data.items || []);
  } catch (error) {
    console.error('Error al obtener aulas:', error);
    return []; // Return empty array instead of throwing to prevent UI crash
  }
};

// Get courses
export const getCursos = async (): Promise<any[]> => {
  try {
    console.log('Fetching cursos from:', `${API_BASE_URL}/api/cursos/`);
    const response = await fetch(`${API_BASE_URL}/api/cursos/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      console.error('Error response from cursos API:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      // Try to get error details from response
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }
      return [];
    }
    
    const data = await response.json();
    console.log('Cursos API response:', data);
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.items)) {
      return data.items;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    console.warn('Unexpected cursos API response format:', data);
    return [];
  } catch (error: unknown) {
    console.error('Error al obtener cursos:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error type:', error);
    }
    return [];
  }
};

// Get professors
export const getProfesores = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profesores/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<any[]>(response);
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    throw error;
  }
};

// Get academic units
export const getUnidadesAcademicas = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/unidades-academicas/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<any[]>(response);
  } catch (error) {
    console.error('Error al obtener unidades académicas:', error);
    throw error;
  }
};
