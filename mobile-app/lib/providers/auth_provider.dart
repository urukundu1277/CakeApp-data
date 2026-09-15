import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../core/constants/storage_constants.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  UserModel? _user;
  bool _isLoading = true;
  final Completer<void> _loadingCompleter = Completer<void>();

  String? get token => _token;
  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  Future<void> get loadingDone => _loadingCompleter.future;

  AuthProvider() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    _isLoading = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString(StorageConstants.tokenKey);
      final userData = prefs.getString(StorageConstants.userKey);
      if (userData != null) {
        try {
          _user = UserModel.fromJson(jsonDecode(userData));
        } catch (e) {
          _user = null;
        }
      }
    } catch (e) {
      _token = null;
      _user = null;
    }
    _isLoading = false;
    notifyListeners();
    if (!_loadingCompleter.isCompleted) {
      _loadingCompleter.complete();
    }
  }

  Future<void> setUser(dynamic user) async {
    final prefs = await SharedPreferences.getInstance();
    final previousUserId = _user?.id;

    if (user is UserModel) {
      _user = user;
    } else if (user is Map<String, dynamic>) {
      _user = UserModel.fromJson(user);
    }

    if (_user != null && previousUserId != null && previousUserId != _user!.id) {
      await prefs.remove(StorageConstants.profileImageKey);
    }

    await prefs.setString(StorageConstants.userKey, jsonEncode(_user!.toJson()));
    notifyListeners();
  }

  Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString(StorageConstants.tokenKey, token);
    } else {
      await prefs.remove(StorageConstants.tokenKey);
    }
    notifyListeners();
  }

  Future<void> logout() async {
    final token = _token;
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(StorageConstants.tokenKey);
    await prefs.remove(StorageConstants.userKey);
    await prefs.remove(StorageConstants.profileImageKey);
    notifyListeners();

    if (token != null && token.isNotEmpty) {
      try {
        await http.post(
          Uri.parse('${ApiConstants.baseUrl}/auth/logout'),
          headers: {'Content-Type': 'application/json'},
        );
      } catch (e) {
        // ignore logout API errors
      }
    }
  }
}
