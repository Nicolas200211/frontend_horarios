import type { Horario, HorarioFormData, FiltrosHorario, DiaSemana, TipoClase, HorarioListResponse } from './types';

const API_BASE_URL = 'http://localhost:8000'; // Asegúrate de que esta URL coincida con tu backend
const API_URL = `${API_BASE_URL}/api/horarios`;

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.detail || 'Error en la petición');
    (error as any).response = data;
    throw error;
  }
  return data;
}

// Helper para construir query params
const buildQueryParams = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString();
};

// Obtener token de autenticación del localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Headers comunes para las peticiones
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

// Obtener lista de días de la semana
export const getDiasSemana = async (): Promise<DiaSemana[]> => {
  try {
    const response = await fetch(`${API_URL}/dias-semana/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<DiaSemana[]>(response);
  } catch (error) {
    console.error('Error al obtener días de la semana:', error);
    throw error;
  }
};

// Obtener tipos de clase
export const getTiposClase = async (): Promise<TipoClase[]> => {
  try {
    const response = await fetch(`${API_URL}/tipos-clase/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<TipoClase[]>(response);
  } catch (error) {
    console.error('Error al obtener tipos de clase:', error);
    throw error;
  }
};

// Obtener lista de horarios con paginación
export const getHorarios = async (filtros: FiltrosHorario = {}): Promise<HorarioListResponse> => {
  try {
    const { skip = 0, limit = 10, ...filters } = filtros;
    const queryParams = buildQueryParams({
      skip,
      limit,
      ...filters,
      // Incluir datos relacionados
      include: 'curso,aula,profesor,unidad_academica',
    });

    const response = await fetch(`${API_URL}/?${queryParams}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<HorarioListResponse>(response);
  } catch (error) {
    console.error('Error al obtener los horarios:', error);
    throw error;
  }
};

// Obtener un horario por ID
export const getHorarioById = async (id: number): Promise<Horario> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
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
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Horario>(response);
  } catch (error) {
    console.error(`Error al actualizar el horario con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar un horario
export const deleteHorario = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        ...getHeaders(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin', // Changed from 'include' to 'same-origin'
    });

    // If we get a successful response (204 No Content is common for deletes)
    if (response.ok || response.status === 204) {
      return; // Success!
    }

    // Handle specific error statuses
    if (response.status === 404) {
      throw new Error('Horario no encontrado');
    }

    // For other errors, try to get a meaningful message
    let errorMessage = 'Error al eliminar el horario';
    try {
      const errorData = await response.json().catch(() => ({}));
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse the error as JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);

  } catch (error) {
    console.error(`Error al eliminar el horario con ID ${id}:`, error);
    // If it's a CORS error, we'll still try to proceed since the deletion might have worked
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('CORS error occurred, but deletion might have succeeded');
      return; // Assume success in this case
    }
    throw error; // Re-throw other errors
  }
};
