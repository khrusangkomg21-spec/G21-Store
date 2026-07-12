export function getActivePromoDiscount(subtotal: number): { rate: number, amount: number, name: string } | null {
  const today = new Date();
  
  // For testing, uncomment this to mock a promo date (e.g. Jan 1)
  // const today = new Date('2026-01-01');

  const month = today.getMonth() + 1; // 1-12
  const date = today.getDate(); // 1-31

  let isPromoDay = false;
  let promoName = '';

  // 1. Double numbers (1.1, 2.2, ..., 12.12)
  if (month === date) {
    isPromoDay = true;
    promoName = `แคมเปญ ${month}.${date}`;
  }
  // 2. Teacher's Day (Jan 16)
  else if (month === 1 && date === 16) {
    isPromoDay = true;
    promoName = 'โปรโมชันวันครูแห่งชาติ';
  }
  // 3. Christmas (Dec 25)
  else if (month === 12 && date === 25) {
    isPromoDay = true;
    promoName = 'Merry Christmas 🎄';
  }
  // 4. New Year (Dec 31 - Jan 1)
  else if ((month === 12 && date === 31) || (month === 1 && date === 1)) {
    isPromoDay = true;
    promoName = 'Happy New Year 🎆';
  }
  // 5. Songkran (Apr 13-16)
  else if (month === 4 && date >= 13 && date <= 16) {
    isPromoDay = true;
    promoName = 'โปรโมชันสงกรานต์ 💦';
  }

  if (!isPromoDay) return null;
  if (subtotal < 100) return null; // No discount for < 100

  // Calculate discount based on G21 rules
  let rate = 0;
  
  if (subtotal >= 500) {
    rate = 0.21; // 21%
  } else if (subtotal >= 100) {
    rate = 0.12; // 12%
  }

  if (rate === 0) return null;

  const amount = Math.floor(subtotal * rate);

  return {
    rate,
    amount,
    name: promoName
  };
}
