import Product from "../models/Product.js";
import WishList from "../models/wishlist.js";


const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        console.log('fcffh'+products);
        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllProductswhished = async (req, res) => {
    const { childId } = req.params;
    try {
        const products = await Product.find({ childId });
      
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAllProductsdetails = async (req, res) => {
    const { childId } = req.params;
    try {
        // Find all wished products by childId
        const wishListProducts = await WishList.find({ childId });
        console.log(wishListProducts);
        // Initialize an array to store the detailed product information
        const detailedProducts = [];

        // Iterate over each wished product and find its details using the productId
        for (const wishListProduct of wishListProducts) {
            const productId = wishListProduct.productId;
            // Find the product details by productId
            const productDetails = await Product.findOne({ _id: productId });

            // Add the product details to the detailedProducts array
            detailedProducts.push(productDetails);

        }
               
        res.status(200).json(detailedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addWishedProduct = async (req, res) => {
    try {
        const newWishList = await WishList.create(req.body); // Renamed variable
        res.status(201).json(newWishList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deleteWishedProduct = async (req, res) => {
    try {
        const { childId, productId } = req.params;
        const deletedProduct = await WishList.findOneAndDelete({ childId, productId });
        if (!deletedProduct) {
            res.status(404).json({ message: 'Wished product not found' });
        } else {
            res.status(200).json({ message: 'Wished product deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateWishedProduct = async (req, res) => {
    try {
        const { childId, productId } = req.params; 
        const updatedWishList = await WishList.findOneAndUpdate(
            { childId, productId }, 
            { $set: { statut: true } }, 
            { new: true } 
        );
        if (!updatedWishList) {
            res.status(404).json({ message: 'Wished product not found' });
        } else {
            res.status(200).json(updatedWishList);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getWhishedProductById = async (req, res) => {
    try {
        const { childId, productId } = req.params;
        const wishedProduct = await WishList.findOne({ childId, productId });
        if (!wishedProduct) {
            res.status(404).json({ message: 'Wished product not found' });
        } else {
            res.status(200).json(wishedProduct);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getAllProducts,getAllProductswhished,addWishedProduct,deleteWishedProduct,updateWishedProduct,getWhishedProductById,getAllProductsdetails };
