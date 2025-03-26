const MY_PROJECT_ID = "carta-dev-b6451";

const admin = require("firebase-admin");

const isDevelopment = process.env.NODE_ENV === "development";

if (admin.apps.length === 0) {
  if (isDevelopment) {
    require("dotenv").config();
    admin.initializeApp({
      projectId: MY_PROJECT_ID,
    });

    admin.firestore().settings({ignoreUndefinedProperties: true});
    console.log("🔥 Usando Emuladores Firebase (Dev Mode)");
  } else {
    admin.initializeApp();
    console.log("🚀 Conectado a Firebase Cloud (Prod Mode)");
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {db, auth, admin};

