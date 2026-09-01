import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../models/slider_model.dart';

class SliderService {
  Future<List<SliderModel>> getSliders() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/sliders'),
      headers: ApiConstants.headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        final List<dynamic> sliders = data['data'] ?? [];
        return sliders.map((s) => SliderModel.fromJson(s)).toList();
      }
      throw Exception(data['message'] ?? 'Failed to load sliders');
    }
    throw Exception('Failed to load sliders');
  }
}
