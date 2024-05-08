import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ProductTypesSchema = new Schema({
    
    type :{
        type: String,
        required: true  
    }

});

export default model('ProductTypes', ProductTypesSchema);