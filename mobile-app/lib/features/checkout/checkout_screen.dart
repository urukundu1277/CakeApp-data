import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/formatters.dart';
import 'core/constants/app_constants.dart';
import 'core/routes/app_routes.dart';
import 'models/cart_model.dart';
import 'models/address_model.dart';
import 'services/address_service.dart';
import 'services/order_service.dart';

class CheckoutScreen extends StatefulWidget {
  final String token;
  final CartModel cart;
  final double deliveryFee;

  const CheckoutScreen({
    super.key,
    required this.token,
    required this.cart,
    required this.deliveryFee,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late Future<List<AddressModel>> _addressesFuture;
  final AddressService _addressService = AddressService();
  final OrderService _orderService = OrderService();

  AddressModel? _selectedAddress;
  DateTime? _selectedDate;
  String? _selectedTimeSlot;
  final TextEditingController _cakeMessageController = TextEditingController();
  bool _isLoading = false;

  final List<String> _timeSlots = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
    '08:00 PM - 10:00 PM',
  ];

  @override
  void initState() {
    super.initState();
    _addressesFuture = _addressService.getAddresses(widget.token);
  }

  @override
  void dispose() {
    _cakeMessageController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
    }
  }

  bool get _canPlaceOrder {
    return _selectedAddress != null &&
        _selectedDate != null &&
        _selectedTimeSlot != null &&
        !_isLoading;
  }

  Future<void> _placeOrder() async {
    if (!_canPlaceOrder) return;

    setState(() => _isLoading = true);

    try {
      final order = await _orderService.createOrder(
        token: widget.token,
        addressId: _selectedAddress!.id,
        deliveryDate: DateFormat('yyyy-MM-dd').format(_selectedDate!),
        deliveryTimeSlot: _selectedTimeSlot!,
        cakeMessage: _cakeMessageController.text.isEmpty
            ? null
            : _cakeMessageController.text,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order placed successfully!')),
        );
        Navigator.pushReplacementNamed(
          context,
          AppRoutes.orders,
          arguments: {'order': order},
        );
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Checkout'),
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 0,
        ),
        body: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildAddressSection(),
                  const SizedBox(height: 24),
                  _buildDeliverySection(),
                  const SizedBox(height: 24),
                  _buildOrderSummary(),
                ],
              ),
            ),
            _buildPlaceOrderButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Delivery Address',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        FutureBuilder<List<AddressModel>>(
          future: _addressesFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingWidget(message: 'Loading addresses...');
            }

            final addresses = snapshot.data ?? [];

            if (addresses.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Text('No addresses found'),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/add-address');
                      },
                      child: const Text('Add Address'),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: addresses.map((address) {
                final isSelected = _selectedAddress?.id == address.id;
                return GestureDetector(
                  onTap: () => setState(() => _selectedAddress = address),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : Colors.grey[300]!,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected
                              ? Icons.radio_button_checked
                              : Icons.radio_button_unchecked,
                          color: isSelected ? AppColors.primary : Colors.grey,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                address.name,
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                address.fullAddress,
                                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }

  Widget _buildDeliverySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Delivery Details',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              InkWell(
                onTap: () => _selectDate(context),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, color: AppColors.primary),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _selectedDate == null
                            ? 'Select delivery date'
                            : DateFormat('dd MMM yyyy').format(_selectedDate!),
                        style: TextStyle(
                          fontSize: 16,
                          color: _selectedDate == null ? Colors.grey : null,
                        ),
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                  ],
                ),
              ),
              const Divider(),
              const SizedBox(height: 8),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Time Slot',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _timeSlots.map((slot) {
                  final isSelected = _selectedTimeSlot == slot;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedTimeSlot = slot),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        slot,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.black87,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _cakeMessageController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Cake Message (Optional)',
                  hintText: 'Write a message for the cake',
                  prefixIcon: Icon(Icons.card_giftcard, color: AppColors.primary),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOrderSummary() {
    final subtotal = widget.cart.totalAmount;
    final total = subtotal + widget.deliveryFee;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Order Summary',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              _buildSummaryRow('Subtotal', Formatters.formatCurrency(subtotal)),
              const SizedBox(height: 8),
              _buildSummaryRow('Delivery Fee', Formatters.formatCurrency(widget.deliveryFee)),
              const Divider(),
              _buildSummaryRow(
                'Total',
                Formatters.formatCurrency(total),
                isTotal: true,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            color: isTotal ? AppColors.primary : null,
          ),
        ),
      ],
    );
  }

  Widget _buildPlaceOrderButton() {
    final total = widget.cart.totalAmount + widget.deliveryFee;

    return Container(
      padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: ElevatedButton(
          onPressed: _canPlaceOrder ? _placeOrder : null,
          style: ElevatedButton(
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          child: _isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : Text('Place Order - ${Formatters.formatCurrency(total)}'),
        ),
      ),
    );
  }
}
