import type { Aula, AulaFormData } from './types';
import { API_BASE_URL } from '../../config';
import { getAuthToken } from '../../utils/auth';

const API_URL = `${API_BASE_URL}/api/aulas`;

export const getAulas = async (): Promise<Aula[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }

    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Error al procesar la respuesta del servidor'
      }));
      throw new Error(errorData.detail || errorData.message || 'Error al obtener las aulas');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error en getAulas:', error);
    throw error;
  }
};

export const createAula = async (aula: AulaFormData): Promise<Aula> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No se encontró el token de autenticación');
  }
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(aula),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error al procesar la respuesta del servidor'
    }));
    throw new Error(errorData.detail || errorData.message || 'Error al crear el aula');
  }

  return response.json();
};

export const updateAula = async (id: number, aula: AulaFormData): Promise<Aula> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No se encontró el token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(aula),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error al procesar la respuesta del servidor'
    }));
    throw new Error(errorData.detail || errorData.message || 'Error al actualizar el aula');
  }

  return response.json();
};

export const deleteAula = async (id: number): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No se encontró el token de autenticación');
  }
  
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Error al procesar la respuesta del servidor'
    }));
    throw new Error(errorData.detail || errorData.message || 'Error al eliminar el aula');
  }
};
