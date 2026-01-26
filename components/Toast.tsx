import Toast from 'react-native-toast-message';

export const showToast = (
  type: 'success' | 'error' | 'info',
  title: string,
  message: string
) => {
  Toast.show({
    type,
    position: 'top',
    text1: title,
    text2: message,
    visibilityTime: 3000,
  });
};

export const ToastContainer = () => <Toast />;
