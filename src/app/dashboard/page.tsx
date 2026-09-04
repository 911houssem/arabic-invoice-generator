'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  total: number
  dueDate: string
  createdAt: string
  client?: {
    name: string
  }
  items: any[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/invoices')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setInvoices(data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوعة'
      case 'sent':
        return 'مرسلة'
      case 'overdue':
        return 'متاخرة'
      default:
        return 'مسودة'
    }
  }

  const downloadPDF = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/pdf?id=${invoiceId}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ف</span>
              </div>
              <span className="text-xl font-bold text-gray-900">فواتير</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/invoices/new" className="btn-primary">
                + فاتورة جديدة
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي الفواتير"
            value={invoices.length}
            icon="📄"
          />
          <StatCard
            title="الفواتير المدفوعة"
            value={invoices.filter(i => i.status === 'paid').length}
            icon="✅"
          />
          <StatCard
            title="الفواتير المعلقة"
            value={invoices.filter(i => i.status !== 'paid').length}
            icon="⏳"
          />
          <StatCard
            title="الإجمالي"
            value={`${invoices.reduce((sum, i) => sum + i.total, 0).toFixed(2)} ﷼`}
            icon="💰"
          />
        </div>

        {/* Invoices Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">الفواتير</h2>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فواتير بعد</h3>
              <p className="text-gray-600 mb-6">ابدأ بإنشاء فاتورتك الأولى</p>
              <Link href="/invoices/new" className="btn-primary">
                + إنشاء فاتورة جديدة
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-right p-4">رقم الفاتورة</th>
                    <th className="text-right p-4">العميل</th>
                    <th className="text-right p-4">المبلغ</th>
                    <th className="text-right p-4">الحالة</th>
                    <th className="text-right p-4">تاريخ الاستحقاق</th>
                    <th className="text-right p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="p-4 text-gray-600">{invoice.client?.name || 'عميل'}</td>
                      <td className="p-4 font-medium">{invoice.total.toFixed(2)} ﷼</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => downloadPDF(invoice.id)}
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                        >
                          تحميل PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: string }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}
