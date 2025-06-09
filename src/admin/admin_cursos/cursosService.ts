import type { Curso, CursoFormData } from './types';
import { API_BASE_URL } from '../../config';
import { getAuthToken } from '../../utils/auth';

const API_URL = `${API_BASE_URL}/api/cursos`;

export const getCursos = async (): Promise<Curso[]> => {
  try {
    console.log('Obteniendo token de autenticación...');
    const token = getAuthToken();
    console.log('Token obtenido:', token ? '***' : 'No hay token');
    
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }

    console.log('Realizando petición a:', API_URL);
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Respuesta recibida, estado:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Error al procesar la respuesta del servidor'
      }));
      console.error('Error en la respuesta:', errorData);
      throw new Error(errorData.detail || errorData.message || 'Error al obtener los cursos');
    }

    const data = await response.json();
    console.log('Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error en getCursos:', error);
    throw error;
  }
};

export const createCurso = async (curso: CursoFormData): Promise<Curso> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(curso),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al crear el curso');
  }

  return response.json();
};

export const updateCurso = async (id: number, curso: CursoFormData): Promise<Curso> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(curso),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Error al actualizar el curso');
  }

  return response.json();
};

export const deleteCurso = async (id: number): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Error al eliminar el curso');
  }
};
