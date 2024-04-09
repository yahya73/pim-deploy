import { validationResult } from 'express-validator';
import Product from "../models/Product.js";
import {sendNotification} from "./notificationController.js"


// Controller function to create a new product
// Controller function to create a new product
export function addOnce(req, res) {
    // Check if there are validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Respond with 400 Bad Request and the validation errors
        return res.status(400).json({ errors: errors.array() });
    } else {
        // If there are no validation errors, create a new product
        Product.create({
            // Extracting product details from the request body
            SellerId: req.body.SellerId,
            ProductName: req.body.ProductName,
            image:req.body.image,
            Description: req.body.Description,
            Price: req.body.Price,
            Type: req.body.Type
        })
            .then((newProduct) => {
                // Respond with 201 Created and the created product details
                res.status(201).json({
                    SellerId: newProduct.SellerId,
                    ProductName: newProduct.ProductName,

                    Description: newProduct.Description,
                    Price: newProduct.Price,
                    Type: newProduct.Type
                });
            })
            .catch((err) => {
                console.log(err)
                // Respond with 500 Internal Server Error and the error details
                res.status(500).json({ error: err });
            });
    }
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


export async function deleteProduct(req, res) {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const message = {
            title: 'Product Deleted',
            body: `The product ${deletedProduct.productName} has been deleted`,
        };
        const token = global.tokendevice;
        await sendNotification(message, token);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

const addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
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
