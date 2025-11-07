const mongoose = require("mongoose");

const FinanceSchema = new mongoose.Schema(
  {
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["Expense", "Income"],
      default: "Expense",
      required: true,
    },

    when: {
      type: Date,
      default: Date.now,
      required: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    category_name: { type: String }, // backup name

    sub_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    sub_category_name: { type: String },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0,
      get: (v) => parseFloat(v?.toString()),
    },

    note: { type: String },
    upload_link: { type: String }, // Cloudinary link
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } },
  
);

const Finance = mongoose.model("Finance", FinanceSchema);
module.exports = Finance;
