const mongoose = require("mongoose")
//ACCESS SCHEMA
const Schema = mongoose.Schema

//TASK MODEL
const taskSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'User'
  }
})

const Task = mongoose.model("Task", taskSchema)

module.exports = Task