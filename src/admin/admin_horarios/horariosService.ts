import type { Horario, HorarioResponse } from './types';
import { API_BASE_URL } from '../../config';

export const getHorarios = async (): Promise<Horario[]> => {
  const response = await fetch(`${API_BASE_URL}/api/horarios/`);
  if (!response.ok) {
    throw new Error('Error al cargar los horarios');
  }
  const data: HorarioResponse = await response.json();
  return data.items;
};

export const createHorario = async (horarioData: Omit<Horario, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'aula' | 'curso' | 'profesor' | 'unidad_academica'>): Promise<Horario> => {
  const response = await fetch(`${API_BASE_URL}/api/horarios/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(horarioData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al crear el horario');
  }
  
  return response.json();
};

export const updateHorario = async (id: number, horarioData: Partial<Horario>): Promise<Horario> => {
  const response = await fetch(`${API_BASE_URL}/api/horarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(horarioData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al actualizar el horario');
  }
  
  return response.json();
};

export const deleteHorario = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/horarios/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al eliminar el horario');
  }
};
