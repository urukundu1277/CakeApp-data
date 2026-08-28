class Formatters {
  static String formatCurrency(double amount) {
    return '₹${amount.toStringAsFixed(2)}';
  }

  static String formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  static String formatOrderNumber(String orderNumber) {
    return orderNumber.toUpperCase();
  }
}
