const {HttpsError} = require("firebase-functions/https");
const userController = require("../../controllers/userController");
const userService = require("../../services/userService");
const {expect} = require("@jest/globals");

jest.mock("../../config", () => ({
  db: {collection: jest.fn()},
  auth: {createUser: jest.fn()},
}));

jest.mock("../../services/userService");

describe("userController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("from an unauthenticated user should return error", async () => {
      const auth = undefined;
      const userData = {
        "email": "user-1@example.com",
        "password": "password123",
        "displayName": "John Doe",
        "dni": "1000001",
        "phoneNumber": "+573431000001",
        "birthday": "1980-01-01",
        "startDate": "2020-01-01",
        "role": "Operational",
      };
      const request = {
        auth: auth,
        data: userData,
      };

      expect.assertions(1);
      return expect(userController.createUser(request))
          .rejects.toEqual(new HttpsError(
              "failed-precondition", "user_not_authenticated"));
    });

    describe("from authenticated user", () => {
      it("but who does not exist in database returns error", async () => {
        const response = {
          exists: undefined,
        };
        userService.get.mockResolvedValue(response);

        const auth = {
          "uid": "directorUid",
        };
        const userData = {
          "email": "user-1@example.com",
          "password": "password123",
          "displayName": "John Doe",
          "dni": "1000001",
          "phoneNumber": "+573431000001",
          "birthday": "1980-01-01",
          "startDate": "2020-01-01",
          "role": "Operational",
        };
        const request = {
          auth: auth,
          data: userData,
        };

        try {
          expect.assertions(1);
          await userController.createUser(request);
        } catch (error) {
          return expect(error)
              .toEqual(new HttpsError("not-found", "user_not_found"));
        }
      });

      it("but who does not have Director role returns error", async () => {
        const role = "Operational";
        const data = jest.fn(() => ({role: role}));
        const getResponse = {
          exists: true,
          data: data,
        };

        userService.get.mockResolvedValue(getResponse);

        const auth = {
          "uid": "directorUid",
        };
        const userData = {
          "email": "user-1@example.com",
          "password": "password123",
          "displayName": "John Doe",
          "dni": "1000001",
          "phoneNumber": "+573431000001",
          "birthday": "1980-01-01",
          "startDate": "2020-01-01",
          "role": "Operational",
        };
        const request = {
          auth: auth,
          data: userData,
        };

        try {
          expect.assertions(1);
          await userController.createUser(request);
        } catch (error) {
          return expect(error)
              .toEqual(new HttpsError("not-found", "user_not_allowed"));
        }
      });

      it("with Director role successfull returns new user id", async () => {
        const role = "Director";
        const data = jest.fn(() => ({role: role}));
        const getResponse = {
          exists: true,
          data: data,
        };

        const createResponse = {
          userId: "newUserId123",
        };

        userService.get.mockResolvedValue(getResponse);
        userService.create.mockResolvedValue(createResponse);

        const auth = {
          "uid": "directorUid",
        };
        const userData = {
          "email": "user-1@example.com",
          "password": "password123",
          "displayName": "John Doe",
          "dni": "1000001",
          "phoneNumber": "+573431000001",
          "birthday": "1980-01-01",
          "startDate": "2020-01-01",
          "role": "Operational",
        };
        const request = {
          auth: auth,
          data: userData,
        };

        return await expect(userController.createUser(request))
            .resolves.toEqual({"userId": "newUserId123"});
      });
    });
  });
});
