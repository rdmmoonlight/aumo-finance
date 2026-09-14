import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/apiClient';
import { PeriodConfigPayload } from './types';

export const periodsService = {
  getPeriods: async () => {
    const response = await apiClient.get('/api/periods');
    return response.data;
  },
  getActivePeriod: async () => {
    const response = await apiClient.get('/api/periods/active');
    return response.data;
  },
  createPeriod: async (payload: PeriodConfigPayload) => {
    const response = await apiClient.post('/api/periods', payload);
    return response.data;
  },
  closePeriod: async (periodId: string) => {
    const response = await apiClient.post(`/api/periods/${periodId}/close`);
    return response.data;
  },
};

export const usePeriods = () => {
  return useQuery({
    queryKey: ['periods'],
    queryFn: periodsService.getPeriods,
  });
};

export const useActivePeriod = () => {
  return useQuery({
    queryKey: ['periods', 'active'],
    queryFn: periodsService.getActivePeriod,
  });
};

export const useCreatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PeriodConfigPayload) => periodsService.createPeriod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
};

export const useClosePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) => periodsService.closePeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
};
