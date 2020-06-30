const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
//ACCESS SCHEMA
const Schema = mongoose.Schema

//DEFINE A NEW SCHEMA FOR THE USER MODEL
const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) throw new Error("Age must be a positive number")
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid")
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.includes("password")) {
        throw new Error('Password should not contain "password"')
      }
    },
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar:{
    type: Buffer
  }
},{
  timestamps: true
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function(){
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
  user.tokens = user.tokens.concat({token})
  await user.save()
  return token
}

//toJSON is called whenever JSON.stringify is called, which in turn is called when an object is sent back in a response
userSchema.methods.toJSON = function(){
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  return userObject
}

//Statics methods are accessible on models (also called as model methods)
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email})
  if(!user){
    throw new Error('Could not login')
    console.log('could not find user')
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if(!isMatch){
    throw new Error("Could not login")
    console.log('password incorrect')
  }
  return user
}

//function gives access to 'this', the user who is accessed
userSchema.pre('save', async function(next){
  const user = this
  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()    //next is important
})

//middleware to delete all tasks of a user when a user is removed
userSchema.pre('remove', async function(next){
  const user = this
  await Task.deleteMany({owner: user._id})
  next()
})




// //CREATE A MODEL
const User = mongoose.model('User', userSchema)

module.exports = User