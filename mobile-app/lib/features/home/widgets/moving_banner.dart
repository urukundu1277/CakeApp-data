import 'package:flutter/material.dart';

class MovingBanner extends StatefulWidget {
  final List<String> messages;
  final Color backgroundColor;
  final Color textColor;
  final IconData icon;

  const MovingBanner({
    super.key,
    required this.messages,
    this.backgroundColor = const Color(0xFFFF6B6B),
    this.textColor = Colors.white,
    this.icon = Icons.campaign_outlined,
  });

  @override
  State<MovingBanner> createState() => _MovingBannerState();
}

class _MovingBannerState extends State<MovingBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late ScrollController _scrollController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
    _scrollController = ScrollController();
    _startCycling();
  }

  void _startCycling() {
    Future.delayed(const Duration(seconds: 3), () {
      if (!mounted) return;
      if (widget.messages.isEmpty) return;
      setState(() {
        _currentIndex = (_currentIndex + 1) % widget.messages.length;
      });
      _startCycling();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.messages.isEmpty) {
      return const SizedBox.shrink();
    }

    final message = widget.messages[_currentIndex];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF6B6B), Color(0xFFFF8E53)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(widget.icon, color: Colors.white, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 500),
              transitionBuilder: (child, animation) {
                return FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(1, 0),
                      end: Offset.zero,
                    ).animate(animation),
                    child: child,
                  ),
                );
              },
              child: Text(
                message,
                key: ValueKey(_currentIndex),
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  height: 1.3,
                ),
              ),
            ),
          ),
          if (widget.messages.length > 1) ...[
            const SizedBox(width: 8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(
                widget.messages.length,
                (index) => Container(
                  width: 6,
                  height: 6,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _currentIndex == index
                        ? widget.textColor
                        : widget.textColor.withOpacity(0.3),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class MarqueeBanner extends StatefulWidget {
  final List<String> messages;
  final Color backgroundColor;
  final Color textColor;
  final IconData icon;

  const MarqueeBanner({
    super.key,
    required this.messages,
    this.backgroundColor = const Color(0xFFFF6B6B),
    this.textColor = Colors.white,
    this.icon = Icons.campaign_outlined,
  });

  @override
  State<MarqueeBanner> createState() => _MarqueeBannerState();
}

class _MarqueeBannerState extends State<MarqueeBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late ScrollController _scrollController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
    _scrollController = ScrollController();
    _startCycling();
  }

  void _startCycling() {
    Future.delayed(const Duration(seconds: 4), () {
      if (!mounted) return;
      if (widget.messages.isEmpty) return;
      setState(() {
        _currentIndex = (_currentIndex + 1) % widget.messages.length;
      });
      _startCycling();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.messages.isEmpty) {
      return const SizedBox.shrink();
    }

    final combinedMessages = widget.messages.join('  •  ');

    return Container(
      height: 36,
      decoration: BoxDecoration(
        color: widget.backgroundColor,
        borderRadius: BorderRadius.circular(8),
      ),
      clipBehavior: Clip.hardEdge,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            color: widget.textColor,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.campaign, color: widget.backgroundColor, size: 16),
                const SizedBox(width: 4),
                Text(
                  'OFFER',
                  style: TextStyle(
                    color: widget.backgroundColor,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  controller: _scrollController,
                  physics: const NeverScrollableScrollPhysics(),
                  child: Transform.translate(
                    offset: Offset(-_controller.value * 400, 0),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Center(
                        child: Text(
                          combinedMessages,
                          style: TextStyle(
                            color: widget.textColor,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
