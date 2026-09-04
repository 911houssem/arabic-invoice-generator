import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.userId },
      include: {
        client: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Fetch invoices error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الفواتير' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    if (user.plan === 'free' && user.invoiceCount >= user.maxInvoices) {
      return NextResponse.json(
        { error: 'لقد وصلت الحد الأقصى للفواتير المجانية. يرجى الترقية لخطة مدفوعة.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { clientId, items, dueDate, notes, taxRate = 15 } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'يجب إضافة صنف واحد على الأقل' },
        { status: 400 }
      )
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        dueDate: new Date(dueDate),
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes,
        userId: session.userId,
        clientId: clientId || null,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    })

    await prisma.user.update({
      where: { id: session.userId },
      data: { invoiceCount: { increment: 1 } },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الفاتورة' },
      { status: 500 }
    )
  }
}
