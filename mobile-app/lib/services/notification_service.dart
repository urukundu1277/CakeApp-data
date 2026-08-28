import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../core/network/api_interceptor.dart';

class NotificationService {
  Future<List<dynamic>> getNotifications(String token, {int page = 1, int limit = 20}) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/notifications?page=$page&limit=$limit'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return data['data'];
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to load notifications');
  }

  Future<int> getUnreadCount(String token) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/notifications/unread-count'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return data['data']['count'] ?? 0;
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to get unread count');
  }

  Future<void> markAsRead(String token, String notificationId) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final response = await http.put(
      Uri.parse('${ApiConstants.baseUrl}/notifications/$notificationId/read'),
      headers: headers,
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['message'] ?? 'Failed to mark notification as read');
    }
  }

  Future<void> markAllAsRead(String token) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final response = await http.put(
      Uri.parse('${ApiConstants.baseUrl}/notifications/read-all'),
      headers: headers,
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['message'] ?? 'Failed to mark all notifications as read');
    }
  }
}
