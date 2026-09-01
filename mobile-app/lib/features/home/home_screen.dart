import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:cake_sale_app/core/theme/app_theme.dart';
import 'package:cake_sale_app/services/product_service.dart';
import 'package:cake_sale_app/services/cart_service.dart';
import 'package:cake_sale_app/services/slider_service.dart';
import 'package:cake_sale_app/models/product_model.dart';
import 'package:cake_sale_app/models/slider_model.dart';
import 'package:cake_sale_app/providers/auth_provider.dart';
import 'widgets/app_header.dart';
import 'widgets/custom_search_bar.dart';
import 'widgets/cake_slider.dart';
import 'widgets/cake_product_card.dart';
import 'widgets/bottom_navigation.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<ProductModel>> _productsFuture;
  late Future<List<SliderModel>> _slidersFuture;
  int _selectedBottomNavIndex = 0;
  int _cartItemCount = 0;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _slidersFuture = SliderService().getSliders();
    _loadProducts();
    _loadCartCount();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _loadCartCount();
  }

  Future<void> _loadCartCount() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;
    if (token == null || token.isEmpty) {
      setState(() => _cartItemCount = 0);
      return;
    }
    try {
      final cart = await CartService().getCart(token);
      if (mounted) {
        setState(() {
          _cartItemCount = cart.items.fold<int>(0, (sum, item) => sum + item.quantity);
        });
      }
    } catch (e) {
      // ignore cart count errors
    }
  }

  void _loadProducts() {
    final query = _searchQuery.trim();
    _productsFuture = ProductService().getProducts(searchQuery: query);
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Column(
          children: [
            AppHeader(
              appName: 'My Cake Shop',
              onCartTap: () {
                if (context.mounted) {
                  Navigator.pushNamed(context, '/cart');
                }
              },
              onProfileTap: () {
                if (context.mounted) {
                  Navigator.pushNamed(context, '/profile');
                }
              },
              cartItemCount: _cartItemCount,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.only(bottom: 16),
                children: [
                  const SizedBox(height: 12),
                  CustomSearchBar(
                    placeholder: 'Search for cakes...',
                    onChanged: (value) {
                      setState(() {
                        _searchQuery = value;
                        _loadProducts();
                      });
                    },
                    onFilterTap: () {},
                  ),
                  const SizedBox(height: 16),
                  FutureBuilder<List<SliderModel>>(
                    future: _slidersFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const SizedBox(
                          height: 220,
                          child: Center(
                            child: CircularProgressIndicator(color: AppColors.primary),
                          ),
                        );
                      }
                      final sliders = snapshot.data ?? [];
                      return CakeSlider(sliders: sliders);
                    },
                  ),
                  const SizedBox(height: 24),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Cakes Available',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.onSurface,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildProductsGrid(),
                ],
              ),
            ),
          ],
        ),
        bottomNavigationBar: BottomNavigation(
          selectedIndex: _selectedBottomNavIndex,
          onTap: (index) {
            setState(() {
              _selectedBottomNavIndex = index;
            });
            if (index == 1) {
              if (context.mounted) {
                Navigator.pushNamed(context, '/categories');
              }
            } else if (index == 2) {
              if (context.mounted) {
                Navigator.pushNamed(context, '/orders');
              }
            }
          },
        ),
      ),
    );
  }

  Widget _buildProductsGrid() {
    return FutureBuilder<List<ProductModel>>(
      future: _productsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: _ProductGridSkeleton(),
          );
        }

        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Unable to load cakes', style: TextStyle(color: Colors.grey[700])),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _loadProducts();
                      });
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        }

        final products = snapshot.data ?? [];

        if (products.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.cake_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text(
                    _searchQuery.isNotEmpty ? 'No cakes found' : 'No cakes available',
                    style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _searchQuery.isNotEmpty ? 'Try searching for another cake' : 'Please check back soon.',
                    style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                  ),
                ],
              ),
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: products.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.72,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemBuilder: (context, index) {
              return CakeProductCard(
                product: products[index],
                onFavoriteTap: () {},
              );
            },
          ),
        );
      },
    );
  }
}

class _ProductGridSkeleton extends StatelessWidget {
  const _ProductGridSkeleton();

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 6,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.72,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemBuilder: (context, index) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(width: double.infinity, height: 14, color: Colors.grey.shade200),
                    const SizedBox(height: 6),
                    Container(width: 120, height: 10, color: Colors.grey.shade200),
                    const SizedBox(height: 8),
                    Container(width: 40, height: 12, color: Colors.grey.shade200),
                    const SizedBox(height: 8),
                    Container(width: 50, height: 14, color: Colors.grey.shade200),
                    const SizedBox(height: 8),
                    Container(width: double.infinity, height: 32, color: Colors.grey.shade200),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
