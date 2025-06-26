import { Dayjs } from 'dayjs';

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
export type TipoClase = 'Teoría' | 'Práctica' | 'Laboratorio' | 'Otro';

export interface Aula {
  id: number;
  codigo: string;
  nombre: string;
  capacidad?: number;
  tipo?: string;
  activo?: boolean;
  unidad_academica_id?: number;
}

export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  creditos?: number;
  horas_teoria?: number;
  horas_practica?: number;
  activo?: boolean;
  unidad_academica_id?: number;
  profesor_id?: number;
}

export interface Profesor {
  id: number;
  nombres: string;
  apellidos: string;
  email?: string;
  genero?: string;
  activo?: boolean;
  unidad_academica_id?: number;
}

export interface UnidadAcademica {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Horario {
  id: number;
  fecha_clase: string;  // YYYY-MM-DD
  aula_id: number;
  curso_id: number;
  profesor_id: number;
  unidad_academica_id: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_clase: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  aula?: Aula;
  curso?: Curso;
  profesor?: Profesor;
  unidad_academica?: UnidadAcademica;
}

export interface HorarioFormData {
  aula_id: number | string;
  curso_id: number | string;
  profesor_id: number | string;
  unidad_academica_id: number | string;
  fecha_clase: string; // YYYY-MM-DD
  hora_inicio: string | Date | undefined;
  hora_fin: string | Date | undefined;
  tipo_clase: string;
  dia?: string;
  [key: string]: any; // Add index signature for dynamic properties
}

export interface HorarioFormValues {
  id?: number;
  aula_id?: number | string;
  curso_id?: number | string;
  profesor_id?: number | string;
  unidad_academica_id?: number | string;
  fecha_clase?: Dayjs | null;
  hora_inicio?: string | Date | undefined;
  hora_fin?: string | Date | undefined;
  tipo_clase?: string;
  dia?: string;
  [key: string]: any; // For any additional properties
}

export interface FiltrosHorario {
  profesor_id?: number | string;
  curso_id?: number | string;
  aula_id?: number | string;
  fecha_clase?: string; // YYYY-MM-DD
  dia?: string;
  unidad_academica_id?: number | string;
  skip?: number;
  limit?: number;
}

export interface HorarioListResponse {
  items: Horario[];
  total: number;
  skip: number;
  limit: number;
}
