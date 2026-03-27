import { create } from 'zustand';
import { loginCompany, loginGov, logout as logoutApi } from '@/services/auth';

type Role = 'company' | 'gov' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  companyUser: any | null;
  govOfficer: any | null;
  login: (role: Role, identifier: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAuthFromResponse: (resp: any) => void;
}

function persistTokens(accessToken: string, refreshToken: string, role: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userRole', role);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
}

function loadInitialState() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const role = localStorage.getItem('userRole') as Role;
  return { accessToken, refreshToken, role, isAuthenticated: !!accessToken && !!role };
}

const initial = loadInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: initial.isAuthenticated,
  role: initial.role,
  accessToken: initial.accessToken,
  refreshToken: initial.refreshToken,
  userId: null,
  companyUser: null,
  govOfficer: null,

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  login: async (role, identifier, password) => {
    if (role === 'company') {
      const data = await loginCompany(identifier, password);
      persistTokens(data.accessToken, data.refreshToken, 'company');
      set({
        isAuthenticated: true,
        role: 'company',
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.company?.id,
        companyUser: data.company,
        govOfficer: null,
      });
    } else {
      const data = await loginGov(identifier, password);
      persistTokens(data.accessToken, data.refreshToken, 'gov');
      set({
        isAuthenticated: true,
        role: 'gov',
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.officer?.id,
        govOfficer: data.officer,
        companyUser: null,
      });
    }
  },

  setAuthFromResponse: (resp: any) => {
    const role = resp.company ? 'company' : 'gov';
    persistTokens(resp.accessToken, resp.refreshToken, role);
    set({
      isAuthenticated: true,
      role,
      accessToken: resp.accessToken,
      refreshToken: resp.refreshToken,
      userId: resp.company?.id || resp.officer?.id,
      companyUser: resp.company || null,
      govOfficer: resp.officer || null,
    });
  },

  logout: () => {
    const token = localStorage.getItem('refreshToken');
    if (token) logoutApi(token).catch(() => {});
    clearTokens();
    set({
      isAuthenticated: false,
      role: null,
      accessToken: null,
      refreshToken: null,
      userId: null,
      companyUser: null,
      govOfficer: null,
    });
  },
}));
