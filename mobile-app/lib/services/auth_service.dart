import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';

class AuthService {
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/auth/login'),
        headers: ApiConstants.headers,
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success']) {
        return data['data'];
      }

      throw Exception(data['message'] ?? 'Login failed');
    } on http.ClientException catch (e) {
      if (e.message.contains('SocketException') || e.message.contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection and ensure the backend is running at ${ApiConstants.baseUrl}');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection and ensure the backend is running at ${ApiConstants.baseUrl}');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String mobile,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/auth/register'),
        headers: ApiConstants.headers,
        body: jsonEncode({
          'name': name,
          'email': email,
          'mobile': mobile,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success']) {
        return data['data'];
      }

      throw Exception(data['message'] ?? 'Registration failed');
    } on http.ClientException catch (e) {
      if (e.message.contains('SocketException') || e.message.contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection and ensure the backend is running at ${ApiConstants.baseUrl}');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection and ensure the backend is running at ${ApiConstants.baseUrl}');
      }
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/auth/logout'),
        headers: ApiConstants.headers,
      );

      if (response.statusCode != 200) {
        throw Exception('Logout failed');
      }
    } on http.ClientException catch (e) {
      if (e.message.contains('SocketException') || e.message.contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection.');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection.');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> mobileLogin({
    required String name,
    required String mobile,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/auth/mobile/login'),
        headers: ApiConstants.headers,
        body: jsonEncode({
          'name': name,
          'mobile': mobile,
          'otp': '123456',
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success']) {
        return data['data'];
      }

      throw Exception(data['message'] ?? 'Mobile login failed');
    } on http.ClientException catch (e) {
      if (e.message.contains('SocketException') || e.message.contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection and ensure the backend is running at ${ApiConstants.baseUrl}');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection and ensure the backend is running at ${ApiConstants.baseUrl}');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> firebaseLogin({
    required String name,
    required String mobile,
    required String firebaseToken,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/auth/firebase/login'),
        headers: ApiConstants.headers,
        body: jsonEncode({
          'name': name,
          'mobile': mobile,
          'firebaseToken': firebaseToken,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success']) {
        return data['data'];
      }

      throw Exception(data['message'] ?? 'Login failed');
    } on http.ClientException catch (e) {
      if (e.message.contains('SocketException') || e.message.contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection and ensure the backend is running at ${ApiConstants.baseUrl}');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection and ensure the backend is running at ${ApiConstants.baseUrl}');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getMe(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/auth/me'),
        headers: {
          ...ApiConstants.headers,
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success']) {
        return data['data'];
      }

      throw Exception(data['message'] ?? 'Failed to get user profile');
    } on http.ClientException catch (e) {
      if (e.message.contains('SocketException') || e.message.contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection.');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('No route to host')) {
        throw Exception('Cannot connect to server. Please check your internet connection.');
      }
      rethrow;
    }
  }
}
