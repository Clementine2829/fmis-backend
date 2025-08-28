const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { json } = require("express");
const crypto = require("crypto");

const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const userAvailable = await User.findUserByEmail(email);
  if (userAvailable) {
    return res.status(400).json({
      message: "User already registered. Please login instead.",
    });
  }
  const userId = crypto.randomBytes(22).toString("hex");
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.createUser({
    id: userId,
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Invalid user credentials");
  }

  const user = await User.findUserByEmail(email);
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          id: user.user_id,
          userType: user.user_type,
          email: user.email,
          firstName: user.firstname,
          creationData: "",
          expiresIn: "",
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      // { expiresIn: "1m" }
      { expiresIn: "50m" }
    );
    const refreshToken = jwt.sign(
      {
        user: {
          id: user.user_id,
          email: user.email,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // secure: true,
      sameSite: "None",
    });
    res.status(200).json({
      accessToken: accessToken,
      success: true,
      userRole: user.user_type,
      userId: user.user_id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error("Invalid user credentials");
  }
});

const refreshTokenUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token not found");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findUserById(decoded.userId);
    if (user) {
      const accessToken = jwt.sign(
        {
          user: {
            id: user.user_id,
            userType: user.user_type,
            email: user.email,
            firstName: user.firstname,
            creationData: "",
            expiresIn: "",
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
      );

      res.cookie("accesstoken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      res.status(200).json({ accessToken });
    } else {
      res.status(401);
      throw new Error("Invalid token, please login again");
    }
  } catch (error) {
    console.error("Token verification failed", error);
    res.status(401);
    throw new Error("Invalid token, please login again");
  }
});

const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findUserById(userId);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findUserProfileById(userId);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, email } = req.body;

  // Check if the user exists before updating
  const existingUser = await User.findUserById(userId);

  if (!existingUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const updatedUser = await User.updateUser({
    id: userId,
    firstName,
    lastName,
    email,
  });

  if (updatedUser === 1) {
    res.status(200).json({ id: userId, firstName, lastName, email });
  } else {
    res.status(401);
    throw new Error("User update failed.");
  }
});

module.exports = {
  loginUser,
  refreshTokenUser,
  getUser,
  getUserProfile,
  createUser,
  updateUser,
};
