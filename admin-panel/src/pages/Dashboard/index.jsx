import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { categoryService } from '../../services/categoryService';
import { userService } from '../../services/userService';

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: OrdersIcon, trend: null },
    { label: "Today's Orders", value: stats.todayOrders, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CalendarIcon, trend: null },
    { label: 'Pending Orders', value: stats.pendingOrders, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ClockIcon, trend: null },
    { label: 'Completed Orders', value: stats.completedOrders, color: 'bg-violet-50 text-violet-700 border-violet-200', icon: CheckIcon, trend: null },
    { label: 'Cancelled Orders', value: stats.cancelledOrders, color: 'bg-red-50 text-red-700 border-red-200', icon: XIcon, trend: null },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, color: 'bg-pink-50 text-pink-700 border-pink-200', icon: RevenueIcon, trend: null },
    { label: 'Total Products', value: stats.totalProducts, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: ProductsIcon, trend: null },
    { label: 'Total Categories', value: stats.totalCategories, color: 'bg-teal-50 text-teal-700 border-teal-200', icon: CategoriesIcon, trend: null },
    { label: 'Total Customers', value: stats.totalCustomers, color: 'bg-orange-50 text-orange-700 border-orange-200', icon: CustomersIcon, trend: null },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`card border ${card.color}`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider opacity-80">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {card.value}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white/60">
                  <card.icon />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="section-title">Recent Orders</h3>
          <p className="mt-1 text-sm text-gray-500">Latest orders placed in the store</p>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Orders will appear here once customers place them.
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
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

function OrdersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default Dashboard;
