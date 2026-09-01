import '../core/utils/num_parsers.dart';

class ProductModel {
  final String id;
  final String name;
  final String description;
  final List<CategoryRef> categories;
  final List<String> images;
  final List<String> sizes;
  final double basePrice;
  final double? discountPrice;
  final bool isAvailable;
  final bool featured;
  final String preparationTime;
  final List<String> ingredients;
  final bool eggless;
  final double rating;
  final int reviewCount;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.categories,
    required this.images,
    required this.sizes,
    required this.basePrice,
    this.discountPrice,
    this.isAvailable = true,
    this.featured = false,
    this.preparationTime = '24 hours',
    required this.ingredients,
    this.eggless = false,
    this.rating = 0,
    this.reviewCount = 0,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: parseString(json['_id'] ?? json['id']),
      name: parseString(json['name']),
      description: parseString(json['description']),
      categories: _parseCategories(json['categories']),
      images: _parseStringList(json['images']),
      sizes: _parseStringList(json['sizes']),
      basePrice: parseDouble(json['basePrice']),
      discountPrice: json['discountPrice'] == null ? null : parseDouble(json['discountPrice']),
      isAvailable: parseBool(json['isAvailable'] ?? true),
      featured: parseBool(json['featured']),
      preparationTime: parseString(json['preparationTime'], fallback: '24 hours'),
      ingredients: _parseStringList(json['ingredients']),
      eggless: parseBool(json['eggless']),
      rating: parseDouble(json['rating']),
      reviewCount: parseInt(json['reviewCount']),
    );
  }

  static List<CategoryRef> _parseCategories(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data.map((e) {
        if (e is Map<String, dynamic>) {
          return CategoryRef(
            id: parseString(e['_id'] ?? e['id']),
            name: parseString(e['name']),
          );
        }
        return CategoryRef(id: e.toString(), name: '');
      }).toList();
    }
    return [];
  }

  static List<String> _parseStringList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data.map((e) => e.toString()).toList();
    }
    return [];
  }

  static String _resolveImageUrl(String path) {
    if (path.isEmpty) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) {
      const String apiBase = String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'http://localhost:5000/api/v1',
      );
      String baseUrl = apiBase.replaceAll('/api/v1', '');
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
      }
      return '$baseUrl$path';
    }
    return path;
  }

  String get primaryImage {
    if (images.isEmpty) return '';
    final first = images.first;
    if (first.isEmpty) return '';
    return _resolveImageUrl(first);
  }

  List<String> get resolvedImages {
    return images.map((img) => _resolveImageUrl(img)).where((img) => img.isNotEmpty).toList();
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'categories': categories.map((c) => {'id': c.id, 'name': c.name}).toList(),
      'images': images,
      'sizes': sizes,
      'basePrice': basePrice,
      'discountPrice': discountPrice,
      'isAvailable': isAvailable,
      'featured': featured,
      'preparationTime': preparationTime,
      'ingredients': ingredients,
      'eggless': eggless,
      'rating': rating,
      'reviewCount': reviewCount,
    };
  }
}

class CategoryRef {
  final String id;
  final String name;

  CategoryRef({required this.id, required this.name});
}
