import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Spin, Form, Select, TimePicker, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Horario } from './types';
import { getHorarios, createHorario, updateHorario, deleteHorario } from './horariosService';
import { getAulas } from '../admin_aulas/aulasService';
import { getCursos } from '../admin_cursos/cursosService';
import { getProfesores } from '../admin_profesores/profesoresService';
import { getUnidadesAcademicas } from '../admin_unidades_academicas/unidadesAcademicasService';
import { showSuccess, showError } from '../../components/notifications/Notifications';

const { confirm } = Modal;
const { Option } = Select;

const diasSemana = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const tiposClase = [
  'Teoría',
  'Práctica',
  'Laboratorio',
  'Taller',
  'Seminario',
  'Otro',
];

const AdminHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentHorario, setCurrentHorario] = useState<Horario | null>(null);
  const [aulas, setAulas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetchHorarios = async () => {
    try {
      setLoading(true);
      const data = await getHorarios();
      setHorarios(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al cargar los horarios', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatosAdicionales = async () => {
    try {
      const [aulasData, cursosData, profesoresData, unidadesData] = await Promise.all([
        getAulas(),
        getCursos(),
        getProfesores(),
        getUnidadesAcademicas(),
      ]);

      setAulas(aulasData);
      setCursos(cursosData);
      setProfesores(profesoresData);
      setUnidadesAcademicas(unidadesData);
    } catch (error) {
      console.error('Error al cargar datos adicionales:', error);
      showError('Error', 'No se pudieron cargar los datos adicionales necesarios');
    }
  };

  useEffect(() => {
    fetchHorarios();
    fetchDatosAdicionales();
  }, []);

  const handleAddHorario = () => {
    setCurrentHorario(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditHorario = (horario: Horario) => {
    setCurrentHorario(horario);
    form.setFieldsValue({
      aula_id: horario.aula_id,
      curso_id: horario.curso_id,
      profesor_id: horario.profesor_id,
      unidad_academica_id: horario.unidad_academica_id,
      dia: horario.dia,
      hora_inicio: dayjs(horario.hora_inicio, 'HH:mm:ss'),
      hora_fin: dayjs(horario.hora_fin, 'HH:mm:ss'),
      tipo_clase: horario.tipo_clase,
    });
    setModalVisible(true);
  };

  const handleDeleteHorario = (id: number) => {
    confirm({
      title: '¿Está seguro de eliminar este horario?',
      icon: <ExclamationCircleFilled />,
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteHorario(id);
          await fetchHorarios();
          showSuccess('Horario eliminado', 'El horario ha sido eliminado correctamente');
        } catch (error) {
          console.error('Error al eliminar el horario:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          showError('Error al eliminar el horario', errorMessage);
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const horarioData = {
        ...values,
        hora_inicio: values.hora_inicio.format('HH:mm:ss'),
        hora_fin: values.hora_fin.format('HH:mm:ss'),
      };

      if (currentHorario) {
        await updateHorario(currentHorario.id, horarioData);
        showSuccess('Horario actualizado', 'El horario ha sido actualizado correctamente');
      } else {
        await createHorario(horarioData);
        showSuccess('Horario creado', 'El horario ha sido creado correctamente');
      }

      setModalVisible(false);
      await fetchHorarios();
    } catch (error) {
      console.error('Error al guardar el horario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al guardar el horario', errorMessage);
    }
  };

  const columns = [
    {
      title: 'Aula',
      key: 'aula',
      render: (_: any, record: Horario) => `${record.aula.codigo} - ${record.aula.nombre}`,
    },
    {
      title: 'Curso',
      key: 'curso',
      render: (_: any, record: Horario) => `${record.curso.codigo} - ${record.curso.nombre}`,
    },
    {
      title: 'Profesor',
      key: 'profesor',
      render: (_: any, record: Horario) => `${record.profesor.nombres} ${record.profesor.apellidos}`,
    },
    {
      title: 'Día',
      dataIndex: 'dia',
      key: 'dia',
    },
    {
      title: 'Hora Inicio',
      dataIndex: 'hora_inicio',
      key: 'hora_inicio',
    },
    {
      title: 'Hora Fin',
      dataIndex: 'hora_fin',
      key: 'hora_fin',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_clase',
      key: 'tipo_clase',
      render: (tipo: string) => (
        <Tag color={tipo === 'Teoría' ? 'blue' : tipo === 'Práctica' ? 'green' : 'orange'}>
          {tipo}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center' as const,
      render: (_: any, record: Horario) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditHorario(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteHorario(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-horarios">
      <Card
        title="Gestión de Horarios"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddHorario}
          >
            Nuevo Horario
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={horarios}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
      </Card>

      <Modal
        title={currentHorario ? 'Editar Horario' : 'Nuevo Horario'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={currentHorario ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            tipo_clase: 'Teoría',
          }}
        >
          <Form.Item
            name="unidad_academica_id"
            label="Unidad Académica"
            rules={[{ required: true, message: 'Por favor seleccione una unidad académica' }]}
          >
            <Select placeholder="Seleccione una unidad académica" showSearch optionFilterProp="children">
              {unidadesAcademicas.map((unidad) => (
                <Option key={unidad.id} value={unidad.id}>
                  {unidad.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="aula_id"
            label="Aula"
            rules={[{ required: true, message: 'Por favor seleccione un aula' }]}
          >
            <Select placeholder="Seleccione un aula" showSearch optionFilterProp="children">
              {aulas.map((aula) => (
                <Option key={aula.id} value={aula.id}>
                  {aula.codigo} - {aula.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="curso_id"
            label="Curso"
            rules={[{ required: true, message: 'Por favor seleccione un curso' }]}
          >
            <Select placeholder="Seleccione un curso" showSearch optionFilterProp="children">
              {cursos.map((curso) => (
                <Option key={curso.id} value={curso.id}>
                  {curso.codigo} - {curso.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="profesor_id"
            label="Profesor"
            rules={[{ required: true, message: 'Por favor seleccione un profesor' }]}
          >
            <Select placeholder="Seleccione un profesor" showSearch optionFilterProp="children">
              {profesores.map((profesor) => (
                <Option key={profesor.id} value={profesor.id}>
                  {profesor.nombres} {profesor.apellidos}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dia"
            label="Día de la semana"
            rules={[{ required: true, message: 'Por favor seleccione un día' }]}
          >
            <Select placeholder="Seleccione un día">
              {diasSemana.map((dia) => (
                <Option key={dia} value={dia}>
                  {dia}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="hora_inicio"
            label="Hora de inicio"
            rules={[{ required: true, message: 'Por favor seleccione la hora de inicio' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="hora_fin"
            label="Hora de fin"
            rules={[{ required: true, message: 'Por favor seleccione la hora de fin' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="tipo_clase"
            label="Tipo de clase"
            rules={[{ required: true, message: 'Por favor seleccione el tipo de clase' }]}
          >
            <Select>
              {tiposClase.map((tipo) => (
                <Option key={tipo} value={tipo}>
                  {tipo}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminHorarios;
