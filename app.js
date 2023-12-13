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

//User
app.post("/api/v1/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  const foundUser = await User.findOne({ email: email, status: "active" });
  if (foundUser) {
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
  if (!foundUser) {
    return res.status(400).json("Wrong credentials");
  }
  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json("Wrong credentials");
  }
  const userId = foundUser._id;
  const token = jwt.sign({ userId }, process.env.secretKey, { expiresIn: "5h" });
  return res.status(200).json({ token });
});

app.post("/api/v1/newpassword", authorization, async (req, res) => {
  const { userId } = req.user;
  const { password, newPassword } = req.body;
  const foundUser = await User.findOne({ _id: userId, status: "active" });
  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ error: "Wrong password" });
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await foundUser.updateOne({ password: hashedNewPassword });
  return res.status(200).json({ message: "Password changed successfully!" });
});

app.put("/api/v1/deactivation", authorization, async (req, res) => {
  const { password } = req.body;
  const { userId } = req.user;
  const foundUser = await User.findOne({ _id: userId, status: "active" });
  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ error: "Wrong password" });
  }
  await foundUser.updateOne({ status: "deactivated", deactivated_at: new Date() });
  return res.status(200).json("account deactivated successfully!");
});

app.listen(3000, () => {
  console.log("Running");
});

//Expense
