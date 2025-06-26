import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Select, 
  message, 
  Table, 
  Button, 
  Space,
} from 'antd';
import ConfirmDelete from '../../components/modals/ConfirmDelete';
import EditModal from '../../components/modals/EditModal';
import type { Horario, HorarioFormData, FiltrosHorario, DiaSemana, TipoClase } from './types';
import * as horarioService from './horariosService';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Helper para notificaciones
const notify = (type: 'success' | 'error' | 'info' | 'warning', msg: string) => {
  message[type](msg);
};

const AdminHorarios: React.FC = () => {
  // State management
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentHorario, setCurrentHorario] = useState<Horario | null>(null);
  const [horarioToDelete, setHorarioToDelete] = useState<number | null>(null);
  const [filtros, setFiltros] = useState<FiltrosHorario>({});
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [diasSemana, setDiasSemana] = useState<DiaSemana[]>([]);
  const [tiposClase, setTiposClase] = useState<TipoClase[]>([]);
  const [form] = Form.useForm<HorarioFormData>();
  
  // Constants
  const tamanoPagina = 10;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [dias, tipos] = await Promise.all([
          horarioService.getDiasSemana(),
          horarioService.getTiposClase()
        ]);
        setDiasSemana(dias);
        setTiposClase(tipos);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        message.error('Error al cargar datos iniciales');
      }
    };

    loadInitialData();
  }, []);

  // Fetch horarios when filters or page changes
  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        setLoading(true);
        const response = await horarioService.getHorarios({
          ...filtros,
          skip: (paginaActual - 1) * tamanoPagina,
          limit: tamanoPagina,
        });
        setHorarios(response.items);
        setTotal(response.total);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        message.error('Error al cargar la lista de horarios');
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, [filtros, paginaActual]);
  
  // Fetch data on component mount and when filters change
  useEffect(() => {
    cargarHorarios();
  }, [paginaActual, filtros]);

  // Cargar horarios desde la API
  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const response = await horarioService.getHorarios({
        ...filtros,
        skip: (paginaActual - 1) * tamanoPagina,
        limit: tamanoPagina,
      });
      setHorarios(response.items);
      setTotal(response.total);
    } catch (error) {
      notify('error', 'Error al cargar los horarios');
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: HorarioFormData) => {
    try {
      setLoading(true);
      
      const formatTime = (timeValue: any): string => {
        if (!timeValue) return '';
        if (typeof timeValue === 'object' && timeValue.format) {
          return timeValue.format('HH:mm:ss');
        }
        if (typeof timeValue === 'string') {
          if (/^\d{2}:\d{2}$/.test(timeValue)) {
            return `${timeValue}:00`;
          }
          if (/^\d{2}:\d{2}:\d{2}$/.test(timeValue)) {
            return timeValue;
          }
        }
        return '';
      };
      const formattedValues: HorarioFormData = {
        ...values,
        hora_inicio: formatTime(values.hora_inicio),
        hora_fin: formatTime(values.hora_fin),
        dia: values.dia,
        tipo_clase: values.tipo_clase || 'Teoría',
        profesor_id: values.profesor_id || 1,
        curso_id: values.curso_id || 1,
        aula_id: values.aula_id || 1,
        unidad_academica_id: values.unidad_academica_id || 1
      };

      if (currentHorario) {
        // Update existing horario
        const updatedHorario = await horarioService.updateHorario(currentHorario.id, formattedValues);
        setHorarios(horarios.map(h => h.id === updatedHorario.id ? updatedHorario : h));
        message.success('Horario actualizado correctamente');
      } else {
        // Create new horario
        const newHorario = await horarioService.createHorario(formattedValues);
        setHorarios([newHorario, ...horarios]);
        message.success('Horario creado correctamente');
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Error al guardar el horario:', error);
      message.error(error instanceof Error ? error.message : 'Error al guardar el horario');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de horario
  const handleDelete = (id: number) => {
    setHorarioToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!horarioToDelete) return;
    
    try {
      setLoading(true);
      await horarioService.deleteHorario(horarioToDelete);
      setHorarios(horarios.filter(h => h.id !== horarioToDelete));
      setShowDeleteModal(false);
      message.success('Horario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el horario:', error);
      message.error(error instanceof Error ? error.message : 'Error al eliminar el horario');
    } finally {
      setLoading(false);
      setHorarioToDelete(null);
    }
  };

  // Preparar los valores del formulario
  const handleNewHorario = () => {
    setCurrentHorario(null);
    form.resetFields();
    form.setFieldsValue({
      tipo_clase: 'Teoría',
      hora_inicio: dayjs('08:00:00', 'HH:mm:ss'),
      hora_fin: dayjs('09:00:00', 'HH:mm:ss')
    } as any); // Using type assertion since we know the format is correct
    setIsModalOpen(true);
  };

  const handleEdit = (horario: Horario) => {
    setCurrentHorario(horario);
    form.setFieldsValue({
      ...horario,
      hora_inicio: horario.hora_inicio ? dayjs(horario.hora_inicio, 'HH:mm:ss') : undefined,
      hora_fin: horario.hora_fin ? dayjs(horario.hora_fin, 'HH:mm:ss') : undefined
    } as any); // Using type assertion since we know the format is correct
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSave = (values: any) => {
    handleSubmit(values as HorarioFormData);
  };

  // Columnas de la tabla
  const columns: any[] = [
    {
      title: 'Aula',
      key: 'aula',
      render: (_: any, record: Horario) => {
        // Handle aula data that might be nested or flat
        if (record.aula && typeof record.aula === 'object') {
          return record.aula.nombre || 'N/A';
        }
        return 'N/A';
      },
    },
    {
      title: 'Curso',
      key: 'curso',
      render: (_: any, record: Horario) => {
        // Handle curso data that might be nested or flat
        if (record.curso && typeof record.curso === 'object') {
          return record.curso.nombre || 'N/A';
        }
        return 'N/A';
      },
    },
    {
      title: 'Profesor',
      key: 'profesor',
      render: (_: any, record: Horario) => {
        // Handle profesor data that might be nested or flat
        if (record.profesor && typeof record.profesor === 'object') {
          const nombre = record.profesor.nombres || '';
          const apellido = record.profesor.apellidos || '';
          return `${nombre} ${apellido}`.trim() || 'N/A';
        }
        return 'N/A';
      },
    },
    {
      title: 'Día',
      dataIndex: 'dia',
      key: 'dia',
      filters: diasSemana.map(dia => ({ text: dia, value: dia })),
      onFilter: (value: any, record: Horario) => record.dia === value,
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
      title: 'Tipo Clase',
      dataIndex: 'tipo_clase',
      key: 'tipo_clase',
      filters: tiposClase.map(tipo => ({ text: tipo, value: tipo })),
      onFilter: (value: any, record: Horario) => record.tipo_clase === value,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Horario) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button 
            type="link" 
            danger
            onClick={() => handleDelete(record.id)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  // Define types for form fields
  type FormField = {
    name: string;
    label: string;
    type: 'select' | 'time' | 'text' | 'number';
    options?: Array<{ value: any; label: string }>;
    required: boolean;
  };

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'aula_id',
      label: 'Aula',
      type: 'select',
      options: [
        { value: 1, label: 'Aula 101' },
        { value: 2, label: 'Aula 102' },
      ],
      required: true
    },
    {
      name: 'curso_id',
      label: 'Curso',
      type: 'select',
      options: [
        { value: 1, label: 'Matemáticas' },
        { value: 2, label: 'Lenguaje' },
      ],
      required: true
    },
    {
      name: 'profesor_id',
      label: 'Profesor',
      type: 'select',
      options: [
        { value: 1, label: 'Juan Pérez' },
        { value: 2, label: 'María García' },
      ],
      required: true
    },
    {
      name: 'unidad_academica_id',
      label: 'Unidad Académica',
      type: 'select',
      options: [
        { value: 1, label: 'Facultad de Ingeniería' },
        { value: 2, label: 'Facultad de Ciencias' },
      ],
      required: true
    },
    {
      name: 'dia',
      label: 'Día de la semana',
      type: 'select',
      options: diasSemana.map((dia: DiaSemana) => ({
        value: dia,
        label: dia
      })),
      required: true
    },
    {
      name: 'tipo_clase',
      label: 'Tipo de clase',
      type: 'select',
      options: tiposClase.map((tipo: TipoClase) => ({
        value: tipo,
        label: tipo
      })),
      required: true
    },
    {
      name: 'hora_inicio',
      label: 'Hora de inicio',
      type: 'text',
      required: true
    },
    {
      name: 'hora_fin',
      label: 'Hora de fin',
      type: 'text',
      required: true
    }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administración de Horarios</h1>
        <Button type="primary" onClick={handleNewHorario}>
          Nuevo Horario
        </Button>
      </div>
      {/* Modal de edición/creación */}
      <EditModal
        isVisible={isModalOpen}
        onClose={handleCancel}
        onSave={handleSave}
        title={currentHorario ? 'Editar Horario' : 'Nuevo Horario'}
        initialValues={currentHorario || {}}
        loading={loading}
        fields={formFields.map(field => ({
          name: field.name,
          label: field.label,
          type: field.type as 'select' | 'text' | 'number' | 'date',
          options: field.options,
          required: field.required
        }))}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmDelete
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Filtros */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '24px' 
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Filtros</h2>
        <Form layout="inline" onValuesChange={(_, values) => setFiltros({ ...values })}>
          <Form.Item name="dia" label="Día de la semana">
            <Select
              style={{ width: 200 }}
              placeholder="Todos los días"
              allowClear
              onChange={(value) => setFiltros({ ...filtros, dia: value as DiaSemana })}
              value={filtros.dia}
            >
              <Select.Option value="Lunes">Lunes</Select.Option>
              <Select.Option value="Martes">Martes</Select.Option>
              <Select.Option value="Miércoles">Miércoles</Select.Option>
              <Select.Option value="Jueves">Jueves</Select.Option>
              <Select.Option value="Viernes">Viernes</Select.Option>
              <Select.Option value="Sábado">Sábado</Select.Option>
              <Select.Option value="Domingo">Domingo</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </div>

      {/* Tabla de horarios */}
      <div style={{ marginTop: '24px' }}>
        <Table
          columns={columns}
          dataSource={horarios}
          rowKey="id"
          pagination={{
            current: paginaActual,
            pageSize: tamanoPagina,
            total,
            onChange: (page: number) => setPaginaActual(page),
            showSizeChanger: false
          }}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminHorarios;
