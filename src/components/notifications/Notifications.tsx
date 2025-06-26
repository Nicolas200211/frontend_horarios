import React, { useEffect } from 'react';
import { notification as antdNotification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface NotificationConfig {
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
  key?: string;
  onClose?: () => void;
}

const notificationIcons = {
  success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const Notifications: React.FC = () => {
  const [api, contextHolder] = antdNotification.useNotification();

  const showNotification = ({
    type,
    message,
    description,
    duration = 4.5,
    key,
    onClose,
  }: NotificationConfig) => {
    api[type]({
      message,
      description,
      duration,
      key,
      icon: notificationIcons[type],
      onClose,
    });
  };

  // Export the notification function to be used throughout the app
  useEffect(() => {
    // @ts-ignore
    window.showNotification = showNotification;
    
    return () => {
      // @ts-ignore
      delete window.showNotification;
    };
  }, []);

  return contextHolder;
};

// Export the notification function for direct import
export const showNotification = (config: NotificationConfig) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification(config);
  } else {
    // Fallback if the notification context is not available yet
    const { type, message, description, duration = 4.5 } = config;
    antdNotification[type]({
      message,
      description,
      duration,
      icon: notificationIcons[type],
    });
  }
};

export const showSuccess = (message: string, description?: string, duration?: number) =>
  showNotification({ type: 'success', message, description, duration });

export const showError = (message: string, description?: string, duration?: number) =>
  showNotification({ type: 'error', message, description, duration });

export const showWarning = (message: string, description?: string, duration?: number) =>
  showNotification({ type: 'warning', message, description, duration });

export const showInfo = (message: string, description?: string, duration?: number) =>
  showNotification({ type: 'info', message, description, duration });

export default Notifications;
