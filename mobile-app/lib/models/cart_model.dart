class CartItemModel {
  final String productId;
  final String name;
  final String image;
  final String flavour;
  final String size;
  final int quantity;
  final double price;
  final double total;

  CartItemModel({
    required this.productId,
    required this.name,
    required this.image,
    required this.flavour,
    required this.size,
    required this.quantity,
    required this.price,
    required this.total,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      productId: json['product']['_id'] ?? json['product'],
      name: json['product']['name'] ?? json['name'] ?? '',
      image: json['product']['images'] != null && (json['product']['images'] as List).isNotEmpty
          ? json['product']['images'][0]
          : json['image'] ?? '',
      flavour: json['flavour'] ?? '',
      size: json['size'] ?? '',
      quantity: json['quantity'] ?? 1,
      price: (json['price'] ?? 0).toDouble(),
      total: (json['price'] ?? 0) * (json['quantity'] ?? 1),
    );
  }
}

class CartModel {
  final List<CartItemModel> items;
  final double totalAmount;

  CartModel({
    required this.items,
    required this.totalAmount,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    return CartModel(
      items: (json['items'] as List?)
              ?.map((item) => CartItemModel.fromJson(item))
              .toList() ??
          [],
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
    );
  }
}
