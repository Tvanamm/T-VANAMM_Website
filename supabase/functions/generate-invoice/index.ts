import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { orderId, generateForAdmin = false } = await req.json()

    if (!orderId) {
      throw new Error('Order ID is required')
    }

    console.log('Generating invoice for order:', orderId)

    // Fetch order details with related data
    const { data: orderData, error: orderError } = await supabaseClient
      .from('franchise_orders')
      .select(`
        *,
        franchise_members!inner(name, email, phone, franchise_location, tvanamm_id),
        order_items!inner(item_name, quantity, unit_price, total_price)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !orderData) {
      throw new Error('Order not found')
    }

    // Fetch payment transaction details
    const { data: paymentData } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'completed')
      .single()

    if (!paymentData) {
      throw new Error('No completed payment found for this order')
    }

    // Generate PDF invoice
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Header
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text('TVANAMM', pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont(undefined, 'normal')
    doc.text('INVOICE', pageWidth / 2, 45, { align: 'center' })

    // Order details
    let yPos = 70
    doc.setFontSize(10)
    doc.text(`Invoice No: INV-${orderData.id.slice(0, 8).toUpperCase()}`, margin, yPos)
    doc.text(`Order Date: ${new Date(orderData.created_at).toLocaleDateString()}`, margin, yPos + 10)
    doc.text(`TVANAMM ID: ${orderData.franchise_members.tvanamm_id || 'N/A'}`, margin, yPos + 20)

    // Franchise details
    yPos += 40
    doc.setFont(undefined, 'bold')
    doc.text('Bill To:', margin, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(orderData.franchise_members.name, margin, yPos + 10)
    doc.text(orderData.franchise_members.email, margin, yPos + 20)
    doc.text(orderData.franchise_members.phone || '', margin, yPos + 30)
    doc.text(orderData.franchise_members.franchise_location, margin, yPos + 40)

    // Items table
    yPos += 60
    doc.setFont(undefined, 'bold')
    doc.text('Item', margin, yPos)
    doc.text('Qty', pageWidth - 80, yPos)
    doc.text('Price', pageWidth - 60, yPos)
    doc.text('Total', pageWidth - 30, yPos)

    // Draw line
    doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5)

    yPos += 15
    doc.setFont(undefined, 'normal')
    let subtotal = 0

    orderData.order_items.forEach((item: any) => {
      doc.text(item.item_name, margin, yPos)
      doc.text(item.quantity.toString(), pageWidth - 80, yPos)
      doc.text(`₹${item.unit_price}`, pageWidth - 60, yPos)
      doc.text(`₹${item.total_price}`, pageWidth - 30, yPos)
      subtotal += parseFloat(item.total_price)
      yPos += 10
    })

    // Totals
    yPos += 10
    doc.line(pageWidth - 80, yPos, pageWidth - margin, yPos)
    yPos += 10

    doc.text('Subtotal:', pageWidth - 60, yPos)
    doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - 30, yPos)

    if (orderData.delivery_fee_override > 0) {
      yPos += 10
      doc.text('Delivery Fee:', pageWidth - 60, yPos)
      doc.text(`₹${orderData.delivery_fee_override}`, pageWidth - 30, yPos)
    }

    if (orderData.loyalty_points_used > 0) {
      yPos += 10
      doc.text('Loyalty Discount:', pageWidth - 60, yPos)
      doc.text(`-₹${(orderData.loyalty_points_used * 10).toFixed(2)}`, pageWidth - 30, yPos)
    }

    yPos += 10
    doc.setFont(undefined, 'bold')
    doc.text('Total:', pageWidth - 60, yPos)
    doc.text(`₹${orderData.total_amount}`, pageWidth - 30, yPos)

    // Payment details
    yPos += 20
    doc.setFont(undefined, 'normal')
    doc.text(`Payment ID: ${paymentData.razorpay_payment_id || 'N/A'}`, margin, yPos)
    doc.text(`Payment Status: ${paymentData.status.toUpperCase()}`, margin, yPos + 10)

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')
    const pdfBytes = new Uint8Array(pdfBuffer)

    // Generate file name and path
    const fileName = `invoice-${orderData.id}-${Date.now()}.pdf`
    const userId = orderData.franchise_members.user_id || 'system'
    const filePath = `${userId}/${fileName}`

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from('invoices')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload invoice: ${uploadError.message}`)
    }

    // Calculate expiry date based on access level
    const now = new Date()
    const expiryDays = generateForAdmin ? 16 : 30
    const expiresAt = new Date(now.getTime() + (expiryDays * 24 * 60 * 60 * 1000))

    // Save invoice record to database
    const { error: dbError } = await supabaseClient
      .from('invoices')
      .insert({
        order_id: orderId,
        file_path: filePath,
        file_name: fileName,
        expires_at: expiresAt.toISOString(),
        access_level: generateForAdmin ? 'admin' : 'franchisee'
      })

    if (dbError) {
      console.error('Failed to save invoice record:', dbError)
      // Don't throw error as file is already uploaded
    }

    console.log('Invoice generated successfully:', fileName)

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileName,
        filePath,
        expiresAt: expiresAt.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error generating invoice:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})