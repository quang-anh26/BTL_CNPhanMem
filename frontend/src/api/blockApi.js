import axiosClient from './axiosClient'

export const blockApi = {
  block: (userId) => axiosClient.post(`/api/blocks/${userId}`),
  unblock: (userId) => axiosClient.delete(`/api/blocks/${userId}`),
}
