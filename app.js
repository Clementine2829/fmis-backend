const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const ndviRoutes = require("./routes/farmRoutes");
const usersRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const { constants } = require("./middleware/constants");

const app = express();
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:3000",
//   Credential: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use("/api/farms", ndviRoutes);
app.use("/api/users", usersRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Handle 404 errors for undefined routes
// app.get("*", (req, res, next) => {
//   res.status(constants.NOT_FOUND);
//   throw new Error("Route not found");
// });

// error handler
app.use(errorHandler);  

module.exports = app;
