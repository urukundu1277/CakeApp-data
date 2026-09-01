import '../core/utils/num_parsers.dart';

class OrderItemModel {
  final String productId;
  final String name;
  final String image;
  final String? size;
  final int quantity;
  final double price;
  final double total;

  OrderItemModel({
    required this.productId,
    required this.name,
    required this.image,
    this.size,
    required this.quantity,
    required this.price,
    required this.total,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    final priceValue = parseDouble(json['price']);
    final quantityValue = parseInt(json['quantity']).clamp(1, 9999);
    final totalValue = json['total'] != null
        ? parseDouble(json['total'])
        : priceValue * quantityValue;

    return OrderItemModel(
      productId: parseString(json['product']),
      name: parseString(json['name']),
      image: parseString(json['image']),
      size: json['size'] == null ? null : parseString(json['size']),
      quantity: quantityValue,
      price: priceValue,
      total: totalValue,
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
  final String? cancellationReason;
  final String? cancelledBy;
  final DateTime? cancelledAt;
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
    this.cancellationReason,
    this.cancelledBy,
    this.cancelledAt,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    final items = rawItems is List
        ? rawItems
            .whereType<Map<String, dynamic>>()
            .map((item) => OrderItemModel.fromJson(item))
            .toList()
        : <OrderItemModel>[];

    final subtotal = parseDouble(json['subtotal']);
    final deliveryFee = parseDouble(json['deliveryFee']);
    final discount = parseDouble(json['discount']);
    final totalAmount = parseDouble(
      json['totalAmount'],
    );

    return OrderModel(
      id: parseString(json['_id'] ?? json['id']),
      orderNumber: parseString(json['orderNumber']),
      items: items,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      discount: discount,
      totalAmount: totalAmount,
      paymentStatus: parseString(json['paymentStatus'], fallback: 'PENDING'),
      orderStatus: parseString(json['orderStatus'], fallback: 'PLACED'),
      cancellationReason: json['cancellationReason'] == null ? null : parseString(json['cancellationReason']),
      cancelledBy: json['cancelledBy'] == null ? null : parseString(json['cancelledBy']),
      cancelledAt: json['cancelledAt'] == null ? null : DateTime.tryParse(parseString(json['cancelledAt'])),
      createdAt: DateTime.tryParse(parseString(json['createdAt'])) ?? DateTime.now(),
    );
  }
}
