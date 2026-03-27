import api from './api';

export interface MarketplaceFilters {
  state?: string;
  land_type?: string;
  min_credits?: number;
  max_credits?: number;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export async function getListings(filters: MarketplaceFilters = {}) {
  const res = await api.get('/marketplace/listings', { params: filters });
  return res.data;
}

export async function getListingDetail(landId: string) {
  const res = await api.get(`/marketplace/listings/${landId}`);
  return res.data;
}

export async function calculatePrice(landId: string, credits: number, duration_years: number) {
  const res = await api.get(`/marketplace/listings/${landId}/price-calculate`, {
    params: { credits, duration_years },
  });
  return res.data;
}

export async function submitRequest(formData: FormData) {
  const res = await api.post('/marketplace/request', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
