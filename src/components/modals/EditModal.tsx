import React from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import { EditOutlined } from '@ant-design/icons';

interface EditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  title: string;
  initialValues?: any;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date';
    options?: Array<{ value: any; label: string }>;
    required?: boolean;
  }>;
  loading?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  isVisible,
  onClose,
  onSave,
  title,
  initialValues,
  fields,
  loading = false,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (isVisible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [isVisible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderFormItem = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            options={field.options}
            placeholder={`Seleccione ${field.label.toLowerCase()}`}
          />
        );
      case 'number':
        return <Input type="number" />;
      case 'date':
        return <Input type="date" />;
      default:
        return <Input placeholder={`Ingrese ${field.label.toLowerCase()}`} />;
    }
  };

  return (
    <Modal
      title={
        <>
          <EditOutlined /> {title}
        </>
      }
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          Guardar cambios
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[
              {
                required: field.required !== false,
                message: `Por favor ingrese ${field.label.toLowerCase()}`,
              },
            ]}
          >
            {renderFormItem(field)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default EditModal;
