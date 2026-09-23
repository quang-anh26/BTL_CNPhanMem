import axiosClient from './axiosClient'

export const authApi = {
  register: (payload) => axiosClient.post('/api/auth/register', payload),
  login: (payload) => axiosClient.post('/api/auth/login', payload),
  refresh: (refreshToken) => axiosClient.post('/api/auth/refresh', { refreshToken }),
  logout: () => axiosClient.post('/api/auth/logout'),
}
