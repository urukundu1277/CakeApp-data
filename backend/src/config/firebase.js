const admin = require('firebase-admin');
const config = require('./environment');

const serviceAccount = {
  type: 'service_account',
  project_id: config.firebase.projectId,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: config.firebase.privateKey,
  client_email: config.firebase.clientEmail,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

let firebaseApp;

try {
  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const messaging = admin.messaging();

module.exports = {
  messaging,
  firebaseApp,
};
