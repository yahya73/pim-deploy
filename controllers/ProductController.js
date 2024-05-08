import { validationResult } from 'express-validator';
import Product from "../models/product.js";
import {sendNotification,sendPaymentNotification,sendNotificationReact} from "./notificationController.js"
import User from '../models/User.js'; // Replace with the correct path to your User model file

import productTypes from '../models/productTypes.js';
import product from '../models/product.js';

export async function addOnce(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        // Create the product
        Product.create({
            sellerId: req.body.SellerId,
            productName: req.body.ProductName,
            image: req.body.Image,
            description: req.body.Description,
            price: req.body.Price,
            type: req.body.Type
        })
            .then((newProduct) => {
                res.status(201).json({
                    SellerId: newProduct.sellerId,
                    ProductName: newProduct.productName,
                    Description: newProduct.description,
                    Price: newProduct.price,
                    Type: newProduct.type
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    }
}

export async function getAllProductTypes(req, res) {
    const types = await productTypes.find();
    res.status(200).json({ productTypes: types });
}

// Controller function to get all products
export function getAll(req, res) {
    
    // Retrieve all products from the database
    Product.find()
        .then((products) => {
            // Respond with the array of products
            res.status(202).json(products);
        })
        .catch((err) => {
            // Respond with 500 Internal Server Error and the error details
            res.status(500).json({ error: err });
        });
}

// Controller function to get a product by ID
export function getOneById(req, res) {
    // Find the product by ID in the database
    Product.findById(req.params.id)
        .then((foundProduct) => {
            // Check if the product exists
            if (!foundProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            // Respond with the product details
            res.status(202).json(foundProduct);
        })
        .catch((err) => {
            // Respond with 500 Internal Server Error and the error details
            res.status(500).json({ error: err });
        });
}
// Controller function to delete a product by ID

export async function readnfc(req, res) {
    try {
        const { id, products, sellerId, amount } = req.body;
        
        // Find the user by rfid_tag
        const child = await User.findOne({ rfid_tag: id });
        const user = await User.findById(child.parentid);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user has fcmtokens
        if (!user.fcmtokens || user.fcmtokens.length === 0) {
            return res.status(404).json({ error: "FCM tokens not found for the user" });
        }

        // Call the sendPaymentNotification function with the user's fcmtokens
        await sendPaymentNotification(user.fcmtokens,products,sellerId,amount);

        // Send success response
        res.status(200).json({ message: "Payment notification sent successfully" });
    } catch (error) {
        console.error("Error sending payment notification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
export async function deleteProduct(req, res) {
    try {
        // Find the product and retrieve the sellerId
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const sellerId = product.sellerId;

        // Delete the product
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the user associated with the sellerId
        const user = await User.findById(sellerId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Retrieve FCM tokens from the user
        const tokens = user.fcmtokens || [];

        const message = {
            title: 'Product Deleted',
            body: `The product ${deletedProduct.productName} has been deleted`,
        };

        // Send notification to FCM tokens
        //sendPaymentNotification(tokens);
        // await sendNotification(message, tokens);
        await sendNotificationReact(message,tokens,sellerId);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}


const addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        // Check if the product type exists
        const productType = await productTypes.findOne({ type: req.body.type });
        console.log(productType)
        console.log("product type")
        if (!productType) {
            // If product type doesn't exist, create it
            console.log("added product type")
            await productTypes.create({ type: req.body.type });
        }
        res.status(201).json(product);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    const { sellerId } = req.params;
    try {
        const products = await Product.find({ sellerId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json(product);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product by ID
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json(product);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product by ID


export { addProduct, getAllProducts, getProductById, updateProduct };
