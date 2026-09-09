import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../models/product_model.dart';

class ProductService {
  Future<List<ProductModel>> getProducts({int page = 1, int limit = 20, String category = '', String categoryId = '', String searchQuery = ''}) async {
    final queryParams = <String, String>{'page': page.toString(), 'limit': limit.toString()};
    if (category.isNotEmpty) {
      queryParams['category'] = category;
    }
    if (categoryId.isNotEmpty) {
      queryParams['categoryId'] = categoryId;
    }
    if (searchQuery.isNotEmpty) {
      queryParams['search'] = searchQuery;
    }

    final uri = Uri.parse('${ApiConstants.baseUrl}/products').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: ApiConstants.headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        final List<dynamic> products = data['products'] ?? [];
        return products.map((p) => ProductModel.fromJson(p)).toList();
      }
      throw Exception(data['message'] ?? 'Failed to load products');
    }
    throw Exception('Failed to load products');
  }

  Future<ProductModel> getProductById(String productId) async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/products/$productId'),
      headers: ApiConstants.headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        return ProductModel.fromJson(data['data']);
      }
      throw Exception(data['message'] ?? 'Product not found');
    }
    throw Exception('Failed to load product');
  }
}
