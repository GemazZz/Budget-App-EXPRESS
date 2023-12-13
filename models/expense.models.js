const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const ExpenseSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    userId: { type: Schema.Types.objectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
