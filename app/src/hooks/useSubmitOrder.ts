import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { submitOrder } from '@/features/trading/api';

// Turn a failed submit into a message for the user.
// The backend sends { error: "Insufficient funds for purchase" } etc. on 400s.
export function getSubmitOrderErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const backendMessage = error.response?.data?.error;
    if (typeof backendMessage === 'string' && backendMessage.trim() !== '') {
      return backendMessage;
    }
  }
  return 'Order failed. Please try again.';
}

export function useSubmitOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitOrder,
    onSuccess: () => {
      // Cash and holdings changed, so the cached portfolio is out of date
      void queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
