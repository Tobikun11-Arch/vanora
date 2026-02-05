'use client';

import {showToast} from '@/components/Toast';
import {useMutation} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {useRouter} from 'expo-router';

type MutationOptions<T, R> = {
  mutationFn: (data: T) => Promise<R>;
  onSuccessRedirect?: string;
  successMessage?: string;
  errorMessage?: string;
  resetForm?: () => void;
  onSuccessExtra?: (data: R) => void;
};

export function useAppMutation<T, R>({
  mutationFn,
  onSuccessRedirect,
  successMessage,
  errorMessage,
  resetForm,
  onSuccessExtra
}: MutationOptions<T, R>) {
  const router = useRouter();

  const handleSuccess = (data: R) => {
    if (successMessage) showToast('success', 'Success', successMessage);
    resetForm?.();
    onSuccessExtra?.(data);
    if (onSuccessRedirect)
      setTimeout(() => router.push(onSuccessRedirect), 500);
  };
  const handleError = (error: AxiosError<{message: string}>) => {
    const errMsg =
      error.response?.data.message ||
      error.message ||
      errorMessage ||
      'An error occurred';
    showToast('error', 'Error', errMsg);
  };

  return useMutation({
    mutationFn,
    onSuccess: handleSuccess,
    onError: handleError
  });
}
