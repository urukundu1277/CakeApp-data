import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/app_theme.dart';

class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Products'),
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 0,
        ),
        body: Column(
          children: [
            _buildSearchBar(context),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 10,
                itemBuilder: (context, index) {
                  return _buildProductCard(context, index);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: AppColors.primary,
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search cakes...',
          filled: true,
          fillColor: Colors.white,
          prefixIcon: const Icon(Icons.search, color: AppColors.primary),
          suffixIcon: IconButton(
            icon: const Icon(Icons.filter_list, color: AppColors.primary),
            onPressed: () {},
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
        onTap: () {},
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, int index) {
    final names = [
      'Chocolate Delight',
      'Vanilla Dream',
      'Strawberry Bliss',
      'Black Forest',
      'Red Velvet',
      'Pineapple Paradise',
      'Butterscotch',
      'Mango Magic',
      'Blueberry Cheesecake',
      'Fruit Fiesta',
    ];
    final prices = [599, 499, 549, 649, 699, 529, 449, 579, 629, 599];

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, '/product-details');
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
        child: Row(
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
              ),
              child: const Icon(
                Icons.cake,
                size: 50,
                color: AppColors.primary,
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      names[index],
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Cake • 1kg',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '₹${prices[index]}',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${names[index]} added to cart'),
                              ),
                            );
                          },
                          icon: const Icon(Icons.add_circle, color: AppColors.primary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
