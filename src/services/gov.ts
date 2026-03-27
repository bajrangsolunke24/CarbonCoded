import api from './api';

export async function getDashboard() {
  const res = await api.get('/gov/dashboard');
  return res.data;
}

export async function getTrendChart() {
  const res = await api.get('/gov/dashboard/chart/trend');
  return res.data;
}

export async function getRevenueChart() {
  const res = await api.get('/gov/dashboard/chart/revenue');
  return res.data;
}

export async function getActivity() {
  const res = await api.get('/gov/dashboard/activity');
  return res.data;
}

export async function getAlerts() {
  const res = await api.get('/gov/dashboard/alerts');
  return res.data;
}

export async function getRequests(filters?: {
  status?: string;
  company_id?: string;
  land_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}) {
  const res = await api.get('/gov/requests', { params: filters });
  return res.data;
}

export async function getRequestDetail(requestId: string) {
  const res = await api.get(`/gov/requests/${requestId}`);
  return res.data;
}

export async function updateRequestStatus(
  requestId: string,
  payload: {
    status: 'under_review' | 'approved' | 'rejected';
    notes?: string;
    rejection_reason?: string;
    price_per_credit?: number;
  }
) {
  const res = await api.patch(`/gov/requests/${requestId}/status`, payload);
  return res.data;
}

export async function bulkUpdateRequests(payload: {
  request_ids: string[];
  action: 'approve' | 'reject';
  notes?: string;
  price_per_credit?: number;
}) {
  const res = await api.post('/gov/requests/bulk-update', payload);
  return res.data;
}

export async function issueCertificate(payload: {
  purchase_request_id: string;
  valid_from: string;
  valid_to: string;
}) {
  const res = await api.post('/gov/certificates/issue', payload);
  return res.data;
}

export async function getCertificates() {
  const res = await api.get('/gov/certificates');
  return res.data;
}

export async function revokeCertificate(certId: string, reason: string) {
  const res = await api.patch(`/gov/certificates/${certId}/revoke`, { reason });
  return res.data;
}

export async function getLands() {
  const res = await api.get('/gov/lands');
  return res.data;
}

export async function createLand(data: any) {
  const res = await api.post('/gov/lands', data);
  return res.data;
}

export async function updateLandCredits(landId: string, payload: {
  credits_to_add: number;
  ndvi_score: number;
  rationale?: string;
}) {
  const res = await api.patch(`/gov/lands/${landId}/update-credits`, payload);
  return res.data;
}
