import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Spin, Form, Input, InputNumber, Select, Switch, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import type { Aula, UnidadAcademica, Curso, Profesor } from './types';
import { getAulas, createAula, updateAula, deleteAula } from './aulasService';
import { getUnidadesAcademicas } from '../admin_unidades_academicas/unidadesAcademicasService';
import { getCursos } from '../admin_cursos/cursosService';
import { getProfesores } from '../admin_profesores/profesoresService';
import { showSuccess, showError } from '../../components/notifications/Notifications';

const { confirm } = Modal;
const { Option } = Select;

const AdminAulas: React.FC = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentAula, setCurrentAula] = useState<Aula | null>(null);
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [form] = Form.useForm();

  const fetchAulas = async () => {
    try {
      setLoading(true);
      const data = await getAulas();
      setAulas(data);
    } catch (error) {
      console.error('Error al cargar aulas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al cargar las aulas', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatosAdicionales = async () => {
    try {
      // Cargar unidades académicas
      const unidadesData = await getUnidadesAcademicas();
      setUnidadesAcademicas(unidadesData);

      // Cargar cursos
      const cursosData = await getCursos();
      setCursos(cursosData);

      // Cargar profesores
      const profesoresData = await getProfesores();
      setProfesores(profesoresData);
    } catch (error) {
      console.error('Error al cargar datos adicionales:', error);
      showError('Error', 'No se pudieron cargar los datos adicionales necesarios');
    }
  };

  useEffect(() => {
    fetchAulas();
    fetchDatosAdicionales();
  }, []);

  const handleAddAula = () => {
    setCurrentAula(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditAula = (aula: Aula) => {
    setCurrentAula(aula);
    form.setFieldsValue({
      ...aula,
      curso_id: aula.curso_id || undefined,
      profesor_id: aula.profesor_id || undefined,
    });
    setModalVisible(true);
  };

  const handleDeleteAula = (id: number) => {
    confirm({
      title: '¿Está seguro de eliminar este aula?',
      icon: <ExclamationCircleFilled />,
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteAula(id);
          await fetchAulas();
          showSuccess('Aula eliminada', 'El aula ha sido eliminada correctamente');
        } catch (error) {
          console.error('Error al eliminar el aula:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          showError('Error al eliminar el aula', errorMessage);
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (currentAula) {
        await updateAula(currentAula.id, values);
        showSuccess('Aula actualizada', 'El aula ha sido actualizada correctamente');
      } else {
        await createAula(values);
        showSuccess('Aula creada', 'El aula ha sido creada correctamente');
      }
      
      setModalVisible(false);
      await fetchAulas();
    } catch (error) {
      console.error('Error al guardar el aula:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al guardar el aula', errorMessage);
    }
  };

  const columns = [
    {
      title: 'Código',
      dataIndex: 'codigo',
      key: 'codigo',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => (
        <Tag color={tipo === 'Laboratorio' ? 'blue' : tipo === 'Taller' ? 'green' : 'orange'}>
          {tipo}
        </Tag>
      ),
    },
    {
      title: 'Capacidad',
      dataIndex: 'capacidad',
      key: 'capacidad',
      align: 'center' as const,
    },
    {
      title: 'Unidad Académica',
      key: 'unidad_academica',
      render: (_: any, record: Aula) => record.unidad_academica?.nombre,
    },
    {
      title: 'Curso',
      key: 'curso',
      render: (_: any, record: Aula) => record.curso?.nombre || '-',
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      align: 'center' as const,
      render: (activo: boolean) => (
        <Tag color={activo ? 'green' : 'red'}>{activo ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center' as const,
      render: (_: any, record: Aula) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditAula(record);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAula(record.id);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-aulas">
      <Card
        title="Gestión de Aulas"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAula}
          >
            Nueva Aula
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={aulas}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Spin>
      </Card>

      <Modal
        title={currentAula ? 'Editar Aula' : 'Nueva Aula'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText={currentAula ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            activo: true,
            tipo: 'Teoría',
          }}
        >
          <Form.Item
            name="codigo"
            label="Código"
            rules={[{ required: true, message: 'Por favor ingrese el código del aula' }]}
          >
            <Input placeholder="Ej: AULA-101" />
          </Form.Item>

          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del aula' }]}
          >
            <Input placeholder="Ej: Laboratorio de Informática 1" />
          </Form.Item>

          <Form.Item
            name="capacidad"
            label="Capacidad"
            rules={[
              { required: true, message: 'Por favor ingrese la capacidad' },
              { type: 'number', min: 1, message: 'La capacidad debe ser mayor a 0' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo de Aula"
            rules={[{ required: true, message: 'Por favor seleccione el tipo de aula' }]}
          >
            <Select>
              <Option value="Teoría">Teoría</Option>
              <Option value="Laboratorio">Laboratorio</Option>
              <Option value="Taller">Taller</Option>
              <Option value="Otro">Otro</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="unidad_academica_id"
            label="Unidad Académica"
            rules={[{ required: true, message: 'Por favor seleccione la unidad académica' }]}
          >
            <Select loading={unidadesAcademicas.length === 0}>
              {unidadesAcademicas.map((ua) => (
                <Option key={ua.id} value={ua.id}>
                  {ua.nombre} ({ua.codigo})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="curso_id" label="Curso (Opcional)">
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                if (!option || !option.children) return false;
                return String(option.children).toLowerCase().includes(input.toLowerCase());
              }}
              loading={cursos.length === 0}
            >
              {cursos.map((curso) => (
                <Option key={curso.id} value={curso.id}>
                  {curso.nombre} ({curso.codigo})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="profesor_id" label="Profesor (Opcional)">
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                if (!option || !option.children) return false;
                return String(option.children).toLowerCase().includes(input.toLowerCase());
              }}
              loading={profesores.length === 0}
            >
              {profesores.map((profesor) => (
                <Option key={profesor.id} value={profesor.id}>
                  {profesor.nombres} {profesor.apellidos}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="activo" valuePropName="checked" label="Activo">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAulas;
