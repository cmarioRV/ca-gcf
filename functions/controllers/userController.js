const userService = require("../services/userService");
const {HttpsError} = require("firebase-functions/v2/https");

exports.createUser = async (request) => {
  if (!request.auth) {
    throw new HttpsError("failed-precondition", "user_not_authenticated");
  }

  const userDoc = await userService.get(request.auth.uid);
  if (!userDoc.exists) {
    throw new HttpsError("not-found", "user_not_found");
  } else if (userDoc.data().role != "Director") {
    throw new HttpsError("failed-precondition", "user_not_allowed");
  }

  return await userService.create(request.data);
};

// exports.deleteUser = async (request) => {
//   const { userId } = data
//   return await userService.delete(userId)
// }
