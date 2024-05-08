import mongoose from "mongoose";

// Destructuring the Schema and model objects from the mongoose module
const { Schema, model } = mongoose;

// Creating a new Mongoose schema for the 'Test' model
const UserSchema = new Schema({
    // Defining a field 'name' of type String, which is required
    
    username :{
        type: String,
        required: true  
        
    },
    email:{
        type: String,
        
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true,
        enum:['admin','parent','partner','child'],
        
    },
    // Defining a field 'image' of type String, which is required
    image: {
        type: String,
        required: true
    },
    parentid:{
        type: String,
        
    },
    phoneNumber:{
        type: Number,
        required: true
    },
    adressblockchain:{
        type: String,
       
    },
prohibitedProductTypes:{
    type: [String],

       
},
    verified: {
        type: Boolean,
        
    },
    banned: {
        type: Boolean, // Define Banned as a single boolean value
        default: false // Default value is false (user is not banned by default)
    }, 
    fcmtokens: {
        type: [String], // Array of strings to store FCM tokens
    },
    first_time: {
        type: Boolean,
        required: false
    },
    rfid_tag: {
        type: String,
        required: false
    }

});

// Creating and exporting the 'Test' model using the defined schema
export default model('User', UserSchema);
