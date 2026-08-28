import 'package:http/http.dart' as http;

class ApiClient {
  static const int timeout = 30000;

  Future<http.Response> get(String url, {Map<String, String>? headers}) async {
    return await http.get(
      Uri.parse(url),
      headers: headers,
    ).timeout(const Duration(milliseconds: timeout));
  }

  Future<http.Response> post(String url, {Map<String, String>? headers, dynamic body}) async {
    return await http.post(
      Uri.parse(url),
      headers: headers,
      body: body,
    ).timeout(const Duration(milliseconds: timeout));
  }

  Future<http.Response> put(String url, {Map<String, String>? headers, dynamic body}) async {
    return await http.put(
      Uri.parse(url),
      headers: headers,
      body: body,
    ).timeout(const Duration(milliseconds: timeout));
  }

  Future<http.Response> delete(String url, {Map<String, String>? headers}) async {
    return await http.delete(
      Uri.parse(url),
      headers: headers,
    ).timeout(const Duration(milliseconds: timeout));
  }
}
