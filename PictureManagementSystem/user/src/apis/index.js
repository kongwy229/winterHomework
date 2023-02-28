import axios from 'axios'
const api = 'http://localhost:3000/'
export async function getList (params) {
  return axios.get(`${api}images`, {
    params: {
      pageSize: 20,
      sort: params.sort
    }
  })
}
export async function upload (params) {
  return axios.post(`${api}images`, params)
}
