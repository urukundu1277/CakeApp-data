import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/formatters.dart';
import 'models/order_model.dart';
import '../services/order_service.dart';

class OrdersScreen extends StatefulWidget {
  final String token;

  const OrdersScreen({super.key, required this.token});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  late Future<List<OrderModel>> _ordersFuture;
  final OrderService _orderService = OrderService();

  @override
  void initState() {
    super.initState();
    _ordersFuture = _orderService.getMyOrders(widget.token);
  }

  Future<void> _refreshOrders() async {
    setState(() {
      _ordersFuture = _orderService.getMyOrders(widget.token);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('My Orders'),
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 0,
        ),
        body: FutureBuilder<List<OrderModel>>(
          future: _ordersFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingWidget(message: 'Loading orders...');
            }

            if (snapshot.hasError) {
              return ErrorWidget(
                message: snapshot.error.toString(),
                onRetry: _refreshOrders,
              );
            }

            final orders = snapshot.data ?? [];

            if (orders.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.receipt_long_outlined, size: 80, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No orders yet',
                      style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, '/home');
                      },
                      child: const Text('Start Ordering'),
                    ),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async => _refreshOrders(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: orders.length,
                itemBuilder: (context, index) {
                  final order = orders[index];
                  return _buildOrderCard(order);
                },
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildOrderCard(OrderModel order) {
    return GestureDetector(
      onTap: () {
        showDialog(
          context: context,
          builder: (context) => _buildOrderDetailDialog(order),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    order.orderNumber,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      order.orderStatus.replaceAll('_', ' '),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.cake, size: 40, color: AppColors.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${order.items.length} item(s)',
                          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Total: ${Formatters.formatCurrency(order.totalAmount)}',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('dd MMM yyyy').format(order.createdAt),
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOrderDetailDialog(OrderModel order) {
    final canCancel = order.orderStatus == 'PLACED' || order.orderStatus == 'CONFIRMED';

    return AlertDialog(
      title: Text('Order ${order.orderNumber}'),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildDetailRow('Status', order.orderStatus.replaceAll('_', ' ')),
            _buildDetailRow('Payment', order.paymentStatus),
            _buildDetailRow('Total', Formatters.formatCurrency(order.totalAmount)),
            const SizedBox(height: 16),
            const Text('Items:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...order.items.map((item) => Padding(
              padding: const EdgeInsets.only(left: 8, bottom: 4),
              child: Text('• ${item.name} x${item.quantity} - ${Formatters.formatCurrency(item.total)}'),
            )),
          ],
        ),
      ),
      actions: [
        if (canCancel)
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await _orderService.cancelOrder(widget.token, order.id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Order cancelled successfully')),
                  );
                  _refreshOrders();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to cancel order: $e')),
                  );
                }
              }
            },
            child: const Text('Cancel Order', style: TextStyle(color: Colors.red)),
          ),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}