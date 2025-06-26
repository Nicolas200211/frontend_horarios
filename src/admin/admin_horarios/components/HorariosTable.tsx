import React from 'react';
import { Table, Space, Button, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface HorariosTableProps {
  data: any[];
  loading: boolean;
  onEdit: (record: any) => void;
  onDelete: (id: number) => void;
  pagination: any;
  onTableChange: (pagination: any) => void;
}

export const HorariosTable: React.FC<HorariosTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  pagination,
  onTableChange
}) => {
  const columns = [
    {
      title: 'Aula',
      dataIndex: ['aula', 'codigo'],
      key: 'aula',
    },
    {
      title: 'Curso',
      dataIndex: ['curso', 'nombre'],
      key: 'curso',
    },
    {
      title: 'Profesor',
      key: 'profesor',
      render: (_: any, record: any) => (
        <span>
          {record.profesor?.nombres} {record.profesor?.apellidos}
        </span>
      ),
    },
    {
      title: 'Día',
      dataIndex: 'dia',
      key: 'dia',
    },
    {
      title: 'Horario',
      key: 'horario',
      render: (_: any, record: any) => (
        <span>
          {record.hora_inicio} - {record.hora_fin}
        </span>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_clase',
      key: 'tipo_clase',
      render: (tipo: string) => (
        <Tag color={tipo === 'Teoría' ? 'blue' : 'green'}>{tipo}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
      scroll={{ x: true }}
    />
  );
};
