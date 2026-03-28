const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {type:String,required:true},
  description: {type:String, required:true},
  content: String,
  image: String,

  startDate: Date,
  endDate: Date,

  status: {
    type: Boolean,
    default:"true"
  }

},{timestamps:true});

module.exports = mongoose.model("Blog", blogSchema);