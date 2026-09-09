import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:cake_sale_app/core/theme/app_theme.dart';
import 'package:cake_sale_app/services/product_service.dart';
import 'package:cake_sale_app/services/cart_service.dart';
import 'package:cake_sale_app/services/slider_service.dart';
import 'package:cake_sale_app/services/announcement_service.dart';
import 'package:cake_sale_app/services/category_service.dart';
import 'package:cake_sale_app/models/product_model.dart';
import 'package:cake_sale_app/models/slider_model.dart';
import 'package:cake_sale_app/models/category_model.dart';
import 'package:cake_sale_app/providers/auth_provider.dart';
import 'widgets/app_header.dart';
import 'widgets/moving_banner.dart';
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
  late Future<List<String>> _announcementsFuture;
  late Future<List<CategoryModel>> _categoriesFuture;
  int _selectedBottomNavIndex = 0;
  int _cartItemCount = 0;

  @override
  void initState() {
    super.initState();
    _slidersFuture = SliderService().getSliders();
    _announcementsFuture = AnnouncementService().getAnnouncements();
    _categoriesFuture = CategoryService().getCategories();
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
    _productsFuture = ProductService().getProducts();
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
              appName: 'OrderCake',
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
                  FutureBuilder<List<String>>(
                    future: _announcementsFuture,
                    builder: (context, snapshot) {
                      final messages = snapshot.data ?? [];
                      if (messages.isEmpty) {
                        return const SizedBox.shrink();
                      }
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: MovingBanner(
                          messages: messages,
                        ),
                      );
                    },
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
                   FutureBuilder<List<CategoryModel>>(
                     future: _categoriesFuture,
                     builder: (context, snapshot) {
                       final categories = snapshot.data ?? [];
                       final activeCategories = categories.where((c) => c.isActive).toList();
                       if (activeCategories.isEmpty) {
                         return const SizedBox.shrink();
                       }
                       return Column(
                         crossAxisAlignment: CrossAxisAlignment.start,
                         children: [
                           const Padding(
                             padding: EdgeInsets.symmetric(horizontal: 16),
                             child: Text(
                               'Categories',
                               style: TextStyle(
                                 fontSize: 18,
                                 fontWeight: FontWeight.bold,
                                 color: AppColors.onSurface,
                               ),
                             ),
                           ),
                           const SizedBox(height: 12),
                           SizedBox(
                             height: 50,
                             child: ListView.builder(
                               scrollDirection: Axis.horizontal,
                               padding: const EdgeInsets.symmetric(horizontal: 16),
                               itemCount: activeCategories.length,
                               itemBuilder: (context, index) {
                                 final category = activeCategories[index];
                                 return GestureDetector(
                                   onTap: () {
                                     Navigator.pushNamed(
                                       context,
                                       '/categories',
                                       arguments: {'categoryId': category.id},
                                     );
                                   },
                                   child: Container(
                                     margin: const EdgeInsets.only(right: 12),
                                     padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                     decoration: BoxDecoration(
                                       color: AppColors.primary,
                                       borderRadius: BorderRadius.circular(20),
                                     ),
                                     child: Text(
                                       category.name,
                                       style: const TextStyle(
                                         color: Colors.white,
                                         fontWeight: FontWeight.w500,
                                       ),
                                     ),
                                   ),
                                 );
                               },
                             ),
                           ),
                           const SizedBox(height: 16),
                         ],
                       );
                     },
                   ),
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
                   _buildProductsByCategory(),
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
                  const Text(
                    'No cakes available',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Please check back soon.',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
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

  Widget _buildProductsByCategory() {
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
                  const Text(
                    'No cakes available',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Please check back soon.',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            ),
          );
        }

        return FutureBuilder<List<CategoryModel>>(
          future: _categoriesFuture,
          builder: (context, categorySnapshot) {
            final categories = categorySnapshot.data ?? [];
            final activeCategories = categories.where((c) => c.isActive).toList();

            if (activeCategories.isEmpty) {
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
            }

            return ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: activeCategories.length,
              itemBuilder: (context, index) {
                final category = activeCategories[index];
                final categoryProducts = products.where((p) {
                  return p.categories.any((c) => c.id == category.id);
                }).toList();

                if (categoryProducts.isEmpty) {
                  return const SizedBox.shrink();
                }

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            category.name,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.onSurface,
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pushNamed(
                                context,
                                '/products',
                                arguments: {'category': category.name, 'categoryId': category.id},
                              );
                            },
                            child: const Text('See All'),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 220,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: categoryProducts.length,
                        itemBuilder: (context, productIndex) {
                          final product = categoryProducts[productIndex];
                          return Container(
                            width: 160,
                            margin: const EdgeInsets.only(right: 12),
                            child: CakeProductCard(
                              product: product,
                              onFavoriteTap: () {},
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                );
              },
            );
          },
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
