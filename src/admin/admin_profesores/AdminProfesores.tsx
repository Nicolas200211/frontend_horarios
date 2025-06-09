import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Spin, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Profesor, ProfesorFormData } from './types';
import { generoOptions } from './types';
import { getProfesores, createProfesor, updateProfesor, deleteProfesor } from './profesoresService';
import EditModal from '../../components/modals/EditModal';
import ConfirmDelete from '../../components/modals/ConfirmDelete';
import { showSuccess, showError } from '../../components/notifications/Notifications';

const AdminProfesores: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [currentProfesor, setCurrentProfesor] = useState<Profesor | null>(null);
  const [form] = Form.useForm();

  const fetchProfesores = async () => {
    try {
      setLoading(true);
      const data = await getProfesores();
      setProfesores(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al cargar los profesores', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  const handleCreate = () => {
    setCurrentProfesor(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (profesor: Profesor) => {
    setCurrentProfesor(profesor);
    form.setFieldsValue({
      ...profesor,
    });
    setModalVisible(true);
  };

  const handleDelete = (profesor: Profesor) => {
    setCurrentProfesor(profesor);
    setDeleteModalVisible(true);
  };

  const handleSubmit = async (values: ProfesorFormData) => {
    try {
      if (currentProfesor) {
        await updateProfesor(currentProfesor.id, values);
        showSuccess('Profesor actualizado exitosamente');
      } else {
        await createProfesor(values);
        showSuccess('Profesor creado exitosamente');
      }
      setModalVisible(false);
      fetchProfesores();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al guardar el profesor', errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentProfesor) return;
    
    try {
      await deleteProfesor(currentProfesor.id);
      showSuccess('Profesor eliminado exitosamente');
      setDeleteModalVisible(false);
      fetchProfesores();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al eliminar el profesor', errorMessage);
    }
  };

  const columns = [
    {
      title: 'Nombres',
      dataIndex: 'nombres',
      key: 'nombres',
    },
    {
      title: 'Apellidos',
      dataIndex: 'apellidos',
      key: 'apellidos',
    },
    {
      title: 'Género',
      dataIndex: 'genero',
      key: 'genero',
      render: (genero: string) => {
        const generoText = genero === 'M' ? 'Masculino' : genero === 'F' ? 'Femenino' : 'Otro';
        return <Tag color={genero === 'M' ? 'blue' : genero === 'F' ? 'pink' : 'purple'}>{generoText}</Tag>;
      },
    },
    {
      title: 'Unidad Académica',
      dataIndex: ['unidad_academica', 'nombre'],
      key: 'unidad_academica',
      render: (_: unknown, record: Profesor) => (
        <span>{record.unidad_academica?.nombre || 'No asignada'}</span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Tag color={activo ? 'green' : 'red'}>{activo ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Profesor) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const [unidadesAcademicas, setUnidadesAcademicas] = useState<{id: number, nombre: string}[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState<boolean>(true);

  // Cargar las unidades académicas al iniciar el componente
  useEffect(() => {
    const fetchUnidadesAcademicas = async () => {
      try {
        setLoadingUnidades(true);
        const response = await fetch('http://localhost:8000/api/unidades-academicas/');
        if (!response.ok) {
          throw new Error('Error al cargar las unidades académicas');
        }
        const data = await response.json();
        setUnidadesAcademicas(data);
      } catch (error) {
        console.error('Error al cargar unidades académicas:', error);
        showError('Error', 'No se pudieron cargar las unidades académicas');
      } finally {
        setLoadingUnidades(false);
      }
    };

    fetchUnidadesAcademicas();
  }, []);

  const formFields = [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'genero',
      label: 'Género',
      type: 'select' as const,
      options: generoOptions,
      required: true,
    },
    {
      name: 'unidad_academica_id',
      label: 'Unidad Académica',
      type: 'select' as const,
      options: unidadesAcademicas.map(ua => ({
        value: ua.id,
        label: ua.nombre
      })),
      required: true,
      loading: loadingUnidades,
    },
    {
      name: 'activo',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: true, label: 'Activo' },
        { value: false, label: 'Inactivo' },
      ],
      required: true,
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Profesores</h1>
          <p className="text-gray-600">Administra los profesores del sistema</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          Nuevo Profesor
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={profesores}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <EditModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSubmit}
        title={currentProfesor ? 'Editar Profesor' : 'Nuevo Profesor'}
        initialValues={currentProfesor || undefined}
        fields={formFields}
      />

      <ConfirmDelete
        show={deleteModalVisible}
        onHide={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar al profesor ${currentProfesor?.nombres} ${currentProfesor?.apellidos}?`}
      />
    </div>
  );
};

export default AdminProfesores;
