import mongoose from "mongoose";

// Destructuring the Schema and model objects from the mongoose module
const { Schema, model } = mongoose;

// Creating a new Mongoose schema for the 'Test' model
const ViewSchema = new Schema({
    // Defining a field 'name' of type String, which is required
    userId: {
        type: String,
        required: true,
    },
    reelId: {
        type: String,
        required: true,
    },

});

// Creating and exporting the 'Test' model using the defined schema
export default model('View', ViewSchema);
