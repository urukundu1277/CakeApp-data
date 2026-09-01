import '../core/utils/num_parsers.dart';

class SliderModel {
  final String id;
  final String? title;
  final String? description;
  final String image;
  final String link;
  final int sortOrder;
  final bool isActive;

  SliderModel({
    required this.id,
    this.title,
    this.description,
    required this.image,
    this.link = '',
    this.sortOrder = 0,
    this.isActive = true,
  });

  factory SliderModel.fromJson(Map<String, dynamic> json) {
    return SliderModel(
      id: parseString(json['_id'] ?? json['id']),
      title: json['title']?.toString(),
      description: json['description']?.toString(),
      image: parseString(json['image']),
      link: parseString(json['link']),
      sortOrder: parseInt(json['sortOrder']),
      isActive: parseBool(json['isActive'] ?? true),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'image': image,
      'link': link,
      'sortOrder': sortOrder,
      'isActive': isActive,
    };
  }
}
