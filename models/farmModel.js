const db = require("../databases/farm_database");
const { v4: uuidv4 } = require("uuid");

const Farm = {
  async createFarm(userId, name, location, boundaries, description) {
    const id = uuidv4();
    await db.query(
      `INSERT INTO farms (id, user_id, name, location, boundaries, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, name, location, JSON.stringify(boundaries), description]
    );

    return {
      id,
      userId,
      name,
      location,
      boundaries,
      description,
    };
  },

  async getFarmById(farmId) {
    const [rows] = await db.query("SELECT * FROM farms WHERE id = ?", [farmId]);
    return rows[0];
  },

  async getNDVIByDate(farmId, date) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM ndvi_requests WHERE farm_id = ? AND request_date = ?`,
        [farmId, date]
      );
      return rows[0] || null;
    } catch (err) {
      console.error("Error in getNDVIByDate:", err);
      throw err;
    }
  },

  async getFarmsByUser(userId) {
    const [rows] = await db.query("SELECT * FROM farms WHERE user_id = ?", [
      userId,
    ]);
    return rows;
  },

  async deleteFarm(farmId) {
    await db.query("DELETE FROM farms WHERE id = ?", [farmId]);
    return { message: "Farm deleted" };
  },

  async saveNDVIResult(farmId, date, mean, stddev, ndviMapUrl) {
    const id = uuidv4();
    try {
      await db.execute(
        `INSERT INTO ndvi_requests (farm_id, request_date, mean_ndvi, stddev_ndvi, ndvi_map_url)
       VALUES (?, ?, ?, ?, ?)`,
        [farmId, date, mean, stddev, ndviMapUrl]
      );

      return {
        farmId,
        request_date: date,
        mean,
        stddev,
        ndviMapUrl,
      };
    } catch (err) {
      console.error("Error in saveNDVIResult:", err);
      throw err;
    }
  },

  async getNDVIHistory(farmId) {
    const [rows] = await db.query(
      "SELECT * FROM ndvi_requests WHERE farm_id = ? ORDER BY request_date DESC",
      [farmId]
    );
    return rows;
  },
};

module.exports = Farm;
