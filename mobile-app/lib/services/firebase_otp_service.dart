import 'package:firebase_auth/firebase_auth.dart';

class FirebaseOtpService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  String? _verificationId;
  int? _resendToken;

  Future<void> sendOtp({
    required String phoneNumber,
    required Function(String verificationId) onCodeSent,
    required Function(String error) onError,
    required Function(FirebaseAuthException e) onVerificationFailed,
  }) async {
    try {
      _verificationId = null;
      _resendToken = null;

      await _auth.verifyPhoneNumber(
        phoneNumber: '+91$phoneNumber',
        verificationCompleted: (PhoneAuthCredential credential) async {
          try {
            await _auth.signInWithCredential(credential);
          } catch (e) {
            onError('Auto verification failed: $e');
          }
        },
        codeSent: (String verificationId, int? resendToken) {
          _verificationId = verificationId;
          _resendToken = resendToken;
          onCodeSent(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          _verificationId = verificationId;
        },
        verificationFailed: (FirebaseAuthException e) {
          onVerificationFailed(e);
        },
        timeout: const Duration(seconds: 60),
        forceResendingToken: _resendToken,
      );
    } catch (e) {
      onError('Failed to send OTP: $e');
    }
  }

  Future<UserCredential?> verifyOtp({
    required String otp,
    required Function(String error) onError,
  }) async {
    if (_verificationId == null) {
      onError('Please request OTP first');
      return null;
    }

    try {
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: otp,
      );
      UserCredential userCredential = await _auth.signInWithCredential(credential);
      return userCredential;
    } on FirebaseAuthException catch (e) {
      String message;
      switch (e.code) {
        case 'invalid-verification-code':
          message = 'Invalid OTP. Please check and try again.';
          break;
        case 'session-expired':
          message = 'OTP expired. Please request a new one.';
          break;
        case 'too-many-requests':
          message = 'Too many attempts. Please try again later or use a different number.';
          break;
        case 'blocked':
          message = 'This device has been temporarily blocked. Please try again in a few hours or add SHA-1 to Firebase Console.';
          break;
        default:
          if (e.message?.contains('blocked') == true) {
            message = 'Device blocked by Firebase. Please:\n1. Add SHA-1 to Firebase Console\n2. Wait 1 hour\n3. Use test phone number for testing';
          } else {
            message = e.message ?? 'Verification failed';
          }
      }
      onError(message);
      return null;
    } catch (e) {
      onError('Verification failed: $e');
      return null;
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
    _verificationId = null;
    _resendToken = null;
  }

  String? get verificationId => _verificationId;
  bool get isSignedIn => _auth.currentUser != null;
}
