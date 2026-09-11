import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { getImageUrl, handleImageError } from '../../utils/imageUrl';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
    setUpdatingStatus(true);
    try {
      await orderService.updateStatus(orderId, newStatus);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(orderToCancel._id, cancelReason || 'Cancelled by shop owner');
      setShowCancelModal(false);
      setCancelReason('');
      setOrderToCancel(null);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order: ' + error.message);
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const openDeleteModal = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      await orderService.delete(orderToDelete._id);
      setShowDeleteModal(false);
      setOrderToDelete(null);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: 'badge-warning',
      CONFIRMED: 'badge-info',
      PREPARING: 'badge-info',
      READY: 'badge-info',
      OUT_FOR_DELIVERY: 'badge-warning',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-danger',
    };
    return colors[status] || 'badge-gray';
  };

  const canCancelOrder = (order) => {
    return ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.orderStatus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
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
      </div>

      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-16 w-16 text-gray-300">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter ? 'Try changing the status filter.' : 'Orders will appear here once customers place them.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ordered Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.user?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{order.user?.mobile || ''}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {item.image && (
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-8 h-8 object-cover rounded border border-gray-200"
                                    onError={handleImageError}
                                  />
                                  <div className="img-fallback hidden absolute inset-0 items-center justify-center text-gray-400 bg-gray-50 rounded border border-gray-200">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18.75 21H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21zM8.25 8.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                              <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                Qty: {item.quantity} | ₹{item.price} each | ₹{item.total}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary-600 hover:text-primary-900 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {canCancelOrder(order) && (
                          <button
                            onClick={() => openCancelModal(order)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Cancel Order"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(order)}
                          className="text-red-700 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Order"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-500">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">{selectedOrder.user?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.mobile || ''}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.email || ''}</p>
                  </div>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Delivery</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.deliveryTimeSlot}</p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.address?.city || ''}, {selectedOrder.address?.state || ''} - {selectedOrder.address?.pincode || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="card p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Delivery Address</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>{selectedOrder.address?.name || 'N/A'}</p>
                  <p>{selectedOrder.address?.mobile || ''}</p>
                  <p>{selectedOrder.address?.addressLine1 || ''}</p>
                  {selectedOrder.address?.addressLine2 && <p>{selectedOrder.address.addressLine2}</p>}
                  <p>{selectedOrder.address?.city || ''}, {selectedOrder.address?.state || ''}</p>
                  <p>{selectedOrder.address?.pincode || ''}</p>
                  {selectedOrder.address?.landmark && <p>Landmark: {selectedOrder.address.landmark}</p>}
                </div>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.orderNumber}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Order Date</p>
                  <p className="text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={getStatusColor(selectedOrder.orderStatus)}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                  <span className={`badge ${selectedOrder.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {selectedOrder.cakeMessage && (
                <div className="card p-4 bg-pink-50 border-pink-200">
                  <p className="text-xs font-medium text-pink-600 uppercase tracking-wider mb-1">Cake Message</p>
                  <p className="text-sm text-pink-900 italic">"{selectedOrder.cakeMessage}"</p>
                </div>
              )}

              {selectedOrder.orderStatus === 'CANCELLED' && selectedOrder.cancellationReason && (
                <div className="card p-4 bg-red-50 border-red-200">
                  <p className="text-xs font-medium text-red-700 uppercase tracking-wider mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-600 mt-1">{selectedOrder.cancellationReason}</p>
                  {selectedOrder.cancelledBy && (
                    <p className="text-xs text-red-500 mt-1">
                      Cancelled by: {selectedOrder.cancelledBy === 'ADMIN' ? 'Shop Owner' : 'Customer'}
                    </p>
                  )}
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="card p-4 flex gap-4">
                      {item.image && (
                        <div className="flex-shrink-0 relative">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            onError={handleImageError}
                          />
                          <div className="img-fallback hidden absolute inset-0 items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18.75 21H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21zM8.25 8.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                              {item.size && <p>Size: {item.size}</p>}
                              {item.flavor && <p>Flavor: {item.flavor}</p>}
                              <p>Quantity: {item.quantity}</p>
                              <p>Unit Price: ₹{item.price}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">₹{item.total}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{selectedOrder.deliveryFee}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <div className="flex-1">
                  <label className="label">Update Status</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    className="input"
                    disabled={selectedOrder.orderStatus === 'CANCELLED' || updatingStatus}
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
                <div className="flex items-end">
                  {canCancelOrder(selectedOrder) && (
                    <button
                      onClick={() => {
                        setSelectedOrder(null);
                        openCancelModal(selectedOrder);
                      }}
                      className="btn-danger"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.774-.833-1.998-.833-2.772 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel order <strong>{orderToCancel?.orderNumber}</strong>? This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="label">Reason for cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="input"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setOrderToCancel(null);
                  }}
                  className="btn-secondary"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="btn-danger"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Order</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to permanently delete order <strong>{orderToDelete?.orderNumber}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOrderToDelete(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={deleting}
                  className="btn-danger"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
