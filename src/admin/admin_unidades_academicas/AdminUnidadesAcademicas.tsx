import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  Typography, 
  message 
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
import EditModal from '../../components/modals/EditModal';
import ConfirmDelete from '../../components/modals/ConfirmDelete';

const { Title } = Typography;

const AdminUnidadesAcademicas: React.FC = () => {
  const [unidades, setUnidades] = useState<UnidadAcademica[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState<boolean>(false);
  const [editingUnidad, setEditingUnidad] = useState<UnidadAcademica | null>(null);
  const [unidadToDelete, setUnidadToDelete] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Partial<UnidadAcademica>>({});

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
    setFormValues({});
    setEditingUnidad(null);
    setModalVisible(true);
  };

  const handleEdit = (record: UnidadAcademica) => {
    setFormValues(record);
    setEditingUnidad(record);
    setModalVisible(true);
  };

  const handleDeleteClick = (id: number) => {
    setUnidadToDelete(id);
    setConfirmDeleteVisible(true);
  };

  const handleDelete = async () => {
    if (!unidadToDelete) return;
    
    try {
      await deleteUnidadAcademica(unidadToDelete);
      message.success('Unidad académica eliminada correctamente');
      fetchUnidadesAcademicas();
    } catch (error) {
      message.error('Error al eliminar la unidad académica');
      console.error('Error:', error);
    } finally {
      setConfirmDeleteVisible(false);
      setUnidadToDelete(null);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
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

  const formFields = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text' as const,
      placeholder: 'Ej: CC',
      required: true
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      placeholder: 'Ej: Colegio Cybernet',
      required: true
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'text' as const,
      placeholder: 'Descripción de la unidad académica',
      required: false
    }
  ];

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
            aria-label="Editar"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteClick(record.id!)}
            aria-label="Eliminar"
          />
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

      <EditModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSubmit}
        title={editingUnidad ? 'Editar Unidad Académica' : 'Nueva Unidad Académica'}
        fields={formFields}
        initialValues={formValues}
        loading={loading}
      />

      <ConfirmDelete
        show={confirmDeleteVisible}
        onHide={() => setConfirmDeleteVisible(false)}
        onConfirm={handleDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar esta unidad académica? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default AdminUnidadesAcademicas;
