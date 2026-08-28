import 'dart:convert';
import 'dart:random';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../core/network/api_interceptor.dart';

class PaymentService {
  Future<Map<String, dynamic>> createPaymentOrder({
    required String token,
    required String orderId,
    required double amount,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final body = jsonEncode({
      'orderId': orderId,
      'amount': amount,
    });

    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/payments/create-order'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return data['data'];
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to create payment order');
  }

  Future<void> verifyPayment({
    required String token,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
    required String orderId,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final body = jsonEncode({
      'razorpayOrderId': razorpayOrderId,
      'razorpayPaymentId': razorpayPaymentId,
      'razorpaySignature': razorpaySignature,
      'orderId': orderId,
    });

    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/payments/verify'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return;
      }
      throw Exception(data['message']);
    }
    throw Exception('Payment verification failed');
  }

  static String generateOrderId(String prefix, int length) {
    final random = Random();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return prefix + List.generate(length, (index) => chars[random.nextInt(chars.length)]).join();
  }
}
