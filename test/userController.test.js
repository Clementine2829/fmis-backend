const request = require("supertest");
const app = require("../app");

let authToken = ""; 

describe("Authentication Tests", () => {
  test("User login should return a JWT token", async () => {
    const loginData = {
      username: "testUser",
      password: "testPassword",
    };

    const response = await request(app)
      .post("/api/users/")
      .send(loginData)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");

    authToken = response.body.token;
  });
});
