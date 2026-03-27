import api from './api';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  company?: any;
  officer?: any;
}

export async function registerCompany(data: {
  cin: string;
  name: string;
  contact_email: string;
  password: string;
  contact_phone?: string;
  registered_address?: string;
}): Promise<LoginResponse> {
  const res = await api.post('/auth/company/register', data);
  return res.data;
}

export async function loginCompany(cin: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/company/login', { cin, password });
  return res.data;
}

export async function loginGov(officer_id: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/gov/login', { officer_id, password });
  return res.data;
}

export async function refreshToken(refresh_token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await api.post('/auth/refresh', { refresh_token });
  return res.data;
}

export async function logout(refresh_token?: string): Promise<void> {
  await api.post('/auth/logout', { refresh_token });
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}
