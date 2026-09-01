import 'package:flutter/material.dart';
import 'package:cake_sale_app/models/slider_model.dart';

class CakeSlider extends StatefulWidget {
  final List<SliderModel> sliders;
  final double height;

  const CakeSlider({
    super.key,
    required this.sliders,
    this.height = 220,
  });

  @override
  State<CakeSlider> createState() => _CakeSliderState();
}

class _CakeSliderState extends State<CakeSlider> {
  late PageController _pageController;
  int _currentPage = 0;
  final bool _isUserInteracting = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _startAutoSlide();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoSlide() {
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && !_isUserInteracting && widget.sliders.isNotEmpty) {
        setState(() {
          _currentPage = (_currentPage + 1) % widget.sliders.length;
        });
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
        );
        _startAutoSlide();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (widget.sliders.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      height: widget.height,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            PageView.builder(
              controller: _pageController,
              onPageChanged: (int index) {
                setState(() {
                  _currentPage = index;
                });
              },
              itemCount: widget.sliders.length,
              itemBuilder: (context, index) {
                final slider = widget.sliders[index];
                return Image.network(
                  slider.image,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) return child;
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: Colors.purple.shade50,
                                child: Icon(
                                  Icons.image,
                                  size: 48,
                                  color: Colors.purple.shade200,
                                ),
                              );
                  },
                );
              },
            ),
            if (widget.sliders.length > 1)
              Positioned(
                bottom: 12,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    widget.sliders.length,
                    (index) => Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _currentPage == index
                            ? Colors.white
                            : Colors.white.withOpacity(0.5),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
