import mongoose from "mongoose";
const { Schema, model } = mongoose;
import User from "./User.js";
import Reel from "./reel.js";

const reportSchema = new mongoose.Schema({
  username: {
    type: String, // Corrected reference to User schema
    required: true
  },
  email:{
    type: String,
    
},

// Defining a field 'image' of type String, which is required
image: {
    type: String,
  
},
  reportedVideo:  { type: String, required: true },
  userNameReel: { type: String, required: true },
  reelDescription: { type: String },
  reportType: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default model('Report', reportSchema);