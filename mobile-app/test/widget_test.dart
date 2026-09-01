import 'package:flutter_test/flutter_test.dart';
import 'package:cake_sale_app/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CakeSaleApp());
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(CakeSaleApp), findsOneWidget);
  });
}
