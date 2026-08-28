import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/formatters.dart';
import 'core/routes/app_routes.dart';
import 'models/cart_model.dart';
import 'services/cart_service.dart';

class CartScreen extends StatefulWidget {
  final String token;

  const CartScreen({super.key, required this.token});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  late Future<CartModel> _cartFuture;
  final CartService _cartService = CartService();

  @override
  void initState() {
    super.initState();
    _cartFuture = _cartService.getCart(widget.token);
  }

  Future<void> _refreshCart() async {
    setState(() {
      _cartFuture = _cartService.getCart(widget.token);
    });
  }

  Future<void> _updateQuantity(String itemId, int newQuantity) async {
    try {
      await _cartService.updateCartItem(
        token: widget.token,
        itemId: itemId,
        quantity: newQuantity,
      );
      _refreshCart();
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> _removeItem(String itemId) async {
    try {
      await _cartService.removeFromCart(token: widget.token, itemId: itemId);
      _refreshCart();
    } catch (e) {
      _showError(e.toString());
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('My Cart'),
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 0,
        ),
        body: FutureBuilder<CartModel>(
          future: _cartFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingWidget(message: 'Loading cart...');
            }

            if (snapshot.hasError) {
              return ErrorWidget(
                message: snapshot.error.toString(),
                onRetry: _refreshCart,
              );
            }

            final cart = snapshot.data!;

            if (cart.items.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'Your cart is empty',
                      style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, '/home');
                      },
                      child: const Text('Browse Cakes'),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: [
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () async => _refreshCart(),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: cart.items.length,
                      itemBuilder: (context, index) {
                        final item = cart.items[index];
                        return _buildCartItem(item);
                      },
                    ),
                  ),
                ),
                _buildCheckoutBar(cart),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildCartItem(CartItemModel item) {
    return Container(
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
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 80,
              height: 80,
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
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  if (item.flavour != null && item.flavour!.isNotEmpty)
                    Text(
                      'Flavour: ${item.flavour}',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  if (item.size != null && item.size!.isNotEmpty)
                    Text(
                      'Size: ${item.size}',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    Formatters.formatCurrency(item.price),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove, size: 18),
                        onPressed: item.quantity > 1
                            ? () => _updateQuantity(item.productId, item.quantity - 1)
                            : null,
                        padding: const EdgeInsets.all(4),
                        constraints: const BoxConstraints(),
                      ),
                      Text(
                        '${item.quantity}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add, size: 18),
                        onPressed: () => _updateQuantity(item.productId, item.quantity + 1),
                        padding: const EdgeInsets.all(4),
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.delete_outline, color: Colors.red[400]),
                  onPressed: () => _removeItem(item.productId),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckoutBar(CartModel cart) {
    final deliveryFee = 40.0;
    final total = cart.totalAmount + deliveryFee;

    return Container(
      padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total: ${Formatters.formatCurrency(total)}',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    Text(
                      '${cart.items.length} item(s)',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  ],
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      AppRoutes.checkout,
                      arguments: {'cart': cart, 'deliveryFee': deliveryFee},
                    );
                  },
                  style: ElevatedButton(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                  ),
                  child: const Text('Checkout'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
