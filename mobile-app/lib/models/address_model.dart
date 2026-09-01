import '../core/utils/num_parsers.dart';

class AddressModel {
  final String id;
  final String name;
  final String mobile;
  final String addressLine1;
  final String addressLine2;
  final String city;
  final String state;
  final String pincode;
  final String? landmark;
  final bool isDefault;

  AddressModel({
    required this.id,
    required this.name,
    required this.mobile,
    required this.addressLine1,
    required this.addressLine2,
    required this.city,
    required this.state,
    required this.pincode,
    this.landmark,
    required this.isDefault,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: parseString(json['_id'] ?? json['id']),
      name: parseString(json['name']),
      mobile: parseString(json['mobile']),
      addressLine1: parseString(json['addressLine1']),
      addressLine2: parseString(json['addressLine2']),
      city: parseString(json['city']),
      state: parseString(json['state']),
      pincode: parseString(json['pincode']),
      landmark: json['landmark']?.toString(),
      isDefault: parseBool(json['isDefault']),
    );
  }

  String get fullAddress => '$addressLine1, $addressLine2, $city, $state - $pincode';
}
