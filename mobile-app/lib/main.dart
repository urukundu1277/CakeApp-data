import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FlutterDotenv().load(fileName: ".env");
  runApp(const CakeSaleApp());
}

class CakeSaleApp extends StatelessWidget {
  const CakeSaleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cake Sale',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const Scaffold(
        body: Center(
          child: Text('Cake Sale App - Phase 1 Setup Complete'),
        ),
      ),
    );
  }
}
