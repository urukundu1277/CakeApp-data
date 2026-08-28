import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_routes.dart';
import 'features/splash/splash_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/home/home_screen.dart';
import 'features/products/categories_screen.dart';
import 'features/products/products_screen.dart';
import 'features/products/product_details_screen.dart';
import 'features/cart/cart_screen.dart';
import 'features/checkout/checkout_screen.dart';
import 'features/orders/orders_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FlutterDotenv().load(fileName: ".env");
  await Firebase.initializeApp();
  runApp(const CakeSaleApp());
}

class CakeSaleApp extends StatelessWidget {
  const CakeSaleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: MaterialApp(
        title: 'Cake Sale',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: AppRoutes.splash,
        routes: {
          AppRoutes.splash: (context) => const SplashScreen(),
          AppRoutes.login: (context) => const LoginScreen(),
          AppRoutes.register: (context) => const RegisterScreen(),
          AppRoutes.home: (context) => const HomeScreen(),
          AppRoutes.categories: (context) => const CategoriesScreen(),
          AppRoutes.products: (context) => const ProductsScreen(),
          AppRoutes.productDetails: (context) => const ProductDetailsScreen(),
          AppRoutes.cart: (context) => const CartScreen(token: ''),
          AppRoutes.checkout: (context) => const CheckoutScreen(token: '', cart: null, deliveryFee: 0),
          AppRoutes.orders: (context) => const OrdersScreen(),
          AppRoutes.profile: (context) => const ProfileScreen(),
          AppRoutes.notifications: (context) => const NotificationsScreen(token: ''),
        },
      ),
    );
  }
}
