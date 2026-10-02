import axiosClient from './axiosClient'

export const eventApi = {
  list: (filter = 'ALL') => axiosClient.get('/api/events', { params: { filter } }),
  get: (eventId) => axiosClient.get(`/api/events/${eventId}`),
  create: (payload) => axiosClient.post('/api/events', payload),
  update: (eventId, payload) => axiosClient.put(`/api/events/${eventId}`, payload),
  cancel: (eventId) => axiosClient.delete(`/api/events/${eventId}`),
  attendance: (eventId, status) => axiosClient.post(`/api/events/${eventId}/attendance`, { status }),
  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return axiosClient.post('/api/events/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
