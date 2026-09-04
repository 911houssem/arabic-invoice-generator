'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    if (form.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          businessName: form.businessName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ في التسجيل')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">ف</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">فواتير</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-600 mt-2">ابدأ بإنشاء فواتيرك المجانية</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="label">الاسم الكامل</label>
            <input
              type="text"
              className="input-field"
              placeholder="محمد أحمد"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">البريد الإلكتروني</label>
            <input
              type="email"
              className="input-field"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="label">اسم النشاط التجاري (اختياري)</label>
            <input
              type="text"
              className="input-field"
              placeholder="شركتي للتقنية"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
          </div>

          <div>
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="label">تأكيد كلمة المرور</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                جاري التسجيل...
              </>
            ) : (
              'إنشاء حساب'
            )}
          </button>

          <p className="text-center text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              سجل دخولك
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
