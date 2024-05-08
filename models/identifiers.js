import mongoose from "mongoose";

const { Schema, model } = mongoose;

const IdetifiersSchema = new Schema({
    
    nfc_id :{
        type: String,
        required: true  
    },
    nft_id:{
        type: String,
        required: true
    }

});

export default model('Identifiers', IdetifiersSchema);