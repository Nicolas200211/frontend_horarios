export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
export type TipoClase = 'Teoría' | 'Práctica' | 'Laboratorio' | 'Otro';

export interface Aula {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Profesor {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface UnidadAcademica {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Horario {
  id: number;
  aula_id: number;
  curso_id: number;
  profesor_id: number;
  unidad_academica_id: number;
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  tipo_clase: TipoClase;
  fecha_creacion: string;
  fecha_actualizacion: string;
  aula?: Aula;
  curso?: Curso;
  profesor?: Profesor;
  unidad_academica?: UnidadAcademica;
}

export interface HorarioFormData {
  aula_id: number;
  curso_id: number;
  profesor_id: number;
  unidad_academica_id: number;
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  tipo_clase: TipoClase;
}

export interface FiltrosHorario {
  profesor_id?: number;
  curso_id?: number;
  aula_id?: number;
  dia?: string;
  unidad_academica_id?: number;
  skip?: number;
  limit?: number;
}

export interface HorarioListResponse {
  items: Horario[];
  total: number;
  skip: number;
  limit: number;
}
