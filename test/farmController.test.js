const request = require("supertest");
const app = require("../app");

const accessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNDQyOTAxOGI5NjE2MzVjODZkNTAwN2FhMzVmNmUxOTUyNDJmOWUyMDk0MWUiLCJ1c2VyVHlwZSI6ImJhc2ljIiwiZW1haWwiOiJ0ZXN0VXNlciIsImZpcnN0TmFtZSI6IlRlc3QiLCJjcmVhdGlvbkRhdGEiOiIiLCJleHBpcmVzSW4iOiIifSwiaWF0IjoxNzU2NDExMDc0LCJleHAiOjE3NTY0MTQwNzR9.ZpcOZbQ8SGaufcjnpULCW_U4cyBnZVr4uwxv98_Xj0s";

describe("Farm Controller Tests", () => {
  test("Should create a new farm with valid token", async () => {
    const response = await request(app)
      .post("/api/farms")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId: "user123",
        name: "Test Farm",
        location: "Test Location",
        boundaries: [[-26.034559, 28.091585]],
        description: "This is a test farm",
      })
      .set("Accept", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Test Farm");
    expect(response.body.location).toBe("Test Location");
    expect(response.body.description).toBe("This is a test farm");
  });

  test("Should get user farms with valid token", async () => {
    const response = await request(app)
      .get("/api/farms/user/user123")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Should fail to get user farms with an invalid token", async () => {
    const invalidToken = "invalid_token_here";
    const response = await request(app)
      .get("/api/farms/user/user123")
      .set("Authorization", `Bearer ${invalidToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(401); // Unauthorized
    expect(response.body.error).toBe("User is not authorized or token is missing/expired");
  });

  test("Should delete a farm with valid token", async () => {
    const farmIdToDelete = "valid-farm-id";
    const response = await request(app)
      .delete(`/api/farms/${farmIdToDelete}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Farm deleted");
  });

  test("Should fail to delete a farm that doesn't exist", async () => {
    const nonExistingFarmId = "non-existing-farm-id";
    const response = await request(app)
      .delete(`/api/farms/${nonExistingFarmId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Farm not found");
  });

  test("Should fail to create a farm without required fields", async () => {
    const response = await request(app)
      .post("/api/farms")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId: "user123",
        // Missing 'name'
        location: "Test Location",
        boundaries: [[-26.034559, 28.091585]],
        description: "This is a test farm",
      })
      .set("Accept", "application/json");

    expect(response.status).toBe(400); 
    expect(response.body.error).toBe("Missing required fields");
  });
});
