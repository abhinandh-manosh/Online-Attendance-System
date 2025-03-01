const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.generateCustomToken = functions.https.onCall(async (data, context) => {
  const userId = data.userId;
  const userType = data.userType;

  const additionalClaims = {
    userType: userType
  };

  try {
    const customToken = await admin.auth().createCustomToken(userId, additionalClaims);
    return { token: customToken };
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw new functions.https.HttpsError('internal', 'Unable to create custom token');
  }
});