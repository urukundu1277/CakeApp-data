import '../core/utils/num_parsers.dart';

class CategoryModel {
  final String id;
  final String name;
  final String? description;
  final String image;
  final bool isActive;
  final int sortOrder;

  CategoryModel({
    required this.id,
    required this.name,
    this.description,
    this.image = '',
    this.isActive = true,
    this.sortOrder = 0,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: parseString(json['_id'] ?? json['id']),
      name: parseString(json['name']),
      description: json['description']?.toString(),
      image: parseString(json['image']),
      isActive: parseBool(json['isActive'] ?? true),
      sortOrder: parseInt(json['sortOrder']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'image': image,
      'isActive': isActive,
      'sortOrder': sortOrder,
    };
  }
}
