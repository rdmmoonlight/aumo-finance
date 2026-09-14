import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../apiClient';
import { LedgerParams } from './types';

export const ledgerService = {
  getPermanentLedger: async (params?: LedgerParams) => {
    const response = await apiClient.get('/api/reports/general-ledger/permanent', { params });
    return response.data;
  },
  getTemporaryLedger: async (params?: LedgerParams) => {
    const response = await apiClient.get('/api/reports/general-ledger/temporary', { params });
    return response.data;
  },
};

export const usePermanentLedger = (params?: LedgerParams) => {
  return useQuery({
    queryKey: ['ledger', 'permanent', params],
    queryFn: () => ledgerService.getPermanentLedger(params),
  });
};

export const useTemporaryLedger = (params?: LedgerParams) => {
  return useQuery({
    queryKey: ['ledger', 'temporary', params],
    queryFn: () => ledgerService.getTemporaryLedger(params),
  });
};
