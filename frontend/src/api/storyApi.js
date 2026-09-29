import axiosClient from './axiosClient'

export const storyApi = {
  list: () => axiosClient.get('/api/stories'),
  create: (payload) => axiosClient.post('/api/stories', payload),
  delete: (storyId) => axiosClient.delete(`/api/stories/${storyId}`),
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return axiosClient.post('/api/stories/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
