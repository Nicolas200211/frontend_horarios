import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm, 
  Card, 
  Typography 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { 
  getUnidadesAcademicas, 
  createUnidadAcademica, 
  updateUnidadAcademica, 
  deleteUnidadAcademica,
  type UnidadAcademica 
} from './unidadesAcademicasService';

const { Title } = Typography;

const AdminUnidadesAcademicas: React.FC = () => {
  const [unidades, setUnidades] = useState<UnidadAcademica[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingUnidad, setEditingUnidad] = useState<UnidadAcademica | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUnidadesAcademicas();
  }, []);

  const fetchUnidadesAcademicas = async () => {
    console.log('Iniciando fetchUnidadesAcademicas');
    try {
      setLoading(true);
      console.log('Obteniendo datos de la API...');
      const data = await getUnidadesAcademicas();
      console.log('Datos recibidos:', data);
      setUnidades(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en fetchUnidadesAcademicas:', error);
      message.error(`Error al cargar las unidades académicas: ${errorMessage}`);
      setUnidades([]); // Asegurarse de que siempre haya un array
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingUnidad(null);
    setModalVisible(true);
  };

  const handleEdit = (record: UnidadAcademica) => {
    form.setFieldsValue(record);
    setEditingUnidad(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUnidadAcademica(id);
      message.success('Unidad académica eliminada correctamente');
      fetchUnidadesAcademicas();
    } catch (error) {
      message.error('Error al eliminar la unidad académica');
      console.error('Error:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUnidad) {
        await updateUnidadAcademica(editingUnidad.id!, values);
        message.success('Unidad académica actualizada correctamente');
      } else {
        await createUnidadAcademica(values);
        message.success('Unidad académica creada correctamente');
      }
      
      setModalVisible(false);
      fetchUnidadesAcademicas();
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        message.error(`Error: ${error.message}`);
      }
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
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: UnidadAcademica) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Estás seguro de eliminar esta unidad académica?"
            onConfirm={() => handleDelete(record.id!)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0">Unidades Académicas</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          Nueva Unidad
        </Button>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={unidades} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUnidad ? 'Editar Unidad Académica' : 'Nueva Unidad Académica'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editingUnidad || {}}
        >
          <Form.Item
            name="codigo"
            label="Código"
            rules={[
              { required: true, message: 'Por favor ingrese el código' },
              { max: 10, message: 'Máximo 10 caracteres' }
            ]}
          >
            <Input placeholder="Ej: CC" />
          </Form.Item>
          
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[
              { required: true, message: 'Por favor ingrese el nombre' },
              { max: 100, message: 'Máximo 100 caracteres' }
            ]}
          >
            <Input placeholder="Ej: Colegio Cybernet" />
          </Form.Item>
          
          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ max: 500, message: 'Máximo 500 caracteres' }]}
          >
            <Input.TextArea rows={4} placeholder="Descripción de la unidad académica" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUnidadesAcademicas;
