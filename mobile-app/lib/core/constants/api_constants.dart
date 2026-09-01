import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConstants {
  static String get baseUrl {
    final url = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api/v1';
    debugPrint('API_BASE_URL: $url');
    return url;
  }

  static const int timeout = 30000;

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
