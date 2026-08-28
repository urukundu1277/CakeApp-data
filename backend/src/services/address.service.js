const Address = require('../models/Address');

const getAllAddresses = async (userId) => {
  return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

const createAddress = async (addressData) => {
  const address = await Address.create(addressData);
  return address;
};

const updateAddress = async (id, updateData) => {
  const address = await Address.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  return address;
};

const deleteAddress = async (id) => {
  const address = await Address.findByIdAndDelete(id);
  return address;
};

module.exports = {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
