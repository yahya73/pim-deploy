import mongoose from "mongoose";

const { Schema, model } = mongoose;

const WishListSchema = new Schema({
    childId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    statut: {
        type: Boolean,
        required: true
    }
});

export default model('WishList', WishListSchema);
