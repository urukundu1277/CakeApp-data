import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../core/network/api_interceptor.dart';
import '../models/cart_model.dart';

class CartService {
  Future<CartModel> getCart(String token) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/cart'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return CartModel.fromJson(data['data']);
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to load cart');
  }

  Future<CartModel> addToCart({
    required String token,
    required String productId,
    int quantity = 1,
    String? size,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final body = jsonEncode({
      'productId': productId,
      'quantity': quantity,
      if (size != null) 'size': size,
    });

    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/cart/add'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return CartModel.fromJson(data['data']);
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to add item to cart');
  }

  Future<CartModel> updateCartItem({
    required String token,
    required String itemId,
    required int quantity,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final body = jsonEncode({'quantity': quantity});

    final response = await http.put(
      Uri.parse('${ApiConstants.baseUrl}/cart/items/$itemId'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return CartModel.fromJson(data['data']);
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to update cart item');
  }

  Future<CartModel> removeFromCart({
    required String token,
    required String itemId,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);

    final response = await http.delete(
      Uri.parse('${ApiConstants.baseUrl}/cart/items/$itemId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return CartModel.fromJson(data['data']);
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to remove item from cart');
  }

  Future<void> clearCart(String token) async {
    final headers = await ApiInterceptor.getHeaders(token: token);

    final response = await http.delete(
      Uri.parse('${ApiConstants.baseUrl}/cart'),
      headers: headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to clear cart');
    }
  }
}
