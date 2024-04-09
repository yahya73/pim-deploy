import mongoose from "mongoose";


// Destructuring the Schema and model objects from the mongoose module
const { Schema, model } = mongoose;

// Creating a new Mongoose schema for the 'Test' model
const NotificationSchema = new Schema({
    // Defining a field 'name' of type String, which is required
    
    type :{
        type: String,
        required: true  
    },
    content:{

        type: String,
        
    },
  
    senderId: {
         type: String
    },
    recipientId: { 
        type: String
    },
    read: { 
        type: Boolean, 
        default: false
     },
     timestamp: {
        type: Date,
        default: Date.now 
   },
   
});

// Creating and exporting the 'Test' model using the defined schema
export default model('Notification', NotificationSchema);
