import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

interface ConfirmDeleteProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDelete = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
}: ConfirmDeleteProps) => {
  const handleOk = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleFilled style={{ color: '#faad14' }} />
          {title}
        </div>
      }
      open={show}
      onOk={handleOk}
      onCancel={onHide}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger: true }}
      centered
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmDelete;
