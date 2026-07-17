import { useState } from "react"

const FIELD_LABELS = {
  invoice_number: "Invoice Number",
  vendor: "Vendor",
  customer: "Customer",
  invoice_date: "Invoice Date",
  due_date: "Due Date",
  tax: "Tax",
  total: "Total",
  currency: "Currency",
}

function confidenceColor(score) {
  if (score === undefined || score === null) return "bg-muted text-muted-foreground"
  if (score >= 0.9) return "bg-emerald-500/15 text-emerald-500"
  if (score >= 0.7) return "bg-amber-500/15 text-amber-500"
  return "bg-red-500/15 text-red-500"
}

export default function FieldsTable({ extraction, onChange }) {
  const [fields, setFields] = useState(extraction)

  const updateField = (key, value) => {
    const next = { ...fields, [key]: value }
    setFields(next)
    onChange?.(next)
  }

  const updateItem = (index, key, value) => {
    const items = [...fields.items]
    items[index] = { ...items[index], [key]: value }
    updateField("items", items)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(FIELD_LABELS).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">{label}</label>
              {fields.confidence?.[key] !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${confidenceColor(fields.confidence[key])}`}>
                  {Math.round(fields.confidence[key] * 100)}%
                </span>
              )}
            </div>
            <input
              className="w-full bg-input/30 border border-border rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={fields[key] ?? ""}
              onChange={(e) => updateField(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {fields.items?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Line Items</p>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-xs">
                <tr>
                  <th className="text-left px-2 py-1.5 font-medium">Description</th>
                  <th className="text-right px-2 py-1.5 font-medium w-20">Qty</th>
                  <th className="text-right px-2 py-1.5 font-medium w-24">Unit Price</th>
                  <th className="text-right px-2 py-1.5 font-medium w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {fields.items.map((item, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-2 py-1">
                      <input
                        className="w-full bg-transparent text-sm focus:outline-none"
                        value={item.description ?? ""}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        className="w-full bg-transparent text-sm text-right focus:outline-none"
                        value={item.quantity ?? ""}
                        onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        className="w-full bg-transparent text-sm text-right focus:outline-none"
                        value={item.unit_price ?? ""}
                        onChange={(e) => updateItem(i, "unit_price", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        className="w-full bg-transparent text-sm text-right focus:outline-none"
                        value={item.amount ?? ""}
                        onChange={(e) => updateItem(i, "amount", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
