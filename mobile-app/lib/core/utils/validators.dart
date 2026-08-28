class Validators {
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  static bool isValidMobile(String mobile) {
    final mobileRegex = RegExp(r'^[0-9]{10}$');
    return mobileRegex.hasMatch(mobile);
  }

  static bool isValidPassword(String password) {
    return password.length >= 6;
  }

  static bool isValidName(String name) {
    return name.trim().length >= 2;
  }

  static bool isValidPincode(String pincode) {
    final pincodeRegex = RegExp(r'^[0-9]{6}$');
    return pincodeRegex.hasMatch(pincode);
  }
}
