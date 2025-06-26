import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Curso } from './types';
import { getCursos, createCurso, updateCurso, deleteCurso } from './cursosService';
import { getProfesores } from '../admin_profesores/profesoresService';
import { getUnidadesAcademicas } from '../admin_unidades_academicas/unidadesAcademicasService';
import { showSuccess, showError } from '../../components/notifications/Notifications';
import EditModal from '../../components/modals/EditModal';
import ConfirmDelete from '../../components/modals/ConfirmDelete';

const AdminCursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null);
  const [unidadesAcademicas, setUnidadesAcademicas] = useState<{id: number, nombre: string}[]>([]);
  const [profesores, setProfesores] = useState<{id: number, nombre: string}[]>([]);
  const [formValues, setFormValues] = useState<Partial<Curso>>({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState<boolean>(false);

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
    setFormValues({ activo: true });
    setModalVisible(true);
  };

  const handleEdit = (curso: Curso) => {
    setCurrentCurso(curso);
    setFormValues({
      ...curso,
      unidad_academica_id: curso.unidad_academica?.id,
      profesor_id: curso.profesor?.id
    });
    setModalVisible(true);
  };

  const handleDelete = (curso: Curso) => {
    setCurrentCurso(curso);
    setConfirmDeleteVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
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
    
    try {
      await deleteCurso(currentCurso.id);
      showSuccess('Curso eliminado', 'El curso se ha eliminado correctamente');
      fetchCursos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al eliminar el curso', errorMessage);
    } finally {
      setConfirmDeleteVisible(false);
    }
  };

  const formFields = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text' as const,
      placeholder: 'Código del curso',
      required: true
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      placeholder: 'Nombre del curso',
      required: true
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'text' as const,
      placeholder: 'Descripción del curso'
    },
    {
      name: 'creditos',
      label: 'Créditos',
      type: 'number' as const,
      required: true
    },
    {
      name: 'horas_teoria',
      label: 'Horas Teoría',
      type: 'number' as const,
      required: true
    },
    {
      name: 'horas_practica',
      label: 'Horas Práctica',
      type: 'number' as const,
      required: true
    },
    {
      name: 'unidad_academica_id',
      label: 'Unidad Académica',
      type: 'select' as const,
      required: true,
      options: unidadesAcademicas.map(u => ({
        value: u.id,
        label: u.nombre
  })) as {value: any, label: string}[]
    },
    {
      name: 'profesor_id',
      label: 'Profesor',
      type: 'select' as const,
      required: true,
      options: profesores.map(p => ({
        value: p.id,
        label: p.nombre
      })) as {value: any, label: string}[]
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

      <EditModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSubmit}
        title={currentCurso ? 'Editar Curso' : 'Nuevo Curso'}
        fields={formFields}
        initialValues={formValues}
        loading={loading}
      />

      <ConfirmDelete
        show={confirmDeleteVisible}
        onHide={() => setConfirmDeleteVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message={`¿Está seguro que desea eliminar el curso "${currentCurso?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default AdminCursos;
