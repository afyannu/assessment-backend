const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
   profileImage:{
    type:String,
    default:""
   },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
  },
  coverImage:{
    type:String,
    default:""
  },
  provider: {
  type: String,
  default: "local", // or "google"
}
});
module.exports = mongoose.model("Admin", adminSchema, "admins");