import React from 'react';
import { Form, TimePicker, Select } from 'antd';

interface HorarioFormProps {
  form: any;
  aulas: any[];
  cursos: any[];
  profesores: any[];
  unidadesAcademicas: any[];
  diasSemana: string[];
  tiposClase: string[];
  loading?: boolean;
}

export const HorarioForm: React.FC<HorarioFormProps> = ({
  form,
  aulas,
  cursos,
  profesores,
  unidadesAcademicas,
  diasSemana,
  tiposClase,
  loading = false
}) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="aula_id"
        label="Aula"
        rules={[{ required: true, message: 'Por favor selecciona un aula' }]}
      >
        <Select
          placeholder="Selecciona un aula"
          loading={loading}
          options={aulas.map(aula => ({
            value: aula.id,
            label: `${aula.codigo} - ${aula.nombre}`
          }))}
        />
      </Form.Item>

      <Form.Item
        name="curso_id"
        label="Curso"
        rules={[{ required: true, message: 'Por favor selecciona un curso' }]}
      >
        <Select
          placeholder="Selecciona un curso"
          loading={loading}
          options={cursos.map(curso => ({
            value: curso.id,
            label: `${curso.codigo} - ${curso.nombre}`
          }))}
        />
      </Form.Item>

      <Form.Item
        name="profesor_id"
        label="Profesor"
        rules={[{ required: true, message: 'Por favor selecciona un profesor' }]}
      >
        <Select
          placeholder="Selecciona un profesor"
          loading={loading}
          options={profesores.map(prof => ({
            value: prof.id,
            label: `${prof.nombres} ${prof.apellidos}`
          }))}
        />
      </Form.Item>

      <Form.Item
        name="unidad_academica_id"
        label="Unidad Académica"
        rules={[{ required: true, message: 'Por favor selecciona una unidad académica' }]}
      >
        <Select
          placeholder="Selecciona una unidad académica"
          loading={loading}
          options={unidadesAcademicas.map(ua => ({
            value: ua.id,
            label: `${ua.codigo} - ${ua.nombre}`
          }))}
        />
      </Form.Item>

      <Form.Item
        name="dia"
        label="Día de la semana"
        rules={[{ required: true, message: 'Por favor selecciona un día' }]}
      >
        <Select
          placeholder="Selecciona un día"
          loading={loading}
          options={diasSemana.map(dia => ({
            value: dia,
            label: dia
          }))}
        />
      </Form.Item>

      <Form.Item
        name="hora_inicio"
        label="Hora de inicio"
        rules={[{ required: true, message: 'Por favor selecciona la hora de inicio' }]}
      >
        <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
      </Form.Item>

      <Form.Item
        name="hora_fin"
        label="Hora de fin"
        rules={[{ required: true, message: 'Por favor selecciona la hora de fin' }]}
      >
        <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
      </Form.Item>

      <Form.Item
        name="tipo_clase"
        label="Tipo de clase"
        rules={[{ required: true, message: 'Por favor selecciona el tipo de clase' }]}
      >
        <Select
          placeholder="Selecciona el tipo de clase"
          loading={loading}
          options={tiposClase.map(tipo => ({
            value: tipo,
            label: tipo
          }))}
        />
      </Form.Item>
    </Form>
  );
};
