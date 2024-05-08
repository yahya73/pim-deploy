import mongoose from "mongoose";
import Like from "./likes.js";
const { Schema, model } = mongoose;




const commentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    userProfilePic: { type: String, required: false },
    userName: { type: String, required: true },
    commentTime: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

const reelSchema = new mongoose.Schema({
    url: { type: String, required: true },
    likeCount: [Like.schema],
    userName: { type: String, required: true },
    profileUrl: { type: String },
    reelDescription: { type: String },
    musicName: { type: String },
    commentList: [commentSchema]
});

export default model('Reel', reelSchema);
