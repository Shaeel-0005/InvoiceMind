import UploadCard from "@/components/UploadCard"

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">InvoiceMind AI</h1>
          <p className="text-sm text-muted-foreground">AI-powered invoice extraction using OCR + LLMs</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <UploadCard />
      </main>
    </div>
  )
}
