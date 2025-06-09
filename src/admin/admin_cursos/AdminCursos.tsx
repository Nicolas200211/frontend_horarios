import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Spin, Form, Input, InputNumber, Select, Switch, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import type { Curso } from './types';
import { getCursos, createCurso, updateCurso, deleteCurso } from './cursosService';
import { getProfesores } from '../admin_profesores/profesoresService';
import { getUnidadesAcademicas } from '../admin_unidades_academicas/unidadesAcademicasService';
import { showSuccess, showError } from '../../components/notifications/Notifications';

const AdminCursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null) as any;
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<{id: number, nombre: string}[]>([]);
  const [profesores, setProfesores] = useState<{id: number, nombre: string}[]>([]);
  const [form] = Form.useForm();

  const fetchCursos = async () => {
    try {
      console.log('Iniciando carga de cursos...');
      setLoading(true);
      const data = await getCursos();
      console.log('Datos de cursos recibidos:', data);
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al cargar los cursos', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar unidades académicas y profesores desde la API
  const fetchDatosAdicionales = async () => {
    try {
      console.log('Cargando unidades académicas y profesores...');
      
      // Cargar unidades académicas
      const unidadesData = await getUnidadesAcademicas();
      console.log('Unidades académicas cargadas:', unidadesData);
      setUnidadesAcademicas(unidadesData.map((ua: any) => ({
        id: ua.id,
        nombre: ua.nombre
      })));

      // Cargar profesores
      const profesoresData = await getProfesores();
      console.log('Profesores cargados:', profesoresData);
      setProfesores(profesoresData.map((prof: any) => ({
        id: prof.id,
        nombre: `${prof.nombres} ${prof.apellidos}`
      })));
    } catch (error) {
      console.error('Error al cargar datos adicionales:', error);
      showError('Error', 'No se pudieron cargar los datos necesarios. Por favor, intente recargar la página.');
    }
  };

  useEffect(() => {
    console.log('useEffect - Montando componente AdminCursos');
    fetchCursos().catch(error => {
      console.error('Error en fetchCursos:', error);
    });
    fetchDatosAdicionales().catch(error => {
      console.error('Error en fetchDatosAdicionales:', error);
    });
  }, []);

  const handleCreate = () => {
    setCurrentCurso(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (curso: Curso) => {
    setCurrentCurso(curso);
    form.setFieldsValue({
      ...curso,
      unidad_academica_id: curso.unidad_academica?.id,
      profesor_id: curso.profesor?.id
    });
    setModalVisible(true);
  };

  const handleDelete = (curso: Curso) => {
    setCurrentCurso(curso);
    handleConfirmDelete();
  };

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      
      if (currentCurso) {
        await updateCurso(currentCurso.id, values);
        showSuccess('Curso actualizado', 'El curso se ha actualizado correctamente');
      } else {
        await createCurso(values);
        showSuccess('Curso creado', 'El curso se ha creado correctamente');
      }
      
      setModalVisible(false);
      fetchCursos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al guardar el curso', errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentCurso) return;
    
    Modal.confirm({
      title: '¿Está seguro que desea eliminar este curso?',
      icon: <ExclamationCircleFilled />,
      content: `El curso "${currentCurso.nombre}" será eliminado permanentemente.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteCurso(currentCurso.id);
          showSuccess('Curso eliminado', 'El curso se ha eliminado correctamente');
          fetchCursos();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          showError('Error al eliminar el curso', errorMessage);
        }
      },
    });
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
      title: 'Créditos',
      dataIndex: 'creditos',
      key: 'creditos',
      align: 'center' as const,
    },
    {
      title: 'Horas',
      key: 'horas',
      render: (record: Curso) => (
        <span>{record.horas_teoria} T / {record.horas_practica} P</span>
      ),
      align: 'center' as const,
    },
    {
      title: 'Unidad Académica',
      key: 'unidad_academica',
      render: (record: Curso) => record.unidad_academica?.nombre,
    },
    {
      title: 'Profesor',
      key: 'profesor',
      render: (record: Curso) => `${record.profesor?.nombres} ${record.profesor?.apellidos}`,
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Tag color={activo ? 'green' : 'red'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
      align: 'center' as const,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Curso) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Editar"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Eliminar"
          />
        </Space>
      ),
      align: 'center' as const,
    },
  ];



  return (
    <div className="admin-cursos">
      <Card
        title="Gestión de Cursos"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Nuevo Curso
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={cursos}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
      </Card>

<Modal
        title={currentCurso ? 'Editar Curso' : 'Nuevo Curso'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ activo: true }}
        >
          <Form.Item
            name="codigo"
            label="Código"
            rules={[{ required: true, message: 'Por favor ingrese el código del curso' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del curso' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="descripcion"
            label="Descripción"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item
            name="creditos"
            label="Créditos"
            rules={[{ required: true, message: 'Por favor ingrese los créditos' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="horas_teoria"
            label="Horas Teoría"
            rules={[{ required: true, message: 'Por favor ingrese las horas de teoría' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="horas_practica"
            label="Horas Práctica"
            rules={[{ required: true, message: 'Por favor ingrese las horas de práctica' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="unidad_academica_id"
            label="Unidad Académica"
            rules={[{ required: true, message: 'Por favor seleccione la unidad académica' }]}
          >
            <Select placeholder="Seleccione una unidad académica">
              {unidadesAcademicas.map(u => (
                <Select.Option key={u.id} value={u.id}>
                  {u.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="profesor_id"
            label="Profesor"
            rules={[{ required: true, message: 'Por favor seleccione el profesor' }]}
          >
            <Select placeholder="Seleccione un profesor">
              {profesores.map(p => (
                <Select.Option key={p.id} value={p.id}>
                  {p.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="activo"
            label="Activo"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCursos;
