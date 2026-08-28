class OrderItemModel {
  final String productId;
  final String name;
  final String image;
  final String? flavour;
  final String? size;
  final int quantity;
  final double price;
  final double total;

  OrderItemModel({
    required this.productId,
    required this.name,
    required this.image,
    this.flavour,
    this.size,
    required this.quantity,
    required this.price,
    required this.total,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      productId: json['product'] ?? '',
      name: json['name'] ?? '',
      image: json['image'] ?? '',
      flavour: json['flavour'],
      size: json['size'],
      quantity: json['quantity'] ?? 1,
      price: (json['price'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
    );
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final List<OrderItemModel> items;
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double totalAmount;
  final String paymentStatus;
  final String orderStatus;
  final DateTime createdAt;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.discount,
    required this.totalAmount,
    required this.paymentStatus,
    required this.orderStatus,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['_id'] ?? json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      items: (json['items'] as List?)
              ?.map((item) => OrderItemModel.fromJson(item))
              .toList() ??
          [],
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      deliveryFee: (json['deliveryFee'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      paymentStatus: json['paymentStatus'] ?? 'PENDING',
      orderStatus: json['orderStatus'] ?? 'PLACED',
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
