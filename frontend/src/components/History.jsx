import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getHistory, getExtraction, exportJsonUrl, exportExcelUrl } from "@/lib/api"

const STATUS_COLOR = {
  uploaded: "bg-muted text-muted-foreground",
  ocr_done: "bg-blue-500/15 text-blue-400",
  ocr_failed: "bg-red-500/15 text-red-500",
  extracted: "bg-emerald-500/15 text-emerald-500",
}

export default function History() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [extraction, setExtraction] = useState(null)

  useEffect(() => {
    getHistory()
      .then(setDocuments)
      .catch((err) => setError(err?.response?.data?.detail || err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (doc) => {
    if (expandedId === doc.id) {
      setExpandedId(null)
      setExtraction(null)
      return
    }
    setExpandedId(doc.id)
    setExtraction(null)
    try {
      const data = await getExtraction(doc.id)
      setExtraction(data)
    } catch {
      setExtraction(null)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading history...</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (documents.length === 0) return <p className="text-sm text-muted-foreground">No uploads yet.</p>

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">{doc.original_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(doc.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLOR[doc.status] || "bg-muted text-muted-foreground"}`}>
                {doc.status}
              </span>
              <Button size="sm" variant="outline" onClick={() => toggleExpand(doc)}>
                {expandedId === doc.id ? "Hide" : "View"}
              </Button>
            </div>
          </div>

          {expandedId === doc.id && (
            <div className="pt-2 border-t border-border space-y-2">
              {extraction ? (
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Vendor:</span> {extraction.vendor || "—"}</p>
                  <p><span className="text-muted-foreground">Invoice #:</span> {extraction.invoice_number || "—"}</p>
                  <p><span className="text-muted-foreground">Total:</span> {extraction.total ?? "—"} {extraction.currency || ""}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No AI extraction run yet for this document.</p>
              )}
              <div className="flex gap-2 pt-1">
                <a href={exportJsonUrl(doc.id)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">Export JSON</Button>
                </a>
                <a href={exportExcelUrl(doc.id)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">Export Excel</Button>
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
