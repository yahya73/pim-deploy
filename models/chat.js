import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ChatSchema = new Schema({
    
    username :{
        type: String,
        required: true  
    },
    text:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: false
    },
    room_id:{
        type: Number,
        required: true
    }

});

export default model('Chat', ChatSchema);
