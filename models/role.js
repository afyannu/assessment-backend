const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },

  permissions: {
    users: {
      view: Boolean,
      add: Boolean,
      edit: Boolean,
      delete: Boolean,
    },
    category:{
      view: Boolean,
      add:Boolean,
      edit:Boolean,
      delete:Boolean,
    },
    products: {
      view: Boolean,
      add: Boolean,
      edit: Boolean,
      delete: Boolean,
    },
    blog: {
      view: Boolean,
      add: Boolean,
      edit: Boolean,
      delete: Boolean,
    },
    customers:{
      view:Boolean,
      add:Boolean,
      edit:Boolean,
      delete:Boolean,
    },
  },
});

module.exports = mongoose.model("Role", roleSchema);