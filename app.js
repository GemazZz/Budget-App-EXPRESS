const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
app.use(express.json());
require("./db");
const authorization = require("./middlewares");

const cors = require("cors");
const corsOpt = {
  origin: "http://localhost:3001",
};
app.use(cors(corsOpt));

const User = require("./models/users.models");

app.post("/api/v1/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  const foundUser = await User.findOne({ email: email, status: "active" });
  if (foundUser !== null) {
    return res.status(400).json("Email is in use!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User();
  newUser.name = name;
  newUser.username = username;
  newUser.email = email;
  newUser.password = hashedPassword;
  newUser.status = "active";
  newUser.created_at = new Date();
  newUser.deactivated_at = "not yet";

  await newUser.save();

  res.status(200).json("Added!");
});

app.post("/api/v1/signin", async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findOne({ email: email, status: "active" });
  if (foundUser === null) {
    return res.status(400).json("User does not exist!");
  }
  const userId = foundUser._id;
  if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
    const token = jwt.sign({ userId }, process.env.secretKey, { expiresIn: "5h" });
    return res.json({ token });
  }
  return res.status(400).json("Wrong credentials");
});

app.post("/api/v1/newpassword", authorization, async (req, res) => {
  const { userId } = req.user;
  const { password, newPassword } = req.body;
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const foundUser = await User.findOne({ _id: userId, status: "active" });
  if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
    await foundUser.updateOne({ password: hashedNewPassword });
    return res.status(200).json({ message: "Password changed successfully!" });
  }
  return res.status(400).json({ error: "Wrong password" });
});

app.post("/api/v1/deactivation", authorization, async (req, res) => {
  const { password } = req.body;
  const { userId } = req.user;
  const foundUser = await User.findOne({ _id: userId, status: "active" });
  if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
    await foundUser.updateOne({ status: "deactivated", deactivated_at: new Date() });
    return res.status(200).json("account deactivated successfully!");
  }
  return res.status(400).json("");
});

app.listen(3000, () => {
  console.log("Running");
});
