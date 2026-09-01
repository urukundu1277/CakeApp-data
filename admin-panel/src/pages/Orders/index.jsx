import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await orderService.getAll(params);
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status: ' + error.message);
    }
  };

  const handleCancelOrder = async () => {
    try {
      await orderService.cancelOrder(orderToCancel._id, cancelReason || 'Cancelled by shop owner');
      setShowCancelModal(false);
      setCancelReason('');
      setOrderToCancel(null);
      fetchOrders();
      setSelectedOrder(null);
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order: ' + error.message);
    }
  };

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY: 'bg-indigo-100 text-indigo-800',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canCancelOrder = (order) => {
    return ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.orderStatus);
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">All Orders</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.user?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">₹{order.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${getStatusColor(order.orderStatus)}`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <strong>Order Number:</strong> {selectedOrder.orderNumber}
              </div>
              <div>
                <strong>Customer:</strong> {selectedOrder.user?.name}
              </div>
              <div>
                <strong>Customer Mobile:</strong> {selectedOrder.user?.mobile}
              </div>
              <div>
                <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
              </div>
              <div>
                <strong>Payment Status:</strong> {selectedOrder.paymentStatus}
              </div>
              <div>
                <strong>Order Status:</strong>{' '}
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(selectedOrder.orderStatus)}`}>
                  {selectedOrder.orderStatus}
                </span>
              </div>
              <div>
                <strong>Delivery Date:</strong>{' '}
                {new Date(selectedOrder.deliveryDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Delivery Time:</strong> {selectedOrder.deliveryTimeSlot}
              </div>
              {selectedOrder.cakeMessage && (
                <div>
                  <strong>Message:</strong> {selectedOrder.cakeMessage}
                </div>
              )}
              {selectedOrder.orderStatus === 'CANCELLED' && selectedOrder.cancellationReason && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <strong className="text-red-700">Cancellation Reason:</strong>
                  <p className="text-red-600 mt-1">{selectedOrder.cancellationReason}</p>
                  {selectedOrder.cancelledBy && (
                    <p className="text-red-500 text-sm mt-1">
                      Cancelled by: {selectedOrder.cancelledBy === 'ADMIN' ? 'Shop Owner' : 'Customer'}
                    </p>
                  )}
                </div>
              )}
              <div>
                <strong>Items:</strong>
                <ul className="list-disc list-inside mt-2">
                  {selectedOrder.items?.map((item, index) => (
                    <li key={index}>
                      {item.name} - Qty: {item.quantity} - ₹{item.total}
                    </li>
                  ))}
                </ul>
              </div>
              {canCancelOrder(selectedOrder) && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => openCancelModal(selectedOrder)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
              <div>
                <strong>Update Status:</strong>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded"
                  disabled={selectedOrder.orderStatus === 'CANCELLED'}
                >
                  <option value="PLACED">Placed</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel order <strong>{orderToCancel?.orderNumber}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setOrderToCancel(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
