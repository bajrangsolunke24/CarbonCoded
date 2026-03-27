import api from './api';

export async function getLedger(filters?: {
  land_id?: string;
  state?: string;
  date?: string;
  page?: number;
  limit?: number;
}) {
  const res = await api.get('/ledger', { params: filters });
  return res.data;
}

export async function getLiveTotal(): Promise<{
  total_generated: number;
  total_issued: number;
  total_available: number;
}> {
  const res = await api.get('/ledger/total');
  return res.data;
}

export async function getBlock(blockIndex: number) {
  const res = await api.get(`/ledger/block/${blockIndex}`);
  return res.data;
}

export async function validateChain(): Promise<{ valid: boolean; broken_at_index?: number }> {
  const res = await api.get('/ledger/validate-chain');
  return res.data;
}

export async function getPublicStats(): Promise<{
  creditsByState: Array<{ state: string; credits: number }>;
  topParcels: Array<{ id: string; state: string; district: string; landType: string; availableCredits: number }>;
}> {
  const res = await api.get('/ledger/public-stats');
  return res.data;
}
