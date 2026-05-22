// MongoDB schema

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  phone: {
    type: String,
    required: true,
    unique:true,
    match: [/^\+?\d{7,15}$/, "Invalid phone number"]
  },
  email:{
    type:String,
    required:true,
    unique:true,
    trim: true,
    lowercase: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"]
  },
  age:{ type: Number, min: 14, max: 120 },
  password: {
    type: String,
    required: true,
    minlength: 8
},
  hasPaid: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  enrolled:{type: Boolean, default: false}
}, { timestamps: true });

userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: "admin" } }
);

export default mongoose.model('User', userSchema);