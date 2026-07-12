// LINE Messaging API (Push Message)
export async function sendLineNotify(message: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const adminUserId = process.env.LINE_ADMIN_USER_ID;
  
  if (!token || !adminUserId) {
    console.warn('LINE_CHANNEL_ACCESS_TOKEN or LINE_ADMIN_USER_ID is not set in .env');
    return false;
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: adminUserId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LINE Messaging API Error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('LINE Messaging API fetch error:', error);
    return false;
  }
}
