import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../core/network/api_interceptor.dart';
import '../models/address_model.dart';

class AddressService {
  Future<List<AddressModel>> getAddresses(String token) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/addresses'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return (data['data'] as List)
            .map((address) => AddressModel.fromJson(address))
            .toList();
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to load addresses');
  }

  Future<AddressModel> createAddress({
    required String token,
    required String name,
    required String mobile,
    required String addressLine1,
    required String addressLine2,
    required String city,
    required String state,
    required String pincode,
    String? landmark,
    bool isDefault = false,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final body = jsonEncode({
      'name': name,
      'mobile': mobile,
      'addressLine1': addressLine1,
      'addressLine2': addressLine2,
      'city': city,
      'state': state,
      'pincode': pincode,
      if (landmark != null) 'landmark': landmark,
      'isDefault': isDefault,
    });

    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/addresses'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return AddressModel.fromJson(data['data']);
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to create address');
  }

  Future<AddressModel> updateAddress({
    required String token,
    required String addressId,
    required String name,
    required String mobile,
    required String addressLine1,
    required String addressLine2,
    required String city,
    required String state,
    required String pincode,
    String? landmark,
    bool isDefault = false,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);
    final body = jsonEncode({
      'name': name,
      'mobile': mobile,
      'addressLine1': addressLine1,
      'addressLine2': addressLine2,
      'city': city,
      'state': state,
      'pincode': pincode,
      if (landmark != null) 'landmark': landmark,
      'isDefault': isDefault,
    });

    final response = await http.put(
      Uri.parse('${ApiConstants.baseUrl}/addresses/$addressId'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return AddressModel.fromJson(data['data']);
      }
      throw Exception(data['message']);
    }
    throw Exception('Failed to update address');
  }

  Future<void> deleteAddress({
    required String token,
    required String addressId,
  }) async {
    final headers = await ApiInterceptor.getHeaders(token: token);

    final response = await http.delete(
      Uri.parse('${ApiConstants.baseUrl}/addresses/$addressId'),
      headers: headers,
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['message'] ?? 'Failed to delete address');
    }
  }
}
