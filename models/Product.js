import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ProductSchema = new Schema({
    sellerId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

export default model('Product', ProductSchema);
