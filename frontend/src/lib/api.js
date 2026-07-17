import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000",
})

export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append("file", file)

  const res = await api.post("/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export async function extractDocument(documentId) {
  const res = await api.post(`/extract/${documentId}`)
  return res.data
}

export async function extractFields(documentId) {
  const res = await api.post(`/extract-fields/${documentId}`)
  return res.data
}

export async function updateExtraction(documentId, payload) {
  const res = await api.put(`/extraction/${documentId}`, payload)
  return res.data
}

export async function getDocument(documentId) {
  const res = await api.get(`/document/${documentId}`)
  return res.data
}

export async function getExtraction(documentId) {
  const res = await api.get(`/extraction/${documentId}`)
  return res.data
}

export function exportJsonUrl(documentId) {
  return `http://localhost:8000/export/json/${documentId}`
}

export function exportExcelUrl(documentId) {
  return `http://localhost:8000/export/excel/${documentId}`
}

export async function getHistory() {
  const res = await api.get("/history")
  return res.data
}

export default api
