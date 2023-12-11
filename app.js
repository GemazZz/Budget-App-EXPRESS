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

const SECRET_KEY = "hello";

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
  if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
    const token = jwt.sign({ userId: foundUser._id, email: foundUser.email }, SECRET_KEY, { expiresIn: "5h" });
    return res.json(token);
  }
  return res.status(400).json("Wrong credentials");
});

app.post("/api/v1/newpassword", async (req, res) => {
  const { email, password, newPassword } = req.body;
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const foundUser = await User.findOne({ email: email, status: "active" });
  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ error: "Wrong password" });
  }
  await foundUser.updateOne({ password: hashedNewPassword });
  res.status(200).json({ message: "Password changed successfully!" });
});

app.post("/api/v1/deactivation", async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findOne({ email: email, status: "active" });
  await foundUser.updateOne({ status: "deactivated", deactivated_at: new Date() });
  res.status(200).json("Password changed successfully!");
});

app.listen(3000, () => {
  console.log("Running");
});
