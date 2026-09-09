import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';

class AnnouncementService {
  Future<List<String>> getAnnouncements() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/announcements'),
        headers: ApiConstants.headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success']) {
          final list = data['data'] as List;
          return list.map((e) => e['message'] as String).toList();
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
