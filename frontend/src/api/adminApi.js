import axiosClient from './axiosClient'

export const adminApi = {
  dashboard: () => axiosClient.get('/api/admin/dashboard'),
  users: (q) => axiosClient.get('/api/admin/users', { params: { q } }),
  lock: (id) => axiosClient.post(`/api/admin/users/${id}/lock`),
  unlock: (id) => axiosClient.post(`/api/admin/users/${id}/unlock`),
}
