import 'package:flutter/material.dart';

class AppNotification {
  static void showSuccess(BuildContext context, String message) {
    _showOverlay(
      context,
      message: message,
      icon: Icons.check_circle,
      color: Colors.green,
    );
  }

  static void showError(BuildContext context, String message) {
    _showOverlay(
      context,
      message: message,
      icon: Icons.error,
      color: Colors.red,
    );
  }

  static void showInfo(BuildContext context, String message) {
    _showOverlay(
      context,
      message: message,
      icon: Icons.info,
      color: Colors.blue,
    );
  }

  static void showWarning(BuildContext context, String message) {
    _showOverlay(
      context,
      message: message,
      icon: Icons.warning,
      color: Colors.orange,
    );
  }

  static void _showOverlay(
    BuildContext context, {
    required String message,
    required IconData icon,
    required Color color,
  }) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 10,
        left: 16,
        right: 16,
        child: Material(
          elevation: 8,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withOpacity(0.3)),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Icon(icon, color: color, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    message,
                    style: TextStyle(
                      color: Colors.grey[800],
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    overlay.insert(overlayEntry);
    Future.delayed(const Duration(seconds: 3), () {
      overlayEntry.remove();
    });
  }
}
