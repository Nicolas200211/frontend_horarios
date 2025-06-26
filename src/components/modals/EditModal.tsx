import React, { useState, useEffect } from 'react';
import { Input, Select, DatePicker, TimePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

interface EditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  title: string;
  initialValues?: any;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date' | 'time';
    options?: Array<{ value: any; label: string }>;
    required?: boolean;
    loading?: boolean;
    format?: string;
    showNow?: boolean;
    minuteStep?: number;
    inputReadOnly?: boolean;
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
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isVisible) {
      if (initialValues) {
        // Create a copy of initialValues to avoid mutating the original
        const formattedValues = { ...initialValues };
        
        // Format date fields if they exist
        fields.forEach(field => {
          if (field.type === 'date' && initialValues[field.name]) {
            // If it's already a Dayjs object, use it directly
            if (typeof initialValues[field.name]?.format === 'function') {
              formattedValues[field.name] = initialValues[field.name];
            } else {
              // Otherwise, parse the date string
              formattedValues[field.name] = dayjs(initialValues[field.name]);
            }
          }
        });
        
        setFormValues(formattedValues);
      } else {
        // Reset form when opening with no initial values
        const defaultValues: any = {};
        fields.forEach(field => {
          defaultValues[field.name] = '';
        });
        setFormValues(defaultValues);
      }
      setErrors({});
    }
  }, [isVisible, initialValues, fields]);

  const handleChange = (name: string, value: any) => {
    setFormValues((prev: any) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Convert date string to Dayjs object for DatePicker
  const getDateValue = (dateValue: any) => {
    if (!dateValue) return undefined;
    // If it's already a Dayjs object, return it
    if (dateValue && typeof dateValue.format === 'function') return dateValue;
    // Otherwise, try to parse it as a date string
    return dayjs(dateValue, 'YYYY-MM-DD').isValid() ? dayjs(dateValue, 'YYYY-MM-DD') : undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleTimeChange = (time: Dayjs | null, fieldName: string) => {
    handleChange(fieldName, time ? time.format('HH:mm') : '');
  };

  const getTimeValue = (timeString: string | undefined) => {
    if (!timeString) return undefined;
    return dayjs(timeString, 'HH:mm').isValid() ? dayjs(timeString, 'HH:mm') : undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const validationErrors: Record<string, string> = {};
    let isValid = true;
    
    fields.forEach(field => {
      if (field.required && !formValues[field.name]) {
        validationErrors[field.name] = `${field.label} es requerido`;
        isValid = false;
      }
    });
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    onSave(formValues);
  };

  const renderFormItem = (field: any) => {
    const error = errors[field.name];
    const commonClasses = `mt-1 block w-full rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`;
    const labelClasses = `block text-sm font-medium ${error ? 'text-red-600' : 'text-gray-700'}`;

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className={labelClasses}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Select
              placeholder={`Seleccione ${field.label.toLowerCase()}`}
              style={{ width: '100%' }}
              value={formValues[field.name]}
              onChange={(value) => handleChange(field.name, value)}
              options={field.options}
              disabled={field.disabled || (field.options && field.options.length === 1 && field.options[0].value === '')}
              loading={field.loading}
              notFoundContent={field.loading ? 'Cargando...' : 'No hay opciones disponibles'}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
      case 'date':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className={labelClasses}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <DatePicker
              className="w-full"
              name={field.name}
              format={field.format || 'YYYY-MM-DD'}
              value={getDateValue(formValues[field.name])}
              onChange={(date) => handleChange(field.name, date)}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
      case 'time':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className={labelClasses}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <TimePicker
              className="w-full"
              format="HH:mm"
              minuteStep={field.minuteStep || 15}
              showNow={field.showNow || false}
              inputReadOnly={field.inputReadOnly || false}
              value={getTimeValue(formValues[field.name])}
              onChange={(time) => handleTimeChange(time, field.name)}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
      case 'number':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className={labelClasses}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="number"
              name={field.name}
              value={formValues[field.name] || ''}
              onChange={handleInputChange}
              className={commonClasses}
              disabled={loading}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
      default:
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className={labelClasses}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="text"
              name={field.name}
              value={formValues[field.name] || ''}
              onChange={handleInputChange}
              className={commonClasses}
              disabled={loading}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal with scale animation */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 animate-scale-in">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-blue-100 hover:bg-blue-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form with subtle background */}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6">
          <div className="space-y-5">
            {fields.map((field) => renderFormItem(field))}
          </div>

          {/* Enhanced actions with more spacing */}
          <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span className="flex items-center">
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Guardar</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
