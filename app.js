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
    res.status(400).json("Email is in use!");
    return;
  }

  const newUser = new User();
  newUser.name = name;
  newUser.username = username;
  newUser.email = email;
  newUser.password = password;
  newUser.status = "active";

  await newUser.save();

  res.status(200).json("Added!");
});

app.listen(3000, () => {
  console.log("Running");
});
