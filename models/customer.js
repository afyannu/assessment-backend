const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    password: String,
   states: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "State"
},
cities: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "City"
},
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
     role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
  },
    profileImage:{
    type:String,
    default:""
   },
    coverImage:{
    type:String,
    default:""
  },
  provider: {
  type: String,
  default: "local", // or "google"
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);