const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
require("./db");
const authorization = require("./middlewares");

const cors = require("cors");
const corsOpt = {
  origin: "https://budget-react-express-app-by-gemazzz.netlify.app",
};
app.use(cors(corsOpt));
app.use(express.json());

const User = require("./models/users.models");
const Expense = require("./models/expense.models");

//User
app.post("/api/v1/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  const foundUser = await User.findOne({ email: email, status: "active" });
  if (foundUser) {
    return res.status(400).json({ err: "Email is in use!" });
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

  res.status(200).json({ message: "Added!" });
});

app.post("/api/v1/signin", async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findOne({ email: email, status: "active" });
  if (!foundUser) {
    return res.status(400).json({ err: "User does not Exist!" });
  }
  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ err: "Wrong Credentials" });
  }
  const userId = foundUser._id;
  const token = jwt.sign({ userId }, process.env.secretKey, { expiresIn: "5h" });
  return res.status(200).json({ token });
});

app.get("/api/v1/user", authorization, async (req, res) => {
  const { userId } = req.user;
  const foundUser = await User.findOne({ _id: userId, status: "active" });
  return res.status(200).json({ foundUser });
});

app.post("/api/v1/newpassword", authorization, async (req, res) => {
  const { userId } = req.user;
  const { password, newPassword } = req.body;
  const foundUser = await User.findOne({ _id: userId, status: "active" });
  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ err: "Wrong password" });
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await foundUser.updateOne({ password: hashedNewPassword });
  return res.status(200).json({ message: "Password changed successfully!" });
});

app.put("/api/v1/deactivation", authorization, async (req, res) => {
  const { userId } = req.user;
  const foundUser = await User.findOne({ _id: userId, status: "active" });
  await foundUser.updateOne({ status: "deactivated", deactivated_at: new Date() });
  return res.status(200).json({ message: "account deactivated successfully!" });
});

//Expense
app.post("/api/v1/newexpense", authorization, async (req, res) => {
  const { type, category, amount, date } = req.body;
  const { userId } = req.user;

  const newExpense = new Expense();
  newExpense.type = type;
  newExpense.category = category;
  newExpense.amount = amount;
  newExpense.userId = userId;
  newExpense.date = date;
  newExpense.isFavorite = false;

  await newExpense.save();

  res.status(200).json({ message: "Added!" });
});

app.delete("/api/v1/delexpense", authorization, async (req, res) => {
  const { expenseId } = req.body;
  const foundExpense = await Expense.findOne({ _id: expenseId });
  if (!foundExpense) {
    return res.status(400).json({ err: "expense does not Exist" });
  }
  await foundExpense.deleteOne();
  res.status(200).json({ message: "Deleted Successfully!" });
});

app.put("/api/v1/favexpense", authorization, async (req, res) => {
  const { expenseId } = req.body;
  const foundExpense = await Expense.findOne({ _id: expenseId });
  if (!foundExpense) {
    return res.status(400).json({ err: "expense does not Exist" });
  }
  if (foundExpense.isFavorite === false) {
    await foundExpense.updateOne({ isFavorite: true });
    return res.status(200).json({ message: "Added as Favorite!" });
  }
  if (foundExpense.isFavorite === true) {
    await foundExpense.updateOne({ isFavorite: false });
    return res.status(200).json({ message: "Removed as Favorite!" });
  }
});

app.get("/api/v1/expenses", authorization, async (req, res) => {
  const { userId } = req.user;
  const foundExpenses = await Expense.find({ userId });
  return res.status(200).json(foundExpenses);
});

app.get("/api/v1/:expenseId", authorization, async (req, res) => {
  const { expenseId } = req.params;
  const foundExpense = await Expense.findOne({ _id: expenseId });

  return res.status(200).json({ foundExpense });
});
app.put("/api/v1/:expenseId", authorization, async (req, res) => {
  const { expenseId } = req.params;
  const changeObj = req.body;
  const foundExpense = await Expense.findOne({ _id: expenseId });
  await foundExpense.updateOne(changeObj);

  return res.status(200).json({ message: "Expense Changed!" });
});

app.listen(3000, () => {
  console.log("Server Started Successfully, Waiting for MongoDB...");
});
