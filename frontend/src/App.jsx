import { useState } from "react"
import UploadCard from "@/components/UploadCard"
import History from "@/components/History"
import { Button } from "@/components/ui/button"

export default function App() {
  const [tab, setTab] = useState("upload")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">InvoiceMind AI</h1>
            <p className="text-sm text-muted-foreground">AI-powered invoice extraction using OCR + LLMs</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tab === "upload" ? "default" : "outline"}
              onClick={() => setTab("upload")}
            >
              Upload
            </Button>
            <Button
              size="sm"
              variant={tab === "history" ? "default" : "outline"}
              onClick={() => setTab("history")}
            >
              History
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {tab === "upload" ? <UploadCard /> : <History />}
      </main>
    </div>
  )
}
