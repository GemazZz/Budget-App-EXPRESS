const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  created_at: { type: String, required: true },
  author: { type: String, required: true },
});

module.exports = mongoose.model("Expense", ExpenseSchema);
