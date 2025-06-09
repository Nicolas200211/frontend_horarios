import type { Profesor, ProfesorFormData, UnidadAcademica } from './types';

const API_URL = 'http://localhost:8000/api/profesores/';

// Interfaz para la respuesta del servidor que incluye la unidad académica
interface ProfesorResponse extends Omit<Profesor, 'unidad_academica'> {
  unidad_academica?: UnidadAcademica;
}

export const getProfesores = async (): Promise<Profesor[]> => {
  const response = await fetch(`${API_URL}?include=unidad_academica`);
  if (!response.ok) {
    throw new Error('Error al obtener la lista de profesores');
  }
  const data: ProfesorResponse[] = await response.json();
  
  // Mapear la respuesta para asegurar que la estructura sea consistente
  return data.map(profesor => ({
    ...profesor,
    unidad_academica: profesor.unidad_academica || undefined
  }));
};

export const createProfesor = async (profesor: ProfesorFormData): Promise<Profesor> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profesor),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear el profesor');
  }
  return response.json();
};

export const updateProfesor = async (id: number, profesor: ProfesorFormData): Promise<Profesor> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profesor),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar el profesor');
  }
  return response.json();
};

export const deleteProfesor = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar el profesor');
  }
};
