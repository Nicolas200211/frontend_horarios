export interface Horario {
  id: number;
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
  aula: {
    id: number;
    codigo: string;
    nombre: string;
  };
  curso: {
    id: number;
    codigo: string;
    nombre: string;
  };
  profesor: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  unidad_academica: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

export interface HorarioFormData {
  aula_id: number | undefined;
  curso_id: number | undefined;
  profesor_id: number | undefined;
  unidad_academica_id: number | undefined;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_clase: string;
}

export interface HorarioResponse {
  items: Horario[];
  total: number;
  skip: number;
  limit: number;
}
