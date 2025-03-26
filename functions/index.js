const {onCall} = require("firebase-functions/v2/https");
const {createUser} = require("./controllers/userController");

exports.createUser = onCall({invoker: "public"}, createUser);
