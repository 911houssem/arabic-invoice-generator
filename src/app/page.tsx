import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ف</span>
              </div>
              <span className="text-xl font-bold text-gray-900">فواتير</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="btn-primary">
                ابدأ مجاناً
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-relaxed">
            أنشئ فواتيرك
            <span className="text-primary-600"> احترافية </span>
            <br />
            بالعربية في ثوانٍ
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            مولّد فواتير عربي متكامل - أنشئ فواتير احترافية، أرسلها لعملائك، وتتبع مدفوعاتك
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              ابدأ مجاناً الآن
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-4">
              اكتشف المزيد
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            لماذا تختار فواتير؟
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📄"
              title="فواتير احترافية"
              description="أنشئ فواتير بتصميم احترافي مع دعم كامل للغة العربية والعملات المحلية"
            />
            <FeatureCard
              icon="📊"
              title="إدارة ذكية"
              description="تتبع فواتيرك وعملائك ومدفوعاتك من لوحة تحكم واحدة"
            />
            <FeatureCard
              icon="📥"
              title="تصدير PDF"
              description="صدّر فواتيرك كملفات PDF جاهزة للإرسال عبر البريد الإلكتروني"
            />
            <FeatureCard
              icon="👥"
              title="إدارة العملاء"
              description="أضف عملاءك واحفظ بياناتهم لإعادة استخدامها في الفواتير القادمة"
            />
            <FeatureCard
              icon="🔔"
              title="تذكيرات تلقائية"
              description="تلقّ تذكيرات بالفواتير المستحقة والمدفوعات المتأخرة"
            />
            <FeatureCard
              icon="🔒"
              title="آمن وموثوق"
              description="بياناتك محفوظة ومشفرة بأمان عالي. نحترم خصوصيتك"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            خطط الاشتراك
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="مجاني"
              price="0"
              features={[
                '5 فواتير شهرياً',
                'عميل واحد',
                'تصدير PDF',
                'دعم عبر البريد الإلكتروني',
              ]}
              popular={false}
            />
            <PricingCard
              name="احترافي"
              price="49"
              features={[
                'فواتير غير محدودة',
                'عملاء غير محدودين',
                'تصدير PDF وWord',
                'تقارير مفصلة',
                'دعم أولوي',
                'شعار مخصص',
              ]}
              popular={true}
            />
            <PricingCard
              name="المؤسسات"
              price="199"
              features={[
                'كل مميزات الاحترافي',
                'حسابات متعددة',
                'API متكامل',
                'دعم فني مخصص',
                'SLA 99.9%',
                'تخصيص كامل',
              ]}
              popular={false}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ف</span>
              </div>
              <span className="text-xl font-bold">فواتير</span>
            </div>
            <p className="text-gray-400">
              © 2024 فواتير. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function PricingCard({ name, price, features, popular }: { name: string; price: string; features: string[]; popular: boolean }) {
  return (
    <div className={`card ${popular ? 'border-primary-600 border-2 relative' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
          الأكثر شيوعاً
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-600"> ﷼/شهر</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block text-center ${popular ? 'btn-primary' : 'btn-secondary'} w-full`}
      >
        ابدأ الآن
      </Link>
    </div>
  )
}
