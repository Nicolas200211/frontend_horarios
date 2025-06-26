import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Aula, UnidadAcademica, Curso, Profesor } from './types';
import { getAulas, createAula, updateAula, deleteAula } from './aulasService';
import { getUnidadesAcademicas } from '../admin_unidades_academicas/unidadesAcademicasService';
import { getCursos } from '../admin_cursos/cursosService';
import { getProfesores } from '../admin_profesores/profesoresService';
import { showSuccess, showError } from '../../components/notifications/Notifications';
import EditModal from '../../components/modals/EditModal';
import ConfirmDelete from '../../components/modals/ConfirmDelete';



const AdminAulas: React.FC = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentAula, setCurrentAula] = useState<Aula | null>(null);
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<UnidadAcademica[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [formValues, setFormValues] = useState<Partial<Aula>>({ activo: true, tipo: 'Teoría' });
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState<boolean>(false);

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
    setFormValues({ activo: true, tipo: 'Teoría' });
    setModalVisible(true);
  };

  const handleEditAula = (aula: Aula) => {
    setCurrentAula(aula);
    setFormValues({
      ...aula,
      curso_id: aula.curso_id || undefined,
      profesor_id: aula.profesor_id || undefined,
    });
    setModalVisible(true);
  };

  const handleDeleteClick = (aula: Aula) => {
    setCurrentAula(aula);
    setConfirmDeleteVisible(true);
  };

  const handleDeleteAula = async () => {
    if (!currentAula) return;
    
    try {
      await deleteAula(currentAula.id);
      await fetchAulas();
      showSuccess('Aula eliminada', 'El aula ha sido eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar el aula:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al eliminar el aula', errorMessage);
    } finally {
      setConfirmDeleteVisible(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
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

  const formFields = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text' as const,
      placeholder: 'Ej: AULA-101',
      required: true
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      placeholder: 'Ej: Laboratorio de Informática 1',
      required: true
    },
    {
      name: 'capacidad',
      label: 'Capacidad',
      type: 'number' as const,
      required: true,
      min: 1
    },
    {
      name: 'tipo',
      label: 'Tipo de Aula',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'Teoría', label: 'Teoría' },
        { value: 'Laboratorio', label: 'Laboratorio' },
        { value: 'Taller', label: 'Taller' },
        { value: 'Otro', label: 'Otro' }
      ]
    },
    {
      name: 'unidad_academica_id',
      label: 'Unidad Académica',
      type: 'select' as const,
      required: true,
      options: unidadesAcademicas.map(ua => ({
        value: ua.id,
        label: `${ua.nombre} (${ua.codigo})`
      })) as {value: any, label: string}[]
    },
    {
      name: 'curso_id',
      label: 'Curso (Opcional)',
      type: 'select' as const,
      options: cursos.map(curso => ({
        value: curso.id,
        label: `${curso.nombre} (${curso.codigo})`
      })) as {value: any, label: string}[]
    },
    {
      name: 'profesor_id',
      label: 'Profesor (Opcional)',
      type: 'select' as const,
      options: profesores.map(prof => ({
        value: prof.id,
        label: `${prof.nombres} ${prof.apellidos}`
      })) as {value: any, label: string}[]
    },
    {
      name: 'activo',
      label: 'Activo',
      type: 'select' as const,
      options: [
        { value: true, label: 'Activo' },
        { value: false, label: 'Inactivo' }
      ]
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
              handleDeleteClick(record);
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

      <EditModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSubmit}
        title={currentAula ? 'Editar Aula' : 'Nueva Aula'}
        fields={formFields}
        initialValues={formValues}
        loading={loading}
      />

      <ConfirmDelete
        show={confirmDeleteVisible}
        onHide={() => setConfirmDeleteVisible(false)}
        onConfirm={handleDeleteAula}
        title="Confirmar eliminación"
        message={`¿Está seguro de eliminar el aula "${currentAula?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default AdminAulas;
