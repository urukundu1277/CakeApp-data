const Order = require('../models/Order');

const generateOrderNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const prefix = `${year}-${month}-${day}`;

  const lastOrder = await Order.findOne({ orderNumber: { $regex: `^${prefix}-` } })
    .sort({ orderNumber: -1 })
    .select('orderNumber');

  let nextNumber = 1;
  if (lastOrder && lastOrder.orderNumber) {
    const parts = lastOrder.orderNumber.split('-');
    const lastNumber = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
};

module.exports = { generateOrderNumber };
