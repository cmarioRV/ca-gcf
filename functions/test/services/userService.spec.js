const {db, auth} = require("../../config");
const userService = require("../../services/userService");
const {expect} = require("@jest/globals");

jest.mock("../../config", () => ({
  db: {collection: jest.fn()},
  auth: {createUser: jest.fn()},
}));

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should return new userId", async () => {
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

      auth.createUser.mockResolvedValue({uid: "newUserId123"});

      const setMock = jest.fn();
      const docMock = jest.fn((id) => ({id, set: setMock}));
      const collectionMock = jest.fn(() => ({doc: docMock}));

      db.collection.mockImplementation(collectionMock);

      const result = await userService.create(userData);

      expect(auth.createUser).toHaveBeenCalledWith({
        "email": "user-1@example.com",
        "password": "password123",
        "displayName": "John Doe",
        "phoneNumber": "+573431000001",
      });
      expect(db.collection).toHaveBeenCalledWith("users");
      expect(docMock).toHaveBeenCalledWith("newUserId123");
      expect(setMock).toHaveBeenCalledWith({
        "email": "user-1@example.com",
        "displayName": "John Doe",
        "dni": "1000001",
        "phoneNumber": "+573431000001",
        "birthday": "1980-01-01",
        "startDate": "2020-01-01",
        "role": "Operational",
        "active": true,
        "availablePoints": 200,
        "totalPoints": 0,
      });
      expect(result).toEqual({userId: "newUserId123"});
    });
  });
});

