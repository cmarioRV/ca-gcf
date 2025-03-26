const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

admin.initializeApp({
  projectId: "carta-57267",
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
const auth = admin.auth();

async function seedUser() {
  try {
    const directorData = {
      "email": "director@ca.com",
      "password": "admin1234",
      "displayName": "Alice",
      "dni": "1000001",
      "role": "Director",
      "phoneNumber": "+573102010001",
      "birthday": "1980-01-01",
      "startDate": "2020-01-01",
      "availablePoints": 200,
      "totalPoints": 0,
      "active": true,
    };

    const userRecord = await auth.createUser({
      email: directorData.email,
      password: directorData.password,
    });

    await db.collection("users").doc(userRecord.uid).set(directorData);

    console.log(`✅ Usuario de prueba creado: ${userRecord.uid}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando usuario de prueba:", error);
    process.exit(1);
  }
}

// setTimeout(seedUser, 70000);
seedUser();

