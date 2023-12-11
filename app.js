const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
require("./db");

const cors = require("cors");
const corsOpt = {
  origin: "http://localhost:3001",
};
app.use(cors(corsOpt));

const User = require("./models/users.models");

app.post("/api/v1/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  const foundUser = await User.findOne({ email: email, status: "active" });
  console.log(foundUser);
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

  await newUser.save();

  res.status(200).json("Added!");
});

app.post("/api/v1/signin", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const foundUser = await User.findOne({ email: email, password: hashedPassword, status: "active" });
  if (foundUser === null) {
    return res.status(400).json("Wrong credentials");
  }
  const token = jwt.sign(email, SECRET_KEY, { expiresIn: "1d" });
  res.json(token);
});

app.post("/api/v1/newpassword", async (req, res) => {
  const { email, password, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const foundUser = await User.findOne({ email: email, status: "active" });
  if (foundUser.password !== hashedPassword) {
    return res.status(400).json("Wrong password");
  }
  await foundUser.update({ password: hashedNewPassword });
  res.status(200).json("Password changed successfully!");
});

app.post("/api/v1/deactivation", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const foundUser = await User.findOne({ email: email, password: hashedPassword, status: "active" });
  await foundUser.update({ status: "deactivated" });
  res.status(200).json("Password changed successfully!");
});

app.listen(3000, () => {
  console.log("Running");
});
