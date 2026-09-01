import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { categoryService } from '../../services/categoryService';
import { userService } from '../../services/userService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orderStatsRes, productsRes, categoriesRes, usersRes] = await Promise.all([
          orderService.getDashboardStats(),
          productService.getAll(),
          categoryService.getAll(),
          userService.getAll(),
        ]).catch((err) => {
          console.error('Dashboard data fetch failed', err);
          return [null, null, null, null];
        });

        const orderStats = orderStatsRes?.data || {};
        const products = productsRes?.products || productsRes?.data || [];
        const categories = categoriesRes?.data || categoriesRes?.categories || [];
        const users = usersRes?.data || usersRes?.users || [];

        setStats({
          totalOrders: orderStats.totalOrders || 0,
          todayOrders: orderStats.todayOrders || 0,
          pendingOrders: orderStats.pendingOrders || 0,
          completedOrders: orderStats.completedOrders || 0,
          cancelledOrders: orderStats.cancelledOrders || 0,
          totalRevenue: orderStats.totalRevenue || 0,
          totalProducts: products.length,
          totalCategories: categories.length,
          totalCustomers: users.length,
        });

        setRecentOrders(orderStats.recentOrders || []);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-500', icon: '📦' },
    { label: "Today's Orders", value: stats.todayOrders, color: 'bg-green-500', icon: '📅' },
    { label: 'Pending Orders', value: stats.pendingOrders, color: 'bg-yellow-500', icon: '⏳' },
    { label: 'Completed Orders', value: stats.completedOrders, color: 'bg-purple-500', icon: '✅' },
    { label: 'Cancelled Orders', value: stats.cancelledOrders, color: 'bg-red-500', icon: '❌' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, color: 'bg-pink-500', icon: '💰' },
    { label: 'Total Products', value: stats.totalProducts, color: 'bg-indigo-500', icon: '🎂' },
    { label: 'Total Categories', value: stats.totalCategories, color: 'bg-teal-500', icon: '📁' },
    { label: 'Total Customers', value: stats.totalCustomers, color: 'bg-orange-500', icon: '👥' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} text-white p-6 rounded-lg shadow-md`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium opacity-90">{card.label}</h3>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-2 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-2">{order.user?.name || 'N/A'}</td>
                    <td className="px-4 py-2">₹{order.totalAmount}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
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

export default Dashboard;
