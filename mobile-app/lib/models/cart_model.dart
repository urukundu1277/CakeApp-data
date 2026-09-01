import '../core/utils/num_parsers.dart';

class CartItemModel {
  final String id;
  final String productId;
  final String name;
  final String image;
  final String size;
  final int quantity;
  final double price;
  final double total;

  CartItemModel({
    required this.id,
    required this.productId,
    required this.name,
    required this.image,
    required this.size,
    required this.quantity,
    required this.price,
    required this.total,
  });

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

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    final priceValue = parseDouble(json['price']);
    final quantityValue = parseInt(json['quantity']).clamp(1, 9999);
    return CartItemModel(
      id: parseString(json['_id'] ?? json['id']),
      productId: _extractProductId(json['product']),
      name: _extractProductName(json),
      image: _resolveImageUrl(_extractProductImage(json)),
      size: parseString(json['size']),
      quantity: quantityValue,
      price: priceValue,
      total: priceValue * quantityValue,
    );
  }

  static String _extractProductId(dynamic product) {
    if (product is Map<String, dynamic>) {
      return parseString(product['_id'] ?? product['id']);
    }
    return parseString(product);
  }

  static String _extractProductName(Map<String, dynamic> json) {
    final product = json['product'];
    if (product is Map<String, dynamic>) {
      return parseString(product['name']);
    }
    return parseString(json['name']);
  }

  static String _extractProductImage(Map<String, dynamic> json) {
    final product = json['product'];
    if (product is Map<String, dynamic>) {
      final images = product['images'];
      if (images is List && images.isNotEmpty) {
        return images.first.toString();
      }
    }
    return parseString(json['image']);
  }
}

class CartModel {
  final List<CartItemModel> items;
  final double totalAmount;

  CartModel({
    required this.items,
    required this.totalAmount,
  });

  double get computedTotal {
    if (totalAmount > 0) return totalAmount;
    return items.fold<double>(0.0, (sum, item) => sum + item.total);
  }

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final List<dynamic> rawItems = (json['items'] is List) ? json['items'] as List : [];
    return CartModel(
      items: rawItems
          .whereType<Map<String, dynamic>>()
          .map((item) => CartItemModel.fromJson(item))
          .toList(),
      totalAmount: parseDouble(json['totalAmount']),
    );
  }
}
