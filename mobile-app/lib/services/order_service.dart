import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../core/network/api_interceptor.dart';
import '../models/order_model.dart';

class OrderService {
  Future<OrderModel> createOrder({
    required String token,
    required String addressId,
    required String deliveryDate,
    required String deliveryTimeSlot,
    String? cakeMessage,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final body = jsonEncode({
      'addressId': addressId,
      'deliveryDate': deliveryDate,
      'deliveryTimeSlot': deliveryTimeSlot,
      if (cakeMessage != null && cakeMessage.isNotEmpty) 'cakeMessage': cakeMessage,
    });

    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/orders'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        return OrderModel.fromJson(data['data']);
      }
      throw Exception(data['message'] ?? 'Order creation failed');
    }

    String errorMessage = 'Failed to create order';
    try {
      final data = jsonDecode(response.body);
      errorMessage = data['message'] ?? errorMessage;
    } catch (e) {
      errorMessage = 'Failed to create order (${response.statusCode})';
    }
    throw Exception(errorMessage);
  }

  Future<List<OrderModel>> getMyOrders(String token, {int page = 1, int limit = 10}) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/orders?page=$page&limit=$limit'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return (data['data'] as List)
            .map((order) => OrderModel.fromJson(order))
            .toList();
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to load orders');
  }

  Future<void> cancelOrder(String token, String orderId, {String? reason}) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final response = await http.put(
      Uri.parse('${ApiConstants.baseUrl}/orders/$orderId/cancel'),
      headers: headers,
      body: jsonEncode({
        if (reason != null && reason.isNotEmpty) 'cancellationReason': reason,
      }),
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['message'] ?? 'Failed to cancel order');
    }
  }
}
