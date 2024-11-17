// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route pour obtenir tous les produits
router.get('/', productController.getAllProducts);

// Route pour obtenir un produit par ID
router.get('/:id', productController.getProductById);

// Route pour ajouter un nouveau produit
router.post('/', productController.createProduct);

// Route pour mettre à jour un produit par ID
router.put('/:id', productController.updateProduct);

// Route pour supprimer un produit par ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
