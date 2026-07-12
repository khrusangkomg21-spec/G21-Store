export async function sendDeliveryEmail(to: string, orderNumber: string, downloadLink: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Email not sent.');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'G21 Store <onboarding@resend.dev>', // Use verified domain later
        to: [to],
        subject: `ดาวน์โหลดไฟล์สื่อการสอนของคุณ (ออเดอร์: ${orderNumber})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #1A4731; margin: 0;">G21 คลังสื่องานสอน</h1>
              <p style="color: #64748b; margin-top: 5px;">ขอบคุณที่อุดหนุนสื่อการสอนของเราครับ!</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #334155; font-size: 18px;">ออเดอร์ของคุณได้รับการอนุมัติแล้ว 🎉</h2>
              <p style="color: #475569; line-height: 1.6;">
                สวัสดีครับ, คำสั่งซื้อรหัส <strong>${orderNumber}</strong> ของคุณได้รับการตรวจสอบและอนุมัติเรียบร้อยแล้ว 
                คุณสามารถดาวน์โหลดไฟล์สื่องานสอนได้จากลิงก์ด้านล่างนี้ครับ
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${downloadLink}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                คลิกเพื่อดาวน์โหลดไฟล์
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px;">
              <p>หากลิงก์มีปัญหาหรือต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อได้ที่เพจ Facebook ของเรา</p>
              <p>&copy; ${new Date().getFullYear()} G21 Lesson Plan Store. All rights reserved.</p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      console.error('Failed to send email via Resend', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
