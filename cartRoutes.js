// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Route pour afficher le contenu du panier
router.get('/', cartController.getCart);

// Route pour ajouter un produit au panier
router.post('/add', cartController.addToCart);

// Route pour retirer un produit du panier
router.post('/remove', cartController.removeFromCart);

// Route pour vider le panier
router.delete('/clear', cartController.clearCart);

module.exports = router;
