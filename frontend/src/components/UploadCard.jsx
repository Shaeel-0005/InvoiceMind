import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import FieldsTable from "@/components/FieldsTable"
import {
  uploadDocument,
  extractDocument,
  extractFields,
  updateExtraction,
  exportJsonUrl,
  exportExcelUrl,
} from "@/lib/api"

const STATUS_LABEL = {
  idle: "Drop an invoice to get started",
  uploading: "Uploading...",
  extracting: "Running OCR...",
  done: "Done",
  error: "Something went wrong",
}

export default function UploadCard() {
  const [status, setStatus] = useState("idle")
  const [document, setDocument] = useState(null)
  const [error, setError] = useState(null)

  const [fields, setFields] = useState(null)
  const [fieldsLoading, setFieldsLoading] = useState(false)
  const [fieldsError, setFieldsError] = useState(null)

  const [saveState, setSaveState] = useState("idle") // idle | saving | saved | error

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setDocument(null)
    setFields(null)
    setFieldsError(null)
    setSaveState("idle")

    try {
      setStatus("uploading")
      const uploaded = await uploadDocument(file)

      setStatus("extracting")
      const extracted = await extractDocument(uploaded.id)

      setDocument(extracted)
      setStatus("done")
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.detail || err.message)
      setStatus("error")
    }
  }, [])

  const handleExtractFields = async () => {
    if (!document) return
    setFieldsError(null)
    setFieldsLoading(true)
    setSaveState("idle")
    try {
      const result = await extractFields(document.id)
      setFields(result)
    } catch (err) {
      console.error(err)
      setFieldsError(err?.response?.data?.detail || err.message)
    } finally {
      setFieldsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!document || !fields) return
    setSaveState("saving")
    try {
      const updated = await updateExtraction(document.id, {
        invoice_number: fields.invoice_number,
        vendor: fields.vendor,
        customer: fields.customer,
        invoice_date: fields.invoice_date,
        due_date: fields.due_date,
        tax: fields.tax === "" ? null : Number(fields.tax),
        total: fields.total === "" ? null : Number(fields.total),
        currency: fields.currency,
        items: fields.items.map((item) => ({
          description: item.description,
          quantity: item.quantity === "" ? null : Number(item.quantity),
          unit_price: item.unit_price === "" ? null : Number(item.unit_price),
          amount: item.amount === "" ? null : Number(item.amount),
        })),
      })
      setFields(updated)
      setSaveState("saved")
    } catch (err) {
      console.error(err)
      setSaveState("error")
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
  })

  const isBusy = status === "uploading" || status === "extracting"

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-muted" : "border-border bg-background"}
          ${isBusy ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        <p className="text-foreground font-medium">
          {isDragActive ? "Drop it here" : "Drag & drop an invoice, or click to browse"}
        </p>
        <p className="text-muted-foreground text-sm mt-1">PDF, JPG, or PNG</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{STATUS_LABEL[status]}</span>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      {document && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-card-foreground">{document.original_name}</h3>
            <span className="text-xs text-muted-foreground">{document.status}</span>
          </div>

          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted rounded-md p-3 max-h-60 overflow-auto">
            {document.ocr_text || "No text extracted."}
          </pre>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={handleExtractFields} disabled={fieldsLoading}>
              {fieldsLoading ? "Extracting fields..." : "Extract Fields (AI)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDocument(null)
                setFields(null)
                setStatus("idle")
              }}
            >
              Upload another
            </Button>
          </div>

          {fieldsError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">
              {fieldsError}
            </div>
          )}

          {fields && (
            <div className="pt-2 border-t border-border space-y-3">
              <FieldsTable extraction={fields} onChange={setFields} />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button size="sm" variant="secondary" onClick={handleSave} disabled={saveState === "saving"}>
                  {saveState === "saving" ? "Saving..." : "Save Changes"}
                </Button>
                <a href={exportJsonUrl(document.id)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">Export JSON</Button>
                </a>
                <a href={exportExcelUrl(document.id)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">Export Excel</Button>
                </a>
                {saveState === "saved" && (
                  <span className="text-xs text-emerald-500">Saved</span>
                )}
                {saveState === "error" && (
                  <span className="text-xs text-destructive">Save failed</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
