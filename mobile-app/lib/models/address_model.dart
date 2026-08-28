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
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      mobile: json['mobile'] ?? '',
      addressLine1: json['addressLine1'] ?? '',
      addressLine2: json['addressLine2'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
      landmark: json['landmark'],
      isDefault: json['isDefault'] ?? false,
    );
  }

  String get fullAddress => '$addressLine1, $addressLine2, $city, $state - $pincode';
}
