import {
  getAulas as getAulasApi,
  getCursos as getCursosApi,
  getProfesores as getProfesoresApi,
  getUnidadesAcademicas as getUnidadesAcademicasApi,
  getTiposClase as getTiposClaseApi
} from './horariosService';
import type { Aula, Curso, Profesor, UnidadAcademica } from './types';

export const getAulas = async (): Promise<Aula[]> => {
  try {
    const response = await getAulasApi();
    return response || [];
  } catch (error) {
    console.error('Error al obtener aulas:', error);
    return [];
  }
};

export const getCursos = async (): Promise<Curso[]> => {
  try {
    const response = await getCursosApi();
    return response || [];
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return [];
  }
};

export const getProfesores = async (): Promise<Profesor[]> => {
  try {
    const response = await getProfesoresApi();
    return response || [];
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    return [];
  }
};

export const getUnidadesAcademicas = async (): Promise<UnidadAcademica[]> => {
  try {
    const response = await getUnidadesAcademicasApi();
    return response || [];
  } catch (error) {
    console.error('Error al obtener unidades académicas:', error);
    return [];
  }
};

export const getTiposClase = async (): Promise<string[]> => {
  try {
    const response = await getTiposClaseApi();
    return response || [];
  } catch (error) {
    console.error('Error al obtener tipos de clase:', error);
    return [];
  }
};
