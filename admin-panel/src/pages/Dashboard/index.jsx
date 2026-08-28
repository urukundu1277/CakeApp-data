import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { categoryService } from '../../services/categoryService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          productService.getAll(),
          orderService.getAll(),
        ]);

        const orders = ordersRes.data || [];
        const today = new Date().toDateString();
        const todayOrders = orders.filter(
          (order) => new Date(order.createdAt).toDateString() === today
        );

        const completedOrders = orders.filter(
          (order) => order.orderStatus === 'DELIVERED'
        );

        const totalRevenue = completedOrders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        );

        setStats({
          totalOrders: orders.length,
          todayOrders: todayOrders.length,
          pendingOrders: orders.filter((o) => o.orderStatus === 'PLACED').length,
          completedOrders: completedOrders.length,
          totalRevenue,
          totalProducts: productsRes.products?.length || 0,
          totalCustomers: new Set(orders.map((o) => o.user)).size,
        });
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
    { label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-500' },
    { label: "Today's Orders", value: stats.todayOrders, color: 'bg-green-500' },
    { label: 'Pending Orders', value: stats.pendingOrders, color: 'bg-yellow-500' },
    { label: 'Completed Orders', value: stats.completedOrders, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, color: 'bg-pink-500' },
    { label: 'Total Products', value: stats.totalProducts, color: 'bg-indigo-500' },
    { label: 'Total Customers', value: stats.totalCustomers, color: 'bg-teal-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} text-white p-6 rounded-lg shadow-md`}
          >
            <h3 className="text-sm font-medium opacity-90">{card.label}</h3>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
