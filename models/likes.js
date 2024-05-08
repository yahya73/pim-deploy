import mongoose from "mongoose";

const { Schema, model } = mongoose;
const likeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    reelId: {
        type: String,
        required: true,
    },
});
export default model('Like', likeSchema);
