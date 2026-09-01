import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_routes.dart';
import 'features/splash/splash_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/email_login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/home/home_screen.dart';
import 'features/products/categories_screen.dart';
import 'features/products/products_screen.dart';
import 'features/products/product_details_screen.dart';
import 'features/cart/cart_screen.dart';
import 'features/checkout/checkout_screen.dart';
import 'features/orders/orders_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/profile/add_address_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'models/cart_model.dart';
import 'providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: "assets/.env");
  } catch (e) {
    debugPrint('Failed to load .env: $e');
  }

  final firebaseOptions = FirebaseOptions(
    apiKey: const String.fromEnvironment('FIREBASE_API_KEY', defaultValue: 'AIzaSyCPuIjyYP-89DOFSTsZh1z6JE3uJqJGSME'),
    appId: const String.fromEnvironment('FIREBASE_APP_ID', defaultValue: '1:386331454775:android:2a4e062dbe55fe27ecfeb2'),
    messagingSenderId: const String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID', defaultValue: '386331454775'),
    projectId: const String.fromEnvironment('FIREBASE_PROJECT_ID', defaultValue: 'cakeapp-b5459'),
    storageBucket: const String.fromEnvironment('FIREBASE_STORAGE_BUCKET', defaultValue: 'cakeapp-b5459.firebasestorage.app'),
  );

  await Firebase.initializeApp(options: firebaseOptions);

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
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300, width: 0.5),
        ),
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
          AppRoutes.cart: (context) => const CartScreen(),
          AppRoutes.orders: (context) => const OrdersScreen(),
          AppRoutes.profile: (context) => const ProfileScreen(),
          AppRoutes.notifications: (context) => const NotificationsScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name == AppRoutes.productDetails) {
            final args = settings.arguments as Map<String, dynamic>?;
            return MaterialPageRoute(
              builder: (context) => ProductDetailsScreen(
                productId: args?['productId'] ?? 'unknown',
                productName: args?['productName'] ?? 'Product',
              ),
            );
          }

          if (settings.name == AppRoutes.products) {
            final args = settings.arguments as Map<String, dynamic>?;
            return MaterialPageRoute(
              builder: (context) => ProductsScreen(
                category: args?['category'],
                categoryId: args?['categoryId'],
              ),
            );
          }

          if (settings.name == AppRoutes.checkout) {
            final args = settings.arguments as Map<String, dynamic>?;
            final cart = args?['cart'] as CartModel?;
            final deliveryFee = (args?['deliveryFee'] as num?)?.toDouble() ?? 0.0;
            return MaterialPageRoute(
              builder: (context) => CheckoutScreen(
                cart: cart,
                deliveryFee: deliveryFee,
              ),
            );
          }

          if (settings.name == AppRoutes.addAddress) {
            return MaterialPageRoute(
              builder: (context) => const AddAddressScreen(),
            );
          }

          if (settings.name == '/email-login') {
            return MaterialPageRoute(
              builder: (context) => const EmailLoginScreen(),
            );
          }

          return null;
        },
      ),
      ),
    );
  }
}
