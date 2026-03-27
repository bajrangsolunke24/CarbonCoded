import api from './api';

export async function getDashboard() {
  const res = await api.get('/company/dashboard');
  return res.data;
}

export async function getPurchaseChart() {
  const res = await api.get('/company/dashboard/chart/purchases');
  return res.data;
}

export async function getBreakdownChart() {
  const res = await api.get('/company/dashboard/chart/breakdown');
  return res.data;
}

export async function getRequests() {
  const res = await api.get('/company/requests');
  return res.data;
}

export async function getRequestDetail(requestId: string) {
  const res = await api.get(`/company/requests/${requestId}`);
  return res.data;
}

export async function getCertificates() {
  const res = await api.get('/company/certificates');
  return res.data;
}

export async function getCertificateDetail(certId: string) {
  const res = await api.get(`/company/certificates/${certId}`);
  return res.data;
}

export async function downloadCertificate(certId: string): Promise<string> {
  const res = await api.get(`/company/certificates/${certId}/download`);
  return res.data.url;
}

export async function verifyCertificate(certId: string) {
  const res = await api.get(`/company/certificates/${certId}/verify`);
  return res.data;
}

export async function getTransactions(filters?: {
  date_from?: string;
  date_to?: string;
  status?: string;
}) {
  const res = await api.get('/company/transactions', { params: filters });
  return res.data;
}

export async function exportTransactions(): Promise<Blob> {
  const res = await api.get('/company/transactions/export', {
    responseType: 'blob',
  });
  return res.data;
}
