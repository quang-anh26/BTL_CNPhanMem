import axiosClient from './axiosClient'

export const userApi = {
  me: () => axiosClient.get('/api/users/me'),
  getById: (id) => axiosClient.get(`/api/users/${id}`),
  updateProfile: (payload) => axiosClient.put('/api/users/me', payload),
  changePassword: (payload) => axiosClient.post('/api/users/me/password', payload),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('file', file)
    return axiosClient.post('/api/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  search: (q) => axiosClient.get('/api/users/search', { params: { q } }),
}
