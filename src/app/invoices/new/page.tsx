'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 15,
    notes: '',
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ])

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (form.taxRate / 100)
  const total = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (items.every(item => !item.description)) {
      setError('يجب إضافة صنف واحد على الأقل')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            name: form.clientName,
            email: form.clientEmail,
            phone: form.clientPhone,
            address: form.clientAddress,
          },
          items: items.filter(item => item.description),
          dueDate: form.dueDate,
          taxRate: form.taxRate,
          notes: form.notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ في إنشاء الفاتورة')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ف</span>
              </div>
              <span className="text-xl font-bold text-gray-900">فواتير</span>
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">إنشاء فاتورة جديدة</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Client Info */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">بيانات العميل</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">اسم العميل</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="اسم العميل أو الشركة"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="client@email.com"
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="label">رقم الجوال</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+966 5X XXX XXXX"
                  value={form.clientPhone}
                  onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="label">العنوان</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="المدينة، المنطقة"
                  value={form.clientAddress}
                  onChange={(e) => setForm({ ...form, clientAddress: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">بنود الفاتورة</h2>
              <button type="button" onClick={addItem} className="btn-secondary text-sm py-2">
                + إضافة بند
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <label className="label">الوصف</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="وصف المنتج أو الخدمة"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">الكمية</label>
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">سعر الوحدة</label>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">المجموع</label>
                    <div className="input-field bg-gray-50">
                      {(item.quantity * item.unitPrice).toFixed(2)} ﷼
                    </div>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="w-full h-12 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الفاتورة</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">تاريخ الاستحقاق</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="label">نسبة الضريبة (%)</label>
                <input
                  type="number"
                  className="input-field"
                  min="0"
                  max="100"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">ملاحظات (اختياري)</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="ملاحظات إضافية على الفاتورة..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">الملخص</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ﷼</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>الضريبة ({form.taxRate}%)</span>
                <span>{taxAmount.toFixed(2)} ﷼</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-primary-600 pt-3 border-t">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} ﷼</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/dashboard" className="btn-secondary">
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء الفاتورة'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
