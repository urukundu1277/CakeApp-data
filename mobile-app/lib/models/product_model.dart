import '../core/utils/num_parsers.dart';
import '../core/constants/api_constants.dart';

class ProductModel {
  final String id;
  final String name;
  final String description;
  final List<CategoryRef> categories;
  final List<String> images;
  final List<String> sizes;
  final List<SizePrice> sizePrices;
  final List<String> flavors;
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
    this.sizePrices = const [],
    this.flavors = const [],
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

  double getPriceForSize(String size) {
    if (sizePrices.isNotEmpty) {
      final sizePrice = sizePrices.firstWhere(
        (sp) => sp.size.toLowerCase() == size.toLowerCase(),
        orElse: () => sizePrices.first,
      );
      return sizePrice.price;
    }
    
    // Calculate price based on size weight if no sizePrices defined
    final sizeWeight = _extractSizeWeight(size);
    if (sizeWeight > 0) {
      return basePrice * sizeWeight;
    }
    return basePrice;
  }

  double _extractSizeWeight(String size) {
    final lowerSize = size.toLowerCase();
    if (lowerSize.contains('0.5kg') || lowerSize.contains('0.5')) return 0.5;
    if (lowerSize.contains('1kg') || lowerSize.contains('1')) return 1.0;
    if (lowerSize.contains('1.5kg') || lowerSize.contains('1.5')) return 1.5;
    if (lowerSize.contains('2kg') || lowerSize.contains('2')) return 2.0;
    if (lowerSize.contains('2.5kg') || lowerSize.contains('2.5')) return 2.5;
    if (lowerSize.contains('3kg') || lowerSize.contains('3')) return 3.0;
    if (lowerSize.contains('5kg') || lowerSize.contains('5')) return 5.0;
    return 0.0;
  }

  bool get hasSizePricing => sizePrices.isNotEmpty;

  bool get hasFlavors => flavors.isNotEmpty;
  bool get requiresFlavorSelection {
    return categories.any((cat) => cat.requiresFlavorSelection);
  }
  bool get isFlavorCategory {
    return categories.any((cat) => cat.isFlavorCategory);
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: parseString(json['_id'] ?? json['id']),
      name: parseString(json['name']),
      description: parseString(json['description']),
      categories: _parseCategories(json['categories']),
      images: _parseStringList(json['images']),
      sizes: _parseStringList(json['sizes']),
      sizePrices: _parseSizePrices(json['sizePrices']),
      flavors: _parseStringList(json['flavors']),
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

  static List<SizePrice> _parseSizePrices(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data.map((e) {
        if (e is Map<String, dynamic>) {
          return SizePrice(
            size: parseString(e['size']),
            price: parseDouble(e['price']),
          );
        }
        return SizePrice(size: e.toString(), price: 0.0);
      }).toList();
    }
    return [];
  }

  static List<CategoryRef> _parseCategories(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data.map((e) {
        if (e is Map<String, dynamic>) {
          return CategoryRef(
            id: parseString(e['_id'] ?? e['id']),
            name: parseString(e['name']),
            isFlavorCategory: parseBool(e['isFlavorCategory'] ?? false),
            requiresFlavorSelection: parseBool(e['requiresFlavorSelection'] ?? false),
            availableFlavors: _parseStringList(e['availableFlavors']),
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

  String _resolveImageUrl(String path) {
    if (path.isEmpty) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) {
      final apiBase = ApiConstants.baseUrl;
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
      'categories': categories.map((c) => {
        'id': c.id,
        'name': c.name,
        'isFlavorCategory': c.isFlavorCategory,
        'requiresFlavorSelection': c.requiresFlavorSelection,
        'availableFlavors': c.availableFlavors,
      }).toList(),
      'images': images,
      'sizes': sizes,
      'sizePrices': sizePrices.map((sp) => {'size': sp.size, 'price': sp.price}).toList(),
      'flavors': flavors,
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

class SizePrice {
  final String size;
  final double price;

  SizePrice({
    required this.size,
    required this.price,
  });
}

class CategoryRef {
  final String id;
  final String name;
  final bool isFlavorCategory;
  final bool requiresFlavorSelection;
  final List<String> availableFlavors;

  CategoryRef({
    required this.id,
    required this.name,
    this.isFlavorCategory = false,
    this.requiresFlavorSelection = false,
    this.availableFlavors = const [],
  });
}
