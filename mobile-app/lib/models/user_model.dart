class UserModel {
  final String id;
  final String customerId;
  final String name;
  final String email;
  final String mobile;
  final String role;
  final bool isActive;

  UserModel({
    required this.id,
    this.customerId = '',
    required this.name,
    required this.email,
    required this.mobile,
    required this.role,
    this.isActive = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      customerId: json['customerId']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      mobile: json['mobile'] ?? '',
      role: json['role'] ?? 'CUSTOMER',
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'name': name,
      'email': email,
      'mobile': mobile,
      'role': role,
      'isActive': isActive,
    };
  }
}
