import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import puppeteer from 'puppeteer'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('id')

    if (!invoiceId) {
      return NextResponse.json({ error: 'معرف الفاتورة مطلوب' }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: session.userId },
      include: {
        client: true,
        items: true,
        user: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'الفاتورة غير موجودة' }, { status: 404 })
    }

    const htmlContent = generateInvoiceHTML(invoice)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    })

    await browser.close()

    const pdfBuffer = Buffer.from(pdfUint8Array)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء ملف PDF' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any) {
  const formattedDate = format(new Date(invoice.issueDate), 'dd/MM/yyyy', { locale: ar })
  const formattedDueDate = format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: ar })

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          direction: rtl;
          color: #1f2937;
          line-height: 1.6;
        }
        
        .invoice {
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .company-info h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 8px;
        }
        
        .company-info p {
          color: #6b7280;
          font-size: 14px;
        }
        
        .invoice-title {
          text-align: left;
        }
        
        .invoice-title h2 {
          font-size: 32px;
          font-weight: 700;
          color: #1e40af;
        }
        
        .invoice-title .number {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }
        
        .details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        .details-box {
          flex: 1;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          margin-left: 16px;
        }
        
        .details-box:last-child {
          margin-left: 0;
        }
        
        .details-box h3 {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        
        .details-box p {
          font-size: 14px;
          color: #1f2937;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        
        th {
          background: #1e40af;
          color: white;
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 14px;
        }
        
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        
        tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .totals {
          display: flex;
          justify-content: flex-start;
          margin-top: 24px;
        }
        
        .totals-box {
          width: 300px;
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        
        .totals-row.total {
          border-top: 2px solid #1e40af;
          margin-top: 8px;
          padding-top: 12px;
          font-weight: 700;
          font-size: 18px;
          color: #1e40af;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        .notes {
          margin-top: 24px;
          padding: 16px;
          background: #fffbeb;
          border-radius: 8px;
          border: 1px solid #fbbf24;
        }
        
        .notes h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #92400e;
        }
        
        .notes p {
          font-size: 14px;
          color: #78350f;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="company-info">
            <h1>${invoice.user.businessName || invoice.user.name}</h1>
            <p>${invoice.user.email}</p>
            ${invoice.user.phone ? `<p>${invoice.user.phone}</p>` : ''}
            ${invoice.user.address ? `<p>${invoice.user.address}</p>` : ''}
          </div>
          <div class="invoice-title">
            <h2>فاتورة</h2>
            <div class="number">${invoice.invoiceNumber}</div>
          </div>
        </div>
        
        <div class="details">
          <div class="details-box">
            <h3>الفاتورة إلى</h3>
            <p><strong>${invoice.client?.name || 'عميل'}</strong></p>
            ${invoice.client?.email ? `<p>${invoice.client.email}</p>` : ''}
            ${invoice.client?.phone ? `<p>${invoice.client.phone}</p>` : ''}
            ${invoice.client?.address ? `<p>${invoice.client.address}</p>` : ''}
          </div>
          <div class="details-box">
            <h3>تفاصيل الفاتورة</h3>
            <p><strong>تاريخ الإصدار:</strong> ${formattedDate}</p>
            <p><strong>تاريخ الاستحقاق:</strong> ${formattedDueDate}</p>
            <p><strong>الحالة:</strong> ${invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'sent' ? 'مرسلة' : invoice.status === 'overdue' ? 'متاخرة' : 'مسودة'}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>الوصف</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)} ﷼</td>
                <td>${item.total.toFixed(2)} ﷼</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-box">
            <div class="totals-row">
              <span>المجموع الفرعي</span>
              <span>${invoice.subtotal.toFixed(2)} ﷼</span>
            </div>
            <div class="totals-row">
              <span>الضريبة (${invoice.taxRate}%)</span>
              <span>${invoice.taxAmount.toFixed(2)} ﷼</span>
            </div>
            <div class="totals-row total">
              <span>الإجمالي</span>
              <span>${invoice.total.toFixed(2)} ﷼</span>
            </div>
          </div>
        </div>
        
        ${invoice.notes ? `
          <div class="notes">
            <h4>ملاحظات</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>تم إنشاء هذه الفاتورة بواسطة نظام فواتير</p>
        </div>
      </div>
    </body>
    </html>
  `
}
