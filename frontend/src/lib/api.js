import axios from "axios"

// In production (Vercel), set VITE_API_URL to your EC2 backend URL,
// e.g. https://api.yourdomain.com or http://your-ec2-ip:8000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_URL,
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
  return `${API_URL}/export/json/${documentId}`
}

export function exportExcelUrl(documentId) {
  return `${API_URL}/export/excel/${documentId}`
}

export async function getHistory() {
  const res = await api.get("/history")
  return res.data
}

export default api