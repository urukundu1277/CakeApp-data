const User = require('../models/User');
const Order = require('../models/Order');

const generateCustomerId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${year}-${month}`;

  const lastUser = await User.findOne({ customerId: { $regex: `^${prefix}-` } })
    .sort({ customerId: -1 })
    .select('customerId');

  let nextNumber = 1;
  if (lastUser && lastUser.customerId) {
    const parts = lastUser.customerId.split('-');
    const lastNumber = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
};

module.exports = { generateCustomerId };
