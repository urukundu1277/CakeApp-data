import 'package:flutter/material.dart';
import 'package:cake_sale_app/core/theme/app_theme.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String appName;
  final VoidCallback onProfileTap;

  const AppHeader({
    super.key,
    this.appName = 'My Cake Shop',
    required this.onProfileTap,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.primary,
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: kToolbarHeight,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Row(
              children: [
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    appName,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  onPressed: onProfileTap,
                  icon: const Icon(Icons.person_outline, color: Colors.white),
                  padding: const EdgeInsets.all(8),
                  constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
                ),
                const SizedBox(width: 4),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
