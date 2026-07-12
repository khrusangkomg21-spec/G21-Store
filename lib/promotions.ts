export function getActivePromoDiscount(subtotal: number): { rate: number, amount: number, name: string } | null {
  if (subtotal < 500) return null; // No discount for < 500

  // Calculate standard discount based on G21 rules
  let rate = 0;
  let promoName = '';
  
  if (subtotal >= 1000) {
    rate = 0.15; // 15%
    promoName = 'ส่วนลดพิเศษ 15% (ยอด 1,000+)';
  } else if (subtotal >= 500) {
    rate = 0.10; // 10%
    promoName = 'ส่วนลดพิเศษ 10% (ยอด 500+)';
  }

  if (rate === 0) return null;

  const amount = Math.floor(subtotal * rate);

  return {
    rate,
    amount,
    name: promoName
  };
}
