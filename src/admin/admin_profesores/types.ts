export interface UnidadAcademica {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

export interface Profesor {
  id: number;
  nombres: string;
  apellidos: string;
  genero: 'M' | 'F' | 'O';
  activo: boolean;
  unidad_academica_id: number;
  unidad_academica?: UnidadAcademica;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ProfesorFormData extends Omit<Profesor, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'unidad_academica'> {
  unidad_academica_id: number;
}

export const generoOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
];
