import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../models/category_model.dart';

class CategoryService {
  Future<List<CategoryModel>> getCategories() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/categories'),
      headers: ApiConstants.headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        final List<dynamic> categories = data['data'] ?? [];
        return categories.map((c) => CategoryModel.fromJson(c)).toList();
      }
      throw Exception(data['message'] ?? 'Failed to load categories');
    }
    throw Exception('Failed to load categories');
  }
}
