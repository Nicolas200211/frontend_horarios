import type { FormItemProps } from 'antd';

export interface UnidadAcademica {
  id?: number;
  nombre: string;
  codigo: string;
}

export interface Curso {
  id: number;
  nombre: string;
  codigo: string;
}

export interface Profesor {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface Aula {
  id: number;
  codigo: string;
  nombre: string;
  capacidad: number;
  tipo: 'Teoría' | 'Laboratorio' | 'Taller' | 'Otro';
  unidad_academica_id: number;
  curso_id: number | null;
  profesor_id: number | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  unidad_academica: UnidadAcademica;
  curso: Curso | null;
  profesor: Profesor | null;
}

export interface AulaFormData {
  codigo: string;
  nombre: string;
  capacidad: number;
  tipo: 'Teoría' | 'Laboratorio' | 'Taller' | 'Otro';
  unidad_academica_id: number;
  curso_id?: number | null;
  profesor_id?: number | null;
  activo: boolean;
}

export const formItems: FormItemProps[] = [
  {
    name: 'codigo',
    label: 'Código',
    rules: [{ required: true, message: 'Por favor ingrese el código del aula' }],
  },
  {
    name: 'nombre',
    label: 'Nombre',
    rules: [{ required: true, message: 'Por favor ingrese el nombre del aula' }],
  },
  {
    name: 'capacidad',
    label: 'Capacidad',
    rules: [
      { required: true, message: 'Por favor ingrese la capacidad' },
      { type: 'number', min: 1, message: 'La capacidad debe ser mayor a 0' },
    ],
  },
  {
    name: 'tipo',
    label: 'Tipo de Aula',
    rules: [{ required: true, message: 'Por favor seleccione el tipo de aula' }],
  },
  {
    name: 'unidad_academica_id',
    label: 'Unidad Académica',
    rules: [{ required: true, message: 'Por favor seleccione la unidad académica' }],
  },
  {
    name: 'curso_id',
    label: 'Curso (Opcional)',
  },
  {
    name: 'profesor_id',
    label: 'Profesor (Opcional)',
  },
  {
    name: 'activo',
    label: 'Activo',
    valuePropName: 'checked',
  },
];
