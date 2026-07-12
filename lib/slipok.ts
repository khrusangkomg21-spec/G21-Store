import fs from 'fs';

export async function checkSlipWithSlipOK(slipFilePath: string, expectedAmount: number) {
  const apiKey = process.env.SLIPOK_API_KEY;
  const branchId = process.env.SLIPOK_BRANCH_ID; // Your GSB account branch/merchant ID from SlipOK
  
  if (!apiKey || !branchId) {
    console.warn('SLIPOK_API_KEY or SLIPOK_BRANCH_ID not set. Using mock slip verification.');
    return {
      success: true,
      data: {
        success: true,
        amount: expectedAmount,
        bank: 'GSB',
        receiver_name: 'อัจฉรา จุติอมรเลิศ',
      },
      message: 'Mock verification successful'
    };
  }

  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(slipFilePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append('files', blob, 'slip.jpg');

    const response = await fetch('https://api.slipok.com/api/line/apikey/' + branchId, {
      method: 'POST',
      headers: {
        'x-authorization': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('SlipOK API error:', await response.text());
      return { success: false, message: 'Failed to connect to SlipOK' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('SlipOK API fetch error:', error);
    return { success: false, message: 'Error verifying slip' };
  }
}
