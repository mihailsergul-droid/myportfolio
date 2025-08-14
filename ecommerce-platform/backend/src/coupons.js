// Mock coupons data
let coupons = [
  { id: 1, code: 'SAVE10', discount: 10, type: 'percentage', active: true, minAmount: 50 },
  { id: 2, code: 'WELCOME20', discount: 20, type: 'percentage', active: true, minAmount: 100 },
  { id: 3, code: 'FIXED50', discount: 50, type: 'fixed', active: true, minAmount: 200 }
];

const validateCoupon = (code, orderTotal) => {
  const coupon = coupons.find(c => c.code === code && c.active);
  
  if (!coupon) {
    return { valid: false, error: 'Купон не найден или неактивен' };
  }
  
  if (orderTotal < coupon.minAmount) {
    return { valid: false, error: `Минимальная сумма заказа: $${coupon.minAmount}` };
  }
  
  const discount = coupon.type === 'percentage' 
    ? (orderTotal * coupon.discount) / 100
    : coupon.discount;
    
  return { 
    valid: true, 
    discount: Math.min(discount, orderTotal),
    coupon 
  };
};

module.exports = { coupons, validateCoupon };