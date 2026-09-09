import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:cake_sale_app/core/theme/app_theme.dart';
import 'package:cake_sale_app/core/utils/formatters.dart';
import 'package:cake_sale_app/core/utils/app_notification.dart';
import 'package:cake_sale_app/services/cart_service.dart';
import 'package:cake_sale_app/services/product_service.dart';
import 'package:cake_sale_app/models/product_model.dart';
import 'package:cake_sale_app/providers/auth_provider.dart';

class ProductDetailsScreen extends StatefulWidget {
  final String productId;
  final String productName;

  const ProductDetailsScreen({
    super.key,
    required this.productId,
    this.productName = 'Chocolate Delight',
  });

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  int _quantity = 1;
  String _selectedSize = '';
  String? _selectedFlavor;
  late Future<ProductModel> _productFuture;
  static const List<String> _allSizes = ['0.5kg', '1kg', '1.5kg', '2kg', '2.5kg', '3kg', '5kg'];

  @override
  void initState() {
    super.initState();
    _productFuture = ProductService().getProductById(widget.productId);
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Product Details'),
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 0,
        ),
        body: FutureBuilder<ProductModel>(
          future: _productFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 16),
                    Text('Failed to load product: ${snapshot.error}'),
                  ],
                ),
              );
            }

            final product = snapshot.data!;
            if (_selectedSize.isEmpty) {
              _selectedSize = product.sizes.isNotEmpty ? product.sizes.first : '1kg';
            }

            return Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                         _buildProductImage(product),
                         const SizedBox(height: 16),
                         _buildProductInfo(product),
                         const SizedBox(height: 24),
                         if (product.requiresFlavorSelection && product.flavors.isNotEmpty) ...[
                           _buildFlavorSelector(product.flavors),
                           const SizedBox(height: 24),
                         ],
                          _buildSizeSelector(product),
                         const SizedBox(height: 24),
                         _buildDescription(product),
                         const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
                _buildBottomBar(context, product),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildProductImage(ProductModel product) {
    return Container(
      width: double.infinity,
      height: 250,
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: product.primaryImage.isNotEmpty
          ? ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                product.primaryImage,
                fit: BoxFit.cover,
                width: double.infinity,
                height: 250,
                errorBuilder: (context, error, stackTrace) {
                  return const Icon(
                    Icons.cake,
                    size: 120,
                    color: AppColors.primary,
                  );
                },
              ),
            )
          : const Icon(
              Icons.cake,
              size: 120,
              color: AppColors.primary,
            ),
    );
  }

  Widget _buildProductInfo(ProductModel product) {
    final currentPrice = product.getPriceForSize(_selectedSize);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          product.name,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Text(
              Formatters.formatCurrency(currentPrice),
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            if (_selectedSize.isNotEmpty && _selectedSize != '1kg' && product.basePrice != currentPrice) ...[
              const SizedBox(width: 8),
              Text(
                Formatters.formatCurrency(product.basePrice),
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            ],
            if (product.discountPrice != null) ...[
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${((1 - (product.discountPrice ?? product.basePrice) / currentPrice) * 100).toInt()}% OFF',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secondary,
                  ),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            const Icon(Icons.star, color: Colors.amber, size: 18),
            const SizedBox(width: 4),
            Text(
              '4.5 (128 reviews)',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSizeSelector(ProductModel product) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Select Size',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: _allSizes.map((size) {
            final isSelected = _selectedSize == size;
            final sizePrice = product.getPriceForSize(size);
            return GestureDetector(
              onTap: () => setState(() => _selectedSize = size),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : Colors.grey[300]!,
                  ),
                ),
                  child: Text(
                    '$size - ${Formatters.formatCurrency(sizePrice)}',
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.onSurface,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildFlavorSelector(List<String> flavors) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Flavor',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: flavors.map((flavor) {
            final isSelected = _selectedFlavor == flavor;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _selectedFlavor = flavor),
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.secondary : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected ? AppColors.secondary : Colors.grey[300]!,
                    ),
                  ),
                  child: Text(
                    flavor,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.onSurface,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDescription(ProductModel product) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Description',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          product.description,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[700],
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar(BuildContext context, ProductModel product) {
    return Container(
      padding: const EdgeInsets.all(16),
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
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove),
                    onPressed: () {
                      if (_quantity > 1) {
                        setState(() => _quantity--);
                      }
                    },
                  ),
                  Text(
                    '$_quantity',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add),
                    onPressed: () {
                      setState(() => _quantity++);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: () async {
                  if (product.requiresFlavorSelection && _selectedFlavor == null) {
                    if (mounted) {
                      AppNotification.showWarning(context, 'Please select a flavor');
                    }
                    return;
                  }

                  final authProvider = Provider.of<AuthProvider>(context, listen: false);
                  final token = authProvider.token;

                  if (token == null || token.isEmpty) {
                    if (mounted) {
                      AppNotification.showWarning(context, 'Please login to add items to cart');
                    }
                    return;
                  }

                  try {
                    final cartService = CartService();
                    final sizePrice = product.getPriceForSize(_selectedSize);
                    await cartService.addToCart(
                      token: token,
                      productId: widget.productId,
                      quantity: _quantity,
                      size: _selectedSize,
                      flavor: _selectedFlavor,
                      price: sizePrice,
                    );

                    if (mounted) {
                      AppNotification.showSuccess(context, '$_quantity x ${widget.productName} added to cart');
                    }
                  } catch (e) {
                    if (mounted) {
                      AppNotification.showError(context, 'Failed to add to cart: ${e.toString().replaceAll('Exception: ', '')}');
                    }
                  }
                },
                child: const Text('Add to Cart'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
