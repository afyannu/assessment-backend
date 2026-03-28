const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    image: {
      type: String, // store image path
    },

    description: {
      type: String,
    },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null = main category
    },

    status: {
      type: Boolean,
      default: true, // true = Active
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);