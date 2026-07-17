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

export async function getHistory() {
  const res = await api.get("/history")
  return res.data
}

export default api
