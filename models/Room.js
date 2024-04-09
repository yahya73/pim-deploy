import mongoose from "mongoose";

const { Schema, model } = mongoose;

const RoomSchema = new Schema({
    
    room_id:{
        type: Number,
        required: true
    },
    buyer_username:{
        type: String,
        required: true
    },
    seller_username:{
        type: String,
        required: false
    }

});

export default model('Room', RoomSchema);
