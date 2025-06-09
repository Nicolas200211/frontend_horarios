import type { FormItemProps } from 'antd';

export interface UnidadAcademica {
  id: number;
  nombre: string;
  codigo: string;
}

export interface Profesor {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  creditos: number;
  horas_teoria: number;
  horas_practica: number;
  unidad_academica_id: number;
  profesor_id: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  unidad_academica: UnidadAcademica;
  profesor: Profesor;
}

export interface CursoFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  creditos: number;
  horas_teoria: number;
  horas_practica: number;
  unidad_academica_id: number;
  profesor_id: number;
  activo: boolean;
}

export const formItems: FormItemProps[] = [
  {
    name: 'codigo',
    label: 'Código',
    rules: [{ required: true, message: 'Por favor ingrese el código del curso' }],
  },
  {
    name: 'nombre',
    label: 'Nombre',
    rules: [{ required: true, message: 'Por favor ingrese el nombre del curso' }],
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    valuePropName: 'value',
  },
  {
    name: 'creditos',
    label: 'Créditos',
    rules: [{ required: true, message: 'Por favor ingrese los créditos' }],
    valuePropName: 'value',
  },
  {
    name: 'horas_teoria',
    label: 'Horas Teoría',
    rules: [{ required: true, message: 'Por favor ingrese las horas de teoría' }],
    valuePropName: 'value',
  },
  {
    name: 'horas_practica',
    label: 'Horas Práctica',
    rules: [{ required: true, message: 'Por favor ingrese las horas de práctica' }],
    valuePropName: 'value',
  },
  {
    name: 'unidad_academica_id',
    label: 'Unidad Académica',
    rules: [{ required: true, message: 'Por favor seleccione la unidad académica' }],
    valuePropName: 'value',
  },
  {
    name: 'profesor_id',
    label: 'Profesor',
    rules: [{ required: true, message: 'Por favor seleccione el profesor' }],
    valuePropName: 'value',
  },
  {
    name: 'activo',
    label: 'Activo',
    valuePropName: 'checked',
  },
];
