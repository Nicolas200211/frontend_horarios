import React, { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Card, Button, message, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { FiltrosHorario } from './types';

// Hooks
import { useHorariosData } from './hooks/useHorariosData';

// Services
import { 
  createHorario as createHorarioService,
  updateHorario as updateHorarioService,
  deleteHorario as deleteHorarioService
} from './horariosService';

// Components
import ConfirmDelete from '../../components/modals/ConfirmDelete';
import EditModal from '../../components/modals/EditModal';

// Types
import type { Horario, HorarioFormData, HorarioFormValues } from './types';

const AdminHorarios: React.FC = () => {
  // State for table pagination and filters
  const [filters] = useState<FiltrosHorario>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Use the useHorariosData hook to manage data fetching
  const {
    data,
    loading,
    loadHorarios,
    reloadData,
    pagination: paginationData
  } = useHorariosData({
    page: currentPage,
    pageSize,
    filters
  });
  
  // Ensure data properties are always arrays
  const aulas = Array.isArray(data?.aulas) ? data.aulas : [];
  const cursos = Array.isArray(data?.cursos) ? data.cursos : [];
  const profesores = Array.isArray(data?.profesores) ? data.profesores : [];
  const unidadesAcademicas = Array.isArray(data?.unidadesAcademicas) ? data.unidadesAcademicas : [];
  const tiposClase = Array.isArray(data?.tiposClase) ? data.tiposClase : [];
  const horarios = Array.isArray(data?.horarios) ? data.horarios : [];
  
  // Debug log for aulas data
  console.log('Aulas in component:', aulas);

  // Definir columnas de la tabla
  const columns: any[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Aula',
      dataIndex: ['aula', 'nombre'],
      key: 'aula',
    },
    {
      title: 'Curso',
      dataIndex: ['curso', 'nombre'],
      key: 'curso',
    },
    {
      title: 'Profesor',
      dataIndex: ['profesor', 'nombres'],
      key: 'profesor',
      render: (_: string, record: any) => 
        `${record.profesor?.nombres} ${record.profesor?.apellidos}`,
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
      title: 'Tipo de Clase',
      dataIndex: 'tipo_clase',
      key: 'tipo_clase',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Horario) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Editar</Button>
          <Button type="link" danger onClick={() => confirmDelete(record.id)}>Eliminar</Button>
        </>
      ),
    },
  ];

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioFormValues | null>(null);
  const [horarioToDelete, setHorarioToDelete] = useState<number | null>(null);

  // Data fetching is now handled by the useHorariosData hook above

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = useCallback((pagination: any) => {
    if (pagination.current) {
      setCurrentPage(pagination.current);
    }
    if (pagination.pageSize) {
      setPageSize(pagination.pageSize);
    }
  }, []);

  // Handle form submit
  const handleSubmit = async (formValues: HorarioFormValues) => {
    if (!formValues.fecha_clase) {
      message.error('La fecha de la clase es requerida');
      return;
    }

    try {
      // Transform form values to match the API expected format
      const values: HorarioFormData = {
        aula_id: formValues.aula_id ? Number(formValues.aula_id) : 0,
        curso_id: formValues.curso_id ? Number(formValues.curso_id) : 0,
        profesor_id: formValues.profesor_id ? Number(formValues.profesor_id) : 0,
        unidad_academica_id: formValues.unidad_academica_id ? Number(formValues.unidad_academica_id) : 1,
        fecha_clase: formValues.fecha_clase.format('YYYY-MM-DD'),
        hora_inicio: formValues.hora_inicio || '',
        hora_fin: formValues.hora_fin || '',
        tipo_clase: formValues.tipo_clase || 'Teoría',
        dia: formValues.fecha_clase.format('dddd'),
      };

      if (editingHorario && editingHorario.id) {
        // Update existing horario
        await updateHorarioService(editingHorario.id, values);
        message.success('Horario actualizado exitosamente');
      } else {
        // Create new horario
        await createHorarioService(values);
        message.success('Horario creado exitosamente');
      }
      
      // Refresh data and close modal
      await loadHorarios();
      setIsEditModalOpen(false);
      setEditingHorario(null);
    } catch (error) {
      console.error('Error saving horario:', error);
      message.error('Error al guardar el horario');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!horarioToDelete) return;
    
    try {
      await deleteHorarioService(horarioToDelete);
      message.success('Horario eliminado exitosamente');
      reloadData();
    } catch (error) {
      console.error('Error deleting horario:', error);
      message.error('Error al eliminar el horario');
    } finally {
      setIsDeleteModalOpen(false);
      setHorarioToDelete(null);
    }
  };

  // Handle edit
  const handleEdit = (horario: Horario | null) => {
    if (horario) {
      // Format the date for the form
      const formattedHorario: HorarioFormValues = {
        ...horario,
        // Convert fecha_clase string to Day.js object if it exists, otherwise use current date
        fecha_clase: horario.fecha_clase 
          ? dayjs(horario.fecha_clase) 
          : dayjs() // Fallback to current date if fecha_clase is not provided
      };
      setEditingHorario(formattedHorario);
    } else {
      // For new entries, set fecha_clase to current date
      const newHorario: HorarioFormValues = {
        aula_id: 0,
        curso_id: 0,
        profesor_id: 0,
        unidad_academica_id: 1,
        fecha_clase: dayjs(),
        hora_inicio: '',
        hora_fin: '',
        tipo_clase: 'Teoría',
        dia: ''
      };
      setEditingHorario(newHorario);
    }
    setIsEditModalOpen(true);
  };

  // Handle create new
  const handleCreate = () => {
    handleEdit(null);
  };

  // Handle delete confirmation
  const confirmDelete = (id: number) => {
    setHorarioToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Define form fields for the modal with proper types
  const formFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date' | 'time';
    required: boolean;
    options?: Array<{ value: any; label: string }>;
    format?: string;
    showNow?: boolean;
    minuteStep?: number;
    inputReadOnly?: boolean;
    loading?: boolean;
  }> = [
    {
      name: 'aula_id',
      label: 'Aula',
      type: 'select' as const,
      required: true,
      loading: aulas.length === 0,
      options: aulas.length > 0 ? aulas.map((aula: any) => ({
        value: aula.id,
        label: aula.nombre || `Aula ${aula.id || ''}`
      })) : [
        { value: '', label: loading ? 'Cargando aulas...' : 'No hay aulas disponibles' }
      ]
    },
    {
      name: 'curso_id',
      label: 'Curso',
      type: 'select' as const,
      required: true,
      loading: cursos.length === 0,
      options: cursos.length > 0 ? cursos.map((curso: any) => ({
        value: curso.id,
        label: curso.nombre || `Curso ${curso.id}`
      })) : [
        { value: '', label: loading ? 'Cargando cursos...' : 'No hay cursos disponibles' }
      ]
    },
    {
      name: 'profesor_id',
      label: 'Profesor',
      type: 'select' as const,
      required: true,
options: profesores.map((profesor: any) => ({
        value: profesor.id,
        label: `${profesor.nombres} ${profesor.apellidos}`
      }))
    },
    {
      name: 'unidad_academica_id',
      label: 'Unidad Académica',
      type: 'select' as const,
      required: true,
options: unidadesAcademicas.map((unidad: any) => ({
        value: unidad.id,
        label: unidad.nombre
      }))
    },
    {
      name: 'fecha_clase',
      label: 'Fecha de la Clase',
      type: 'date' as const,
      required: true,
      format: 'YYYY-MM-DD'
    },
    {
      name: 'hora_inicio',
      label: 'Hora de Inicio',
      type: 'time' as const,
      required: true,
      format: 'HH:mm',
      showNow: false,
      minuteStep: 15,
      inputReadOnly: true
    },
    {
      name: 'hora_fin',
      label: 'Hora de Fin',
      type: 'time' as const,
      required: true,
      format: 'HH:mm',
      showNow: false,
      minuteStep: 15,
      inputReadOnly: true
    },
    {
      name: 'tipo_clase',
      label: 'Tipo de Clase',
      type: 'select' as const,
      required: true,
options: tiposClase.map((tipo: string) => ({
        value: tipo,
        label: tipo
      }))
    }
  ];

  return (
    <div className="admin-horarios">
      <Card
        title="Gestión de Horarios"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Nuevo Horario
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={horarios}
          rowKey="id"
          loading={loading}
          pagination={{
            current: paginationData.current,
            pageSize: paginationData.pageSize,
            total: paginationData.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Edit/Add Modal */}
      <EditModal
        isVisible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHorario(null);
        }}
        onSave={handleSubmit}
        title={editingHorario ? 'Editar Horario' : 'Nuevo Horario'}
        initialValues={editingHorario || {}}
        fields={formFields}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDelete
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Horario"
        message="¿Estás seguro de que deseas eliminar este horario?"
      />
    </div>
  );
};

export default AdminHorarios;
