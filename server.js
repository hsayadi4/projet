const express = require('express');
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// Simulation bases de données
let users = [
    { id: 1, name: 'User 1', email: 'user1@example.com' },
    { id: 2, name: 'User 2', email: 'user2@example.com' }
];

let products = [
    { id: 1, name: "Produit 1", price: 29.99, stock: 10 },
    { id: 2, name: "Produit 2", price: 39.99, stock: 5 },
    { id: 3, name: "Produit 3", price: 49.99, stock: 8 }
];

let carts = new Map(); // Stockage des paniers par userId

// ROUTES UTILISATEURS
// GET - Récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
    res.json(users);
});

// GET - Récupérer un utilisateur par ID
app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
});

// POST - Créer un nouvel utilisateur
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ message: 'Le nom et l\'email sont requis' });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

// PUT - Mettre à jour un utilisateur
app.put('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;

    res.json(user);
});

// DELETE - Supprimer un utilisateur
app.delete('/api/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    users.splice(userIndex, 1);
    res.json({ message: 'Utilisateur supprimé avec succès' });
});

// ROUTES PRODUITS ET PANIER
// Voir tous les produits
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Voir le panier d'un utilisateur
app.get('/api/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!carts.has(userId)) {
        carts.set(userId, []);
    }
    const cart = carts.get(userId);
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
        items: cart,
        total: parseFloat(total.toFixed(2))
    });
});

// Ajouter un produit au panier
app.post('/api/cart/:userId/add', (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
        return res.status(400).json({ message: 'ProductId requis' });
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    if (product.stock < quantity) {
        return res.status(400).json({ message: 'Stock insuffisant' });
    }
    
    if (!carts.has(userId)) {
        carts.set(userId, []);
    }
    
    const cart = carts.get(userId);
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId,
            name: product.name,
            price: product.price,
            quantity
        });
    }
    
    product.stock -= quantity;
    
    res.json({
        message: 'Produit ajouté au panier',
        cart: cart
    });
});

// Modifier la quantité d'un produit
app.put('/api/cart/:userId/update', (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;
    
    if (!carts.has(userId)) {
        return res.status(404).json({ message: 'Panier non trouvé' });
    }
    
    const cart = carts.get(userId);
    const cartItem = cart.find(item => item.productId === productId);
    
    if (!cartItem) {
        return res.status(404).json({ message: 'Produit non trouvé dans le panier' });
    }
    
    const product = products.find(p => p.id === productId);
    const quantityDiff = quantity - cartItem.quantity;
    
    if (quantityDiff > 0 && product.stock < quantityDiff) {
        return res.status(400).json({ message: 'Stock insuffisant' });
    }
    
    product.stock -= quantityDiff;
    cartItem.quantity = quantity;
    
    res.json({
        message: 'Panier mis à jour',
        cart: cart
    });
});

// Supprimer un produit du panier
app.delete('/api/cart/:userId/remove/:productId', (req, res) => {
    const userId = req.params.userId;
    const productId = parseInt(req.params.productId);
    
    if (!carts.has(userId)) {
        return res.status(404).json({ message: 'Panier non trouvé' });
    }
    
    const cart = carts.get(userId);
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
        return res.status(404).json({ message: 'Produit non trouvé dans le panier' });
    }
    
    const removedItem = cart[itemIndex];
    const product = products.find(p => p.id === productId);
    product.stock += removedItem.quantity;
    
    cart.splice(itemIndex, 1);
    
    res.json({
        message: 'Produit retiré du panier',
        cart: cart
    });
});

// Vider le panier
app.delete('/api/cart/:userId/clear', (req, res) => {
    const userId = req.params.userId;
    
    if (!carts.has(userId)) {
        return res.status(404).json({ message: 'Panier non trouvé' });
    }
    
    const cart = carts.get(userId);
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        product.stock += item.quantity;
    });
    
    carts.set(userId, []);
    
    res.json({
        message: 'Panier vidé',
        cart: []
    });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur est survenue !' });
});

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

