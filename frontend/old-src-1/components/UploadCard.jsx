import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import FieldsTable from "@/components/FieldsTable"
import { uploadDocument, extractDocument, extractFields } from "@/lib/api"

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

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setDocument(null)
    setFields(null)
    setFieldsError(null)

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

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleExtractFields}
              disabled={fieldsLoading}
            >
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
            <div className="pt-2 border-t border-border">
              <FieldsTable extraction={fields} onChange={setFields} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
