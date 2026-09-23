import axiosClient from './axiosClient'

export const messageApi = {
  history: (conversationId, page = 0) =>
    axiosClient.get(`/api/messages/conversation/${conversationId}`, { params: { page } }),
  recall: (messageId) => axiosClient.post(`/api/messages/${messageId}/recall`),
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return axiosClient.post('/api/messages/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
