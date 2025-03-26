const {db, auth} = require("../config");

exports.create = async (data) => {
  const {
    displayName,
    email,
    password,
    role,
    dni,
    phoneNumber,
    birthday,
    startDate,
  } = data;
  return await createUserInAuth({
    email: email,
    phoneNumber: phoneNumber,
    password: password,
    displayName: displayName,
  })
      .then(async (userRecord) => {
        const uid = userRecord.uid;

        await createUserInFirestore({
          uid,
          displayName,
          email,
          role,
          dni,
          phoneNumber,
          birthday,
          startDate,
          availablePoints: 200,
          totalPoints: 0,
          active: true,
        });
        return {userId: uid};
      });
};

exports.get = async (userId) => {
  return await db.collection("users").doc(userId).get();
};

// exports.delete = async (userId) => {
//   await db.collection("users").doc(userId).delete()
//   return {success: true}
// };

async function createUserInAuth(user) {
  const {
    email: email,
    phoneNumber: phoneNumber,
    password: password,
    displayName: displayName,
  } = user;
  return auth.createUser({
    email: email,
    phoneNumber: phoneNumber,
    password: password,
    displayName: displayName,
  });
}

async function createUserInFirestore(user) {
  const {
    uid,
    displayName,
    email,
    role,
    dni,
    phoneNumber,
    birthday,
    startDate,
    availablePoints,
    totalPoints,
    active,
  } = user;
  const userRef = db.collection("users").doc(uid);
  return userRef.set({
    displayName,
    email,
    role,
    dni,
    phoneNumber,
    birthday,
    startDate,
    availablePoints: availablePoints,
    totalPoints: totalPoints,
    active: active,
  });
}
