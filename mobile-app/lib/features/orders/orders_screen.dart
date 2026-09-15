import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/utils/app_notification.dart';
import '../../models/order_model.dart';
import '../../services/order_service.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/app_error_widget.dart';
import '../../providers/auth_provider.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  late Future<List<OrderModel>> _ordersFuture;
  final OrderService _orderService = OrderService();

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;

    if (token == null || token.isEmpty) {
      setState(() {
        _ordersFuture = Future.value([]);
      });
      return;
    }

    setState(() {
      _ordersFuture = _orderService.getMyOrders(token);
    });
  }

  Future<void> _refreshOrders() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;

    if (token == null || token.isEmpty) {
      setState(() {
        _ordersFuture = Future.value([]);
      });
      return;
    }

    setState(() {
      _ordersFuture = _orderService.getMyOrders(token);
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
              return AppErrorWidget(
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
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OrderDetailScreen(order: order),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
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
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.orderNumber,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt),
                        style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getStatusColor(order.orderStatus).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getStatusIcon(order.orderStatus),
                          size: 14,
                          color: _getStatusColor(order.orderStatus),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _getStatusText(order.orderStatus),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _getStatusColor(order.orderStatus),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.cake, color: AppColors.primary),
                  ),
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
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'PLACED':
        return Icons.shopping_bag;
      case 'CONFIRMED':
        return Icons.check_circle;
      case 'PREPARING':
        return Icons.kitchen;
      case 'READY':
        return Icons.inventory;
      case 'OUT_FOR_DELIVERY':
        return Icons.delivery_dining;
      case 'DELIVERED':
        return Icons.task_alt;
      case 'CANCELLED':
        return Icons.cancel;
      default:
        return Icons.receipt;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PLACED':
        return Colors.orange;
      case 'CONFIRMED':
        return Colors.blue;
      case 'PREPARING':
        return Colors.purple;
      case 'READY':
        return Colors.indigo;
      case 'OUT_FOR_DELIVERY':
        return Colors.teal;
      case 'DELIVERED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PLACED':
        return 'Order Placed';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PREPARING':
        return 'Preparing';
      case 'READY':
        return 'Ready';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status.replaceAll('_', ' ');
    }
  }
}

class OrderDetailScreen extends StatefulWidget {
  final OrderModel order;

  const OrderDetailScreen({super.key, required this.order});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  late OrderModel order;
  final OrderService _orderService = OrderService();
  bool _isCancelling = false;

  @override
  void initState() {
    super.initState();
    order = widget.order;
  }

  Future<void> _cancelOrder() async {
    final reasonController = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Order'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Are you sure you want to cancel this order?'),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Reason for cancellation (Optional)',
                hintText: 'Enter reason...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, reasonController.text),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (reason != null) {
      setState(() => _isCancelling = true);
      try {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final token = authProvider.token;
        if (token != null && token.isNotEmpty) {
          await _orderService.cancelOrder(token, order.id, reason: reason.isEmpty ? null : reason);
            if (mounted) {
              AppNotification.showSuccess(context, 'Order cancelled successfully');
              setState(() {
                order = OrderModel(
                  id: order.id,
                  orderNumber: order.orderNumber,
                  items: order.items,
                  subtotal: order.subtotal,
                  deliveryFee: order.deliveryFee,
                  discount: order.discount,
                  totalAmount: order.totalAmount,
                  paymentStatus: order.paymentStatus,
                  orderStatus: 'CANCELLED',
                  cancellationReason: reason.isEmpty ? 'Cancelled by customer' : reason,
                  cancelledBy: 'CUSTOMER',
                  cancelledAt: DateTime.now(),
                  createdAt: order.createdAt,
                  deliveryDate: order.deliveryDate,
                  deliveryTimeSlot: order.deliveryTimeSlot,
                  cakeMessage: order.cakeMessage,
                );
              });
            }
        }
      } catch (e) {
        if (mounted) {
          AppNotification.showError(context, e.toString().replaceAll('Exception: ', ''));
        }
      } finally {
        if (mounted) {
          setState(() => _isCancelling = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text('Order ${order.orderNumber}'),
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 0,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildStatusCard(context),
              const SizedBox(height: 16),
              _buildOrderInfoCard(),
              const SizedBox(height: 16),
              _buildItemsCard(),
              const SizedBox(height: 16),
              _buildDeliveryCard(),
              const SizedBox(height: 16),
              _buildPaymentCard(),
              const SizedBox(height: 16),
              if (_canCancelOrder()) _buildCancelButton(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  bool _canCancelOrder() {
    return order.orderStatus == 'PLACED' || order.orderStatus == 'CONFIRMED';
  }

  Widget _buildCancelButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _isCancelling ? null : _cancelOrder,
        icon: _isCancelling
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.cancel_outlined),
        label: Text(_isCancelling ? 'Cancelling...' : 'Cancel Order'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context) {
    final isCancelled = order.orderStatus == 'CANCELLED';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _getStatusColor(order.orderStatus),
            _getStatusColor(order.orderStatus).withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(
            _getStatusIcon(order.orderStatus),
            size: 48,
            color: Colors.white,
          ),
          const SizedBox(height: 12),
          Text(
            _getStatusText(order.orderStatus),
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Ordered on ${DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt)}',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          if (isCancelled && order.cancellationReason != null) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.info_outline, color: Colors.white, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Cancellation Reason:',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.9),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    order.cancellationReason!,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.white,
                    ),
                  ),
                  if (order.cancelledBy != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Cancelled by: ${order.cancelledBy == 'ADMIN' ? 'Shop Owner' : 'You'}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.8),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOrderInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Order Information',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.receipt_long, 'Order Number', order.orderNumber),
          _buildInfoRow(Icons.calendar_today, 'Order Date', DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt)),
          if (order.deliveryDate != null)
            _buildInfoRow(Icons.event, 'Delivery Date', DateFormat('dd MMM yyyy').format(order.deliveryDate!)),
          if (order.deliveryTimeSlot != null && order.deliveryTimeSlot!.isNotEmpty)
            _buildInfoRow(Icons.access_time, 'Delivery Time', order.deliveryTimeSlot!),
        ],
      ),
    );
  }

  Widget _buildItemsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Order Items (${order.items.length})',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          ...order.items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.cake, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.name,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      if (item.size != null)
                        Text(
                          'Size: ${item.size}',
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'x${item.quantity}',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    Text(
                      Formatters.formatCurrency(item.total),
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildDeliveryCard() {
    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Delivery Information',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.payment, 'Payment Method', 'Cash on Delivery'),
          _buildInfoRow(Icons.info_outline, 'Payment Status', order.paymentStatus),
        ],
      ),
    );
  }

  Widget _buildPaymentCard() {
    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Payment Summary',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildPriceRow('Subtotal', order.subtotal),
          _buildPriceRow('Delivery Fee', order.deliveryFee),
          if (order.discount > 0)
            _buildPriceRow('Discount', -order.discount, color: Colors.green),
          const Divider(),
          _buildPriceRow('Total', order.totalAmount, isTotal: true),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text(
            '$label:',
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow(String label, double value, {bool isTotal = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            Formatters.formatCurrency(value),
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: color ?? (isTotal ? AppColors.primary : null),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'PLACED':
        return Icons.shopping_bag;
      case 'CONFIRMED':
        return Icons.check_circle;
      case 'PREPARING':
        return Icons.kitchen;
      case 'READY':
        return Icons.inventory;
      case 'OUT_FOR_DELIVERY':
        return Icons.delivery_dining;
      case 'DELIVERED':
        return Icons.task_alt;
      case 'CANCELLED':
        return Icons.cancel;
      default:
        return Icons.receipt;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PLACED':
        return Colors.orange;
      case 'CONFIRMED':
        return Colors.blue;
      case 'PREPARING':
        return Colors.purple;
      case 'READY':
        return Colors.indigo;
      case 'OUT_FOR_DELIVERY':
        return Colors.teal;
      case 'DELIVERED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PLACED':
        return 'Order Placed';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PREPARING':
        return 'Preparing';
      case 'READY':
        return 'Ready';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status.replaceAll('_', ' ');
    }
  }
}